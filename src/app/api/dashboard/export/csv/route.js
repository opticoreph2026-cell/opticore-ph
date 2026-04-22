export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, getReadingsByClient, ensureDefaultProperty } from '@/lib/db';

export async function GET(request) {
  try {
    const user = await getCurrentUser();
    if (!user) return new NextResponse('Unauthorized', { status: 401 });

    const client = await getClientById(user.sub);
    const plan = client?.planTier ?? 'starter';

    if (plan === 'starter') {
      return new NextResponse('Upgrade to Pro to export CSV data.', { status: 403 });
    }

    const activeProperty = await ensureDefaultProperty(client.id);
    const readings = await getReadingsByClient(client.id, activeProperty.id);

    // Build CSV
    const rows = [
      ['Date', 'Electric kWh', 'Electric Bill PHP', 'Water m3', 'Water Bill PHP', 'Effective Rate']
    ];

    readings.forEach(r => {
      rows.push([
        r.readingDate || '',
        r.kwhUsed || 0,
        r.billAmountElectric || 0,
        r.m3Used || 0,
        r.billAmountWater || 0,
        r.effectiveRate || ''
      ]);
    });

    const csvContent = rows.map(r => r.join(',')).join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="opticore_export.csv"`,
      }
    });

  } catch (error) {
    console.error('[CSV Export] Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
