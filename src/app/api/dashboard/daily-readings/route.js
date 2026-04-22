import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db, createDailyReading, getDailyReadingsByUser, getActiveProperty, getAppliancesByClient, createAlert, getClientById } from '@/lib/db';
import { sendAnomalyAlertEmail } from '@/lib/email';
import { calculateAttribution } from '@/utils/attributionEngine';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const readings = await getDailyReadingsByUser(user.sub);
    return NextResponse.json({ success: true, readings });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { meterValue, date } = await request.json();
    if (meterValue === undefined || !date) {
      return NextResponse.json({ error: 'Missing meterValue or date' }, { status: 400 });
    }

    const val = parseFloat(meterValue);

    // 1. Fetch previous reading to calculate delta
    const previous = await db.dailyMeterReading.findFirst({
      where: { clientId: user.sub },
      orderBy: { date: 'desc' }
    });

    let kwhDelta = null;
    if (previous && val >= previous.meterValue) {
      kwhDelta = val - previous.meterValue;
    }

    // 2. Create the reading
    const reading = await createDailyReading({
      clientId: user.sub,
      meterValue: val,
      date,
      kwhDelta
    });

    // 3. Strict Mathematical Anomaly Analysis
    let alertDetails = null;
    if (kwhDelta !== null) {
      const activeProperty = await getActiveProperty(user.sub);
      const appliances = await getAppliancesByClient(user.sub, activeProperty?.id);
      
      const history = await getDailyReadingsByUser(user.sub);
      const validHistory = history.filter(h => h.kwhDelta !== null && h.id !== reading.id).slice(0, 7);
      
      if (validHistory.length >= 2) {
        const avg = validHistory.reduce((sum, h) => sum + h.kwhDelta, 0) / validHistory.length;
        
        // Spike trigger: strictly > 20% above 7-day average
        const threshold = avg * 1.2;
        
        if (kwhDelta > threshold) {
          const excessKwh = kwhDelta - avg;
          
          let culpritMatch = null;
          for (const app of appliances) {
            const kW = app.wattage ? app.wattage / 1000 : null;
            if (kW && kW > 0) {
              const hoursRunning = excessKwh / kW;
              // If mathematically reasonable (1 to 16 hours extra)
              if (hoursRunning >= 1 && hoursRunning <= 16) {
                culpritMatch = { app, hours: hoursRunning };
                break;
              }
            }
          }
          
          const alertMsg = culpritMatch 
            ? `⚠️ Daily average exceeded! (+${excessKwh.toFixed(1)} kWh). Recommendation: Check if an appliance was left unplugged (Matches your ${culpritMatch.app.name} running for ~${culpritMatch.hours.toFixed(1)} extra hrs).`
            : `⚠️ Daily average exceeded! (+${excessKwh.toFixed(1)} kWh). Recommendation: Check for left-on appliances or background phantom loads.`;

          alertDetails = alertMsg;

          await createAlert({
            client_id: user.sub,
            title: '💨 Daily Consumption Spike',
            message: alertMsg,
            severity: 'warning'
          });

          // Proactive Email Notification
          const clientProfile = await getClientById(user.sub);
          if (clientProfile?.emailAlertsEnabled && clientProfile?.email) {
            void sendAnomalyAlertEmail({
              email: clientProfile.email,
              name: clientProfile.name || 'OptiCore User',
              title: 'Daily Consumption Spike Detected',
              message: alertMsg,
              severity: 'warning'
            }).catch(e => console.error('[Daily Email Alert] Failed:', e));
          }
        }
      }
    }

    return NextResponse.json({ success: true, reading, alertDetails });

  } catch (error) {
    console.error('[Daily Readings API Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
