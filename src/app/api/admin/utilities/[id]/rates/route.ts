import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isOptcoreOwner } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreOwner(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;

    const utility = await db.energyUtilityCompany.findUnique({ where: { id }, select: { id: true } });
    if (!utility) {
      return NextResponse.json({ error: 'Utility not found' }, { status: 404 });
    }

    const body = await request.json();
    const { allInRateRu, bgcRateRu, customerClass, effectiveDate } = body;

    if (typeof allInRateRu !== 'number' || allInRateRu <= 0) {
      return NextResponse.json({ error: 'Invalid all-in rate' }, { status: 422 });
    }
    if (typeof bgcRateRu !== 'number' || bgcRateRu < 0) {
      return NextResponse.json({ error: 'Invalid BGC rate' }, { status: 422 });
    }

    const rate = await db.utilityRateSchedule.create({
      data: {
        utilityCompanyId: id,
        customerClass: customerClass || 'residential',
        effectiveDate: effectiveDate ? new Date(effectiveDate) : new Date(),
        allInRateRu,
        blendedGenerationRateRu: bgcRateRu,
        transmissionRateRu: 0,
        distributionRateRu: 0,
      },
      select: {
        id: true,
        allInRateRu: true,
        blendedGenerationRateRu: true,
        customerClass: true,
        effectiveDate: true,
      },
    });

    return NextResponse.json({ data: rate });
  } catch (err) {
    console.error('[POST /api/admin/utilities/[id]/rates]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
