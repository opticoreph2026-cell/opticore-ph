import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const electricRates = await db.eRCRate.findMany({
      select: { duCode: true },
      distinct: ['duCode']
    });

    const waterRates = await db.waterRate.findMany({
      select: { utilityCode: true },
      distinct: ['utilityCode']
    });

    const providers = {
      electric: electricRates.map((r: any) => r.duCode).sort(),
      water: waterRates.map((r: any) => r.utilityCode).sort(),
      fuel: ['LPG', 'Diesel', 'Gasoline']
    };

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Providers GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
