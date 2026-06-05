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

    // Get bills for the last 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentBills = await db.bill.findMany({
      where: {
        ...whereClause,
        billingPeriodStart: { gte: sixMonthsAgo }
      },
      orderBy: { billingPeriodStart: 'asc' }
    });

    const recentFuelLogs = await db.fuelLog.findMany({
      where: {
        ...whereClause,
        logDate: { gte: sixMonthsAgo }
      },
      orderBy: { logDate: 'asc' }
    });

    // Aggregate spending by month
    const monthlySpending: Record<string, { month: string; electric: number; water: number; fuel: number; total: number }> = {};

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toISOString().substring(0, 7); // YYYY-MM
      monthlySpending[key] = { month: key, electric: 0, water: 0, fuel: 0, total: 0 };
    }

    // Process bills
    recentBills.forEach((bill: any) => {
      const key = bill.billingPeriodStart.toISOString().substring(0, 7);
      if (monthlySpending[key]) {
        if (bill.utilityType === 'electric') monthlySpending[key].electric += bill.amountDue;
        if (bill.utilityType === 'water') monthlySpending[key].water += bill.amountDue;
        monthlySpending[key].total += bill.amountDue;
      }
    });

    // Process fuel logs
    recentFuelLogs.forEach((log: any) => {
      const key = log.logDate.toISOString().substring(0, 7);
      if (monthlySpending[key]) {
        monthlySpending[key].fuel += log.totalCost;
        monthlySpending[key].total += log.totalCost;
      }
    });

    const chartData = Object.values(monthlySpending);

    // Calculate current month total
    const currentMonthKey = new Date().toISOString().substring(0, 7);
    const currentMonthTotal = monthlySpending[currentMonthKey]?.total || 0;

    return NextResponse.json({ 
      data: {
        chartData,
        currentMonthTotal,
        totalBillsCount: recentBills.length,
        totalFuelLogsCount: recentFuelLogs.length
      }
    });
  } catch (error) {
    console.error('Dashboard Data GET Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
