import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { canAccessCrm } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');

    const where: any = {};
    if (customerId) where.customerId = customerId;

    const quotations = await db.energyQuotation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { fullName: true } },
        design: { select: { versionName: true } },
        preparedBy: { select: { fullName: true } },
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
    const {
      customerId,
      designId,
      roiId,
      validUntil,
      subtotalCentavos,
      discountCentavos,
      totalCentavos,
      paymentTerms, // JSON string
      termsAndConditions,
      status,
    } = body;

    if (!customerId || !designId) {
      return NextResponse.json({ error: 'customerId and designId are required' }, { status: 400 });
    }

    const quotation = await db.energyQuotation.create({
      data: {
        customerId,
        designId,
        roiId,
        preparedById: session.sub,
        validUntil: validUntil ? new Date(validUntil) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
        subtotalCentavos: subtotalCentavos || 0,
        discountCentavos: discountCentavos || 0,
        totalCentavos: totalCentavos || 0,
        paymentTerms: paymentTerms ? JSON.stringify(paymentTerms) : '[]',
        termsAndConditions: termsAndConditions || '',
        status: status || 'draft',
      },
    });

    return NextResponse.json({ data: quotation }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/energy/quotations]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
