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
    const { category, ...data } = body;

    if (!category || !data.modelName || !data.sku) {
      return NextResponse.json({ error: 'category, modelName, and sku are required' }, { status: 400 });
    }

    let result: any;
    if (category === 'inverter') {
      result = await db.productInverter.create({
        data: {
          sku: data.sku,
          modelName: data.modelName,
          ratedAcKw: data.ratedAcKw || 0,
          maxPvInputKw: data.maxPvInputKw || 0,
          unitPriceCentavos: data.unitPriceCentavos || 0,
          phase: data.phase || 1,
          family: data.family || 'single_phase_aio',
          transferTimeMs: data.transferTimeMs || 20,
        },
        select: { id: true, modelName: true, sku: true, unitPriceCentavos: true },
      });
    } else if (category === 'battery') {
      result = await db.productBattery.create({
        data: {
          sku: data.sku,
          modelName: data.modelName,
          nominalKwh: data.nominalKwh || 0,
          usableKwh: data.usableKwh || 0,
          unitPriceCentavos: data.unitPriceCentavos || 0,
        },
        select: { id: true, modelName: true, sku: true, unitPriceCentavos: true },
      });
    } else if (category === 'panel') {
      result = await db.solarPanel.create({
        data: {
          sku: data.sku,
          modelName: data.modelName,
          wattage: data.wattage || 0,
          efficiencyPct: data.efficiencyPct || 0,
          unitPriceCentavos: data.unitPriceCentavos || 0,
        },
        select: { id: true, modelName: true, sku: true, unitPriceCentavos: true },
      });
    } else {
      return NextResponse.json({ error: 'Invalid category' }, { status: 400 });
    }

    return NextResponse.json({ data: result }, { status: 201 });
  } catch (err) {
    console.error('[POST /api/admin/products]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
