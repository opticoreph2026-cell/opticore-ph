import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { canAccessCrm } from '@/lib/energy-auth';
import { updateQuotationSchema, isValidQuotationTransition } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
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
        design: {
          include: {
            inverter: true,
            battery: true
          }
        },
        roiScenario: true,
      },
    });

    if (!quotation) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ data: quotation });
  } catch (err) {
    console.error('[GET /api/energy/quotations/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    const parsed = updateQuotationSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const existing = await db.energyQuotation.findUnique({ where: { id }, select: { status: true } });
    if (!existing) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    if (parsed.data.status && !isValidQuotationTransition(existing.status, parsed.data.status)) {
      return NextResponse.json({
        error: `Cannot transition from '${existing.status}' to '${parsed.data.status}'`,
      }, { status: 422 });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.status === 'sent') {
      updateData.sentAt = new Date();
    }
    if (updateData.status === 'accepted' || updateData.status === 'rejected') {
      updateData.respondedAt = new Date();
    }

    const quotation = await db.energyQuotation.update({
      where: { id },
      data: updateData,
    });

    if (parsed.data.status === 'sent') {
      db.adminNotification.create({
        data: {
          type: 'project',
          title: 'Quotation Sent',
          message: `Quotation ${quotation.quoteNumber} has been sent to the customer`,
          meta: JSON.stringify({ href: `/admin/energy/quotations` }),
        },
      }).catch(() => {});
    }

    return NextResponse.json({ data: quotation });
  } catch (err) {
    console.error('[PATCH /api/energy/quotations/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !canAccessCrm(session as any)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    await db.energyQuotation.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/energy/quotations/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
