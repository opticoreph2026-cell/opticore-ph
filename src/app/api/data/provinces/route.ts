import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const provinces = await db.philippineProvince.findMany({
      orderBy: { name: 'asc' },
      select: { id: true, name: true, region: true },
    });
    return NextResponse.json({ data: provinces });
  } catch (err) {
    console.error('[GET /api/data/provinces]', err);
    return NextResponse.json({ error: 'Failed to fetch provinces' }, { status: 500 });
  }
}
