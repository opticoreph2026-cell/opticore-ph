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
        design: { include: { inverter: true, battery: true } },
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
      ? `${quotation.design.battery.usableKwh} kWh`
      : 'N/A';
    const solarCap = quotation.design?.pvArrayKwp
      ? `${quotation.design.pvArrayKwp} kWp`
      : 'N/A';
    const systemCost = quotation.grandTotalCentavos / 100;

    // Default ROI values — use parsed results if available
    let year1Savings = 0;
    let lifetimeSavings = 0;
    let paybackYears = 0;

    if (quotation.roiScenario?.parsedResults) {
      const r = quotation.roiScenario.parsedResults as any;
      year1Savings = Math.round((r.year1SavingsCentavos ?? 0) / 100);
      lifetimeSavings = Math.round(
        ((r.npvCentavos ?? r.headline?.npvCentavos ?? 0) + systemCost * 100) / 100
      );
      paybackYears = r.simplePaybackYears ?? r.headline?.simplePaybackYears ?? 0;
    }

    const stream = await renderToStream(
      <ProposalPDF
        customerName={customerName}
        address={address}
        inverterModel={inverterModel}
        batteryCap={batteryCap}
        solarCap={solarCap}
        systemCost={systemCost}
        year1Savings={year1Savings}
        lifetimeSavings={lifetimeSavings}
        paybackYears={paybackYears}
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
