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

    const { category, ...data } = body;

    let result: any;
    if (category === 'inverter') {
      result = await db.productInverter.update({ where: { id }, data, select: { id: true, modelName: true, sku: true, unitPrice: true, isPriceConfirmed: true } });
    } else if (category === 'battery') {
      result = await db.productBattery.update({ where: { id }, data, select: { id: true, modelName: true, sku: true, unitPrice: true, isPriceConfirmed: true } });
    } else if (category === 'panel') {
      result = await db.solarPanel.update({ where: { id }, data, select: { id: true, modelName: true, sku: true, unitPrice: true, isPriceConfirmed: true } });
    } else {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ data: result });
  } catch (err) {
    console.error('[PATCH /api/admin/products/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session || !isOptcoreOwner(session as any)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');

    if (!category) {
      return NextResponse.json({ error: 'category query param required' }, { status: 400 });
    }

    if (category === 'inverter') {
      await db.productInverter.delete({ where: { id } });
    } else if (category === 'battery') {
      await db.productBattery.delete({ where: { id } });
    } else if (category === 'panel') {
      await db.solarPanel.delete({ where: { id } });
    } else {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[DELETE /api/admin/products/[id]]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
