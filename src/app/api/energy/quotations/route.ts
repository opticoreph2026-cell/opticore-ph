import 'server-only';

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { createQuotationSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function generateQuoteNumber(): string {
  const year = new Date().getFullYear();
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `OCE-${year}-${seq}`;
}

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const designId = searchParams.get('designId');

    const where: { customerId?: string; designId?: string } = {};
    if (customerId) where.customerId = customerId;
    if (designId) where.designId = designId;

    const quotations = await db.energyQuotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        design: { select: { pvArrayKwp: true, designPathway: true } },
        roiScenario: { select: { scenarioLabel: true } },
      },
    });

    return NextResponse.json({ data: quotations });
  } catch (err) {
    console.error('[GET /api/energy/quotations]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = createQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { customerId, designId, roiScenarioId, hardwareSubtotalCentavos, installationFeeCentavos, designFeeCentavos, grandTotalCentavos, validUntil, notes } = parsed.data;

    const quotation = await db.energyQuotation.create({
      data: {
        customerId,
        designId,
        roiScenarioId: roiScenarioId ?? null,
        quoteNumber: generateQuoteNumber(),
        validUntil: validUntil
          ? new Date(validUntil)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        hardwareSubtotalCentavos: hardwareSubtotalCentavos ?? 0,
        installationFeeCentavos: installationFeeCentavos ?? 0,
        designFeeCentavos: designFeeCentavos ?? 0,
        grandTotalCentavos: grandTotalCentavos ?? 0,
        depositRequiredPct: 50,
        status: 'draft',
        notes: notes ?? null,
      },
    });

    return NextResponse.json({ data: quotation }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/quotations]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
