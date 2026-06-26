import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const provinceId = request.nextUrl.searchParams.get('provinceId');
    const search = request.nextUrl.searchParams.get('search');

    const where: any = {};
    if (provinceId) where.provinceId = provinceId;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const cities = await db.philippineCity.findMany({
      where,
      orderBy: { name: 'asc' },
      select: { id: true, name: true, isCity: true, provinceId: true },
      take: 50,
    });

    return NextResponse.json({ data: cities });
  } catch (err) {
    console.error('[GET /api/data/cities]', err);
    return NextResponse.json({ error: 'Failed to fetch cities' }, { status: 500 });
  }
}
