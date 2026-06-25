import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { isOptcoreOwner } from '@/lib/energy-auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreOwner(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();

    if (body.status === true) body.status = 'active';
    else if (body.status === false) body.status = 'inactive';

    const org = await db.energyOrganization.update({
      where: { id },
      data: body,
      select: { id: true, name: true, type: true, status: true },
    });

    return NextResponse.json({ data: org });
  } catch (err) {
    console.error('[PATCH /api/admin/organizations/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
