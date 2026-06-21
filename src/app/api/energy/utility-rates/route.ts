import 'server-only';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getSession();
    // Allow public access for the public calculator if needed, or require auth
    // We will allow public access since the public calculator uses it.

    const { searchParams } = new URL(request.url);
    const utilityCompanyId = searchParams.get('utilityCompanyId');
    const customerClass = searchParams.get('customerClass');

    const where: any = {};
    if (utilityCompanyId) where.utilityCompanyId = utilityCompanyId;
    if (customerClass) where.customerClass = customerClass;

    const [companies, rates] = await Promise.all([
      db.energyUtilityCompany.findMany({
        orderBy: { name: 'asc' },
      }),
      db.utilityRateSchedule.findMany({
        where,
        orderBy: { effectiveDate: 'desc' },
      }),
    ]);

    return NextResponse.json({ data: { companies, rates } });
  } catch (err) {
    console.error('[GET /api/energy/utility-rates]', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
