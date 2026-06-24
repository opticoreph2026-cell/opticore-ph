import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isOptcoreOwner } from '@/lib/energy-auth';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreOwner(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();

    if (!body.code || !body.name) {
      return NextResponse.json({ error: 'code and name are required' }, { status: 400 });
    }

    const utility = await db.energyUtilityCompany.create({
      data: {
        code: body.code,
        name: body.name,
        territory: body.territory || null,
        netMeteringApplicationUrl: body.netMeteringApplicationUrl || null,
        defaultProcessingDays: body.defaultProcessingDays || 60,
        dimcFeeCapCentavos: body.dimcFeeCapCentavos || 300000,
      },
      select: { id: true, name: true, code: true, territory: true },
    });

    return NextResponse.json({ data: utility }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/utilities]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
