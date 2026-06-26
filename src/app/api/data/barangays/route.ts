import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const cityId = request.nextUrl.searchParams.get('cityId');
    const search = request.nextUrl.searchParams.get('search');

    const where: any = {};
    if (cityId) where.cityId = cityId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const barangays = await db.philippineBarangay.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, cityId: true },
      take: 100,
    });

    return NextResponse.json({ data: barangays }, {
      headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400' },
    });
  } catch (err) {
    console.error('[GET /api/data/barangays]', err);
    return NextResponse.json({ error: 'Failed to fetch barangays' }, { status: 500 });
  }
}
