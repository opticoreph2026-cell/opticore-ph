import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);
    const propertyId = url.searchParams.get('propertyId');

    const whereClause: any = { clientId: user.sub as string };
    if (propertyId) whereClause.propertyId = propertyId;

    const bills = await db.bill.findMany({
      where: whereClause,
      include: { lineItems: true },
      orderBy: { billingPeriodStart: 'desc' }
    });

    const property = propertyId ? await db.property.findUnique({ where: { id: propertyId } }) : null;

    // Generate CSV data
    const headers = ['Property', 'Utility', 'Start Date', 'End Date', 'Amount Due (PHP)', 'Consumption', 'ERC/MWSS Verified'];
    const rows = bills.map((b: any) => [
      property ? property.name : 'All',
      b.utilityType,
      b.billingPeriodStart.toISOString().split('T')[0],
      b.billingPeriodEnd.toISOString().split('T')[0],
      (b.amountDue / 100).toFixed(2),
      b.consumption,
      b.ercVerified ? 'Yes' : 'No'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((r: any) => r.join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="tipidhub-report-${new Date().toISOString().split('T')[0]}.csv"`
      }
    });
  } catch (error) {
    console.error('Report GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
