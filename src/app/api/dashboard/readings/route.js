import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { createReading, createReport, getAppliancesByClient, createAlert, getClientById, getReadingsByClient, getActiveProperty } from '@/lib/db';
import { sendMonthlyDigestEmail, sendAnomalyAlertEmail } from '@/lib/email';
import { GoogleGenAI } from '@google/genai';
import { calculateAttribution } from '@/utils/attributionEngine';
import { analyzeWaterUsage } from '@/lib/algorithms/waterAnalyzer';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      readingDate, kwhUsed, billAmountElectric, m3Used, billAmountWater, providerContext,
      // Unbundled fields (from AI bill parsing)
      generation_charge, transmission_charge, system_loss, distribution_charge,
      subsidies, government_tax, vat, other_charges,
      source_type, provider_detected, billing_period,
    } = body;

    if (!readingDate || !kwhUsed || !billAmountElectric) {
      return NextResponse.json({ error: 'Missing required reading parameters' }, { status: 400 });
    }

    // 0. Check for existing reading for this date to prevent duplicates
    const activeProperty = await getActiveProperty(user.sub);
    const existingReadings = await getReadingsByClient(user.sub, activeProperty?.id);
    const isDuplicate = existingReadings.some(r => r.readingDate === readingDate);

    if (isDuplicate) {
      return NextResponse.json({ 
        error: 'DUPLICATE_ENTRY', 
        message: `A reading for ${readingDate} already exists. To update it, please delete the old record first.` 
      }, { status: 409 });
    }

    // 1. Math calculation for Effective Rate
    const kwh = parseFloat(kwhUsed) || 0;
    const bill = parseFloat(billAmountElectric) || 0;
    const m3Float = parseFloat(m3Used) || 0;
    const waterBill = parseFloat(billAmountWater) || 0;
    const effectiveRate = kwh > 0 ? (bill / kwh).toFixed(2) : 0;

    // 2. Fetch User Profile and Appliances concurrently
    const [clientProfile, appliances] = await Promise.all([
      getClientById(user.sub),
      getAppliancesByClient(user.sub, null)
    ]);
    
    // We fetch appliances by active property
    const propertyAppliances = appliances.filter(a => a.propertyId === activeProperty?.id);

    // 3. Construct intelligent AI Prompt with the structured Context
    const applianceListStr = propertyAppliances.length > 0
      ? propertyAppliances.map(a => `- ${a.quantity || 1}x ${a.year || 'Unknown year'} ${a.brand || ''} ${a.name} (${a.wattage ? a.wattage + 'W per unit' : 'Unknown wattage'}, used ~${a.hoursPerDay || '?'} hrs/day)`).join('\n')
      : 'No appliances profiled yet.';

    const systemPrompt = `You are OptiCore PH, an elite AI utility auditor analyzing a Philippine household.
    
    FACTUAL DATA FOR THIS MONTH:
    Electricity Provider: ${providerContext || 'Unknown'}
    Total Consumption: ${kwh} kWh
    Total Bill: ₱${bill.toLocaleString()}
    Effective Rate Calculated: ₱${effectiveRate} per kWh.
    
    APPLIANCE PROFILE (Multiply wattage by quantity for total consumption per type):
    ${applianceListStr}
    
    TASK:
    1. Write a 2-sentence SUMMARY of their efficiency and if their effective rate of ₱${effectiveRate}/kWh is normal for ${providerContext}.
    2. Write EXACTLY 5 action-oriented Recommendations to lower their bill next month. Base this specifically on their profiled appliances if available (look for vampire loads, or calculate ROI for replacing old AC/Ref). **Account for appliance quantities in your analysis.**
    3. Estimate how much they could theoretically save (in PHP) if they follow all steps. Format exactly like this on its own line: 'ESTIMATED_SAVINGS: 450'
    
    Output format:
    SUMMARY: [Your 2 sentence summary]
    RECOMMENDATIONS:
    - [Rec 1]
    - [Rec 2]
    ...
    ESTIMATED_SAVINGS: [number]
    `;

    // 4. Fire directly to Gemini
    let rawContent = "";
    try {
      const result = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: systemPrompt,
        config: { temperature: 0.2 }
      });
      rawContent = result.candidates?.[0]?.content?.parts?.[0]?.text || "";
    } catch (aiErr) {
      console.error('[OptiCore AI] Analysis Engine Error:', aiErr);
    }

    // Parse Response
    let summaryMatch = rawContent.match(/SUMMARY:\s*(.*?)(?=RECOMMENDATIONS:)/is);
    let recommendationsMatch = rawContent.match(/RECOMMENDATIONS:\s*(.*?)(?=ESTIMATED_SAVINGS:)/is);
    let savingsMatch = rawContent.match(/ESTIMATED_SAVINGS:\s*([0-9.,]+)/i);

    const summary = summaryMatch ? summaryMatch[1].trim() : "Analysis complete.";
    const recommendations = recommendationsMatch ? recommendationsMatch[1].trim() : rawContent;
    const savings = savingsMatch ? parseFloat(savingsMatch[1].replace(/,/g, '')) : 0;

    // 5. Database Save Operations
    const reading = await createReading({
      client_id: user.sub,
      reading_date: readingDate,
      kwh_used: kwh,
      m3_used: m3Float,
      bill_amount_electric: bill,
      bill_amount_water: waterBill,
      // Unbundled charges (null if manual entry)
      generation_charge,
      transmission_charge,
      system_loss,
      distribution_charge,
      subsidies,
      government_tax,
      vat,
      other_charges,
      source_type: source_type || 'manual',
      provider_detected,
      billing_period,
      property_id: activeProperty?.id,
    });

    const report = await createReport({
      client_id: user.sub,
      summary: summary,
      recommendations: recommendations,
      estimated_savings: savings,
      provider_context: providerContext,
      property_id: activeProperty?.id,
    });

    // 6. Plan-based Attribution and Anomaly engine
    const plan = clientProfile?.planTier || 'starter';
    try {
      const freshReadings = await getReadingsByClient(user.sub, activeProperty?.id);
      // Bug #6 fix: find prev reading by explicitly excluding the new reading's ID
      const prevReading = freshReadings.find(r => r.id !== reading.id);

    if (plan !== 'starter' && propertyAppliances.length > 0 && kwh > 0) {
      try {
        const attribution = calculateAttribution(kwh, propertyAppliances);

        if (attribution.severity === 'CRITICAL') {
          await createAlert({
            client_id: user.sub,
            title: '🚨 Critical Ghost Load Detected',
            message: `${attribution.discrepancy.percentage}% of your electricity (${attribution.discrepancy.value} kWh) is unaccounted for by your profiled appliances. This is severe — consider an immediate energy audit.`,
            severity: 'critical',
          });
          if (clientProfile?.emailAlertsEnabled && clientProfile?.email) {
            sendAnomalyAlertEmail({
              email: clientProfile.email,
              name: clientProfile.name,
              title: 'Critical Ghost Load Detected',
              message: `${attribution.discrepancy.percentage}% of your electricity (${attribution.discrepancy.value} kWh) is unaccounted for by your profiled appliances. This is severe — consider an immediate energy audit.`,
              severity: 'critical'
            }).catch(e => console.error('Failed sending anomaly email:', e));
          }
        } else if (attribution.severity === 'LEAKING') {
          await createAlert({
            client_id: user.sub,
            title: '⚠️ Elevated Ghost Load',
            message: `${attribution.discrepancy.percentage}% of your electricity (${attribution.discrepancy.value} kWh) is unaccounted for. Check for standby loads or undeclared appliances.`,
            severity: 'warning',
          });
          if (clientProfile?.emailAlertsEnabled && clientProfile?.email) {
            sendAnomalyAlertEmail({
              email: clientProfile.email,
              name: clientProfile.name,
              title: 'Elevated Ghost Load',
              message: `${attribution.discrepancy.percentage}% of your electricity (${attribution.discrepancy.value} kWh) is unaccounted for. Check for standby loads or undeclared appliances.`,
              severity: 'warning'
            }).catch(e => console.error('Failed sending anomaly email:', e));
          }
        }
      } catch (attrErr) {
        console.error('[Attribution Engine] Error:', attrErr);
      }
    }

      // Month-over-month spike detection
      if (prevReading && prevReading.kwhUsed > 0) {
        try {
          const spikePct = ((kwh - prevReading.kwhUsed) / prevReading.kwhUsed) * 100;
          if (spikePct > 20) {
            const severityLvl = spikePct > 40 ? 'critical' : 'warning';
            await createAlert({
              client_id: user.sub,
              title: '📈 Consumption Spike Detected',
              message: `Your electricity usage jumped ${spikePct.toFixed(0)}% vs last month (${prevReading.kwhUsed} → ${kwh} kWh). Review high-consumption appliances.`,
              severity: severityLvl,
            });
            if (clientProfile?.emailAlertsEnabled && clientProfile?.email) {
              sendAnomalyAlertEmail({
                email: clientProfile.email,
                name: clientProfile.name,
                title: 'Consumption Spike Detected',
                message: `Your electricity usage jumped ${spikePct.toFixed(0)}% vs last month (${prevReading.kwhUsed} → ${kwh} kWh). Review high-consumption appliances.`,
                severity: severityLvl
              }).catch(e => console.error('Failed sending anomaly email:', e));
            }
          }
        } catch (spikeErr) {
          console.error('[Spike Engine] Error:', spikeErr);
        }
      }
    } catch (dbErr) {
      console.error('[Dashboard Engine] Secondary context error:', dbErr);
    }

    // 7. Water Leak detection (PRO only)
    if (plan !== 'starter' && m3Float > 0) {
      await analyzeWaterUsage(user.sub, activeProperty?.id).catch(err => {
        console.error('[Water Analyzer Engine] Error:', err);
      });
    }

    // 8. High effective rate alert
    if (parseFloat(effectiveRate) > 16.00) {
      try {
        await createAlert({
          client_id: user.sub,
          title: 'High Effective Rate Detected',
          message: `Your effective rate of ₱${effectiveRate}/kWh is abnormally high. Check your bill for surcharges or penalties.`,
          severity: 'warning'
        });
      } catch (alertErr) {
        console.error('[Alert Engine] High Rate Error:', alertErr);
      }
    }

    // 9. Send the HTML digest email ONLY for Pro/Business users
    if (plan !== 'starter' && clientProfile?.email) {
      void sendMonthlyDigestEmail({
        email: clientProfile.email,
        name: clientProfile.name || 'User',
        readingDate,
        summary,
        recommendations,
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, readingId: reading.id, reportId: report.id }, { status: 200 });

  } catch (error) {
    console.error('Submission Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
