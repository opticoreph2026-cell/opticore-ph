import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { renderToStream } from '@react-pdf/renderer';
import { ProposalPDF } from '@/lib/pdf/proposal-template';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const quotation = await db.energyQuotation.findUnique({
      where: { id },
      include: {
        customer: true,
        design: { include: { inverter: true, battery: true, panelModel: true } },
        roiScenario: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const customerName = quotation.customer?.fullName ?? 'Unknown';
    const address = quotation.customer?.siteAddress ?? 'N/A';
    const inverterModel = quotation.design?.inverter?.modelName ?? 'N/A';
    const batteryCap = quotation.design?.battery
      ? `${quotation.design.battery.usableKwh} kWh LFP`
      : 'N/A';
    const solarCap = quotation.design?.pvArrayKwp
      ? `${quotation.design.pvArrayKwp} kWp`
      : 'N/A';
    const panelCount = quotation.design?.pvPanelCount
      ? `${quotation.design.pvPanelCount} × ${quotation.design.pvPanelWattage}W`
      : 'N/A';
    const systemCost = quotation.grandTotalCentavos / 100;
    const hardwareCost = quotation.hardwareSubtotalCentavos / 100;
    const installationFee = quotation.installationFeeCentavos / 100;
    const designFee = quotation.designFeeCentavos / 100;
    const depositPct = quotation.depositRequiredPct;
    const validUntil = new Date(quotation.validUntil).toLocaleDateString('en-PH', {
      month: 'long', day: 'numeric', year: 'numeric',
    });

    let year1Savings = 0;
    let lifetimeSavings = 0;
    let paybackYears = 0;
    let irr = 0;

    if (quotation.roiScenario) {
      let results: any = quotation.roiScenario.resultsJson;
      if (typeof results === 'string') {
        try { results = JSON.parse(results); } catch { results = null; }
      }
      if (results) {
        year1Savings = Math.round((results.year1SavingsCentavos ?? results.headline?.year1SavingsCentavos ?? 0) / 100);
        lifetimeSavings = Math.round((results.npvCentavos ?? results.headline?.npvCentavos ?? 0) / 100);
        paybackYears = results.simplePaybackYears ?? results.headline?.simplePaybackYears ?? 0;
        irr = results.irr ?? results.headline?.irr ?? 0;
      }
    }

    const stream = await renderToStream(
      <ProposalPDF
        quoteNumber={quotation.quoteNumber}
        customerName={customerName}
        address={address}
        inverterModel={inverterModel}
        batteryCap={batteryCap}
        solarCap={solarCap}
        panelCount={panelCount}
        systemCost={systemCost}
        hardwareCost={hardwareCost}
        installationFee={installationFee}
        designFee={designFee}
        depositPct={depositPct}
        validUntil={validUntil}
        year1Savings={year1Savings}
        lifetimeSavings={lifetimeSavings}
        paybackYears={paybackYears}
        irr={irr}
      />
    );

    const chunks: Buffer[] = [];
    for await (const chunk of stream as unknown as AsyncIterable<Buffer>) {
      chunks.push(chunk);
    }
    const pdfBuffer = Buffer.concat(chunks);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${quotation.quoteNumber}.pdf"`,
      },
    });
  } catch (err) {
    console.error('[GET /api/energy/quotations/[id]/pdf]', err);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}
