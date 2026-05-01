import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';
import DashboardClient from '@/components/dashboard/bento/DashboardClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Overview — OptiCore PH' };

export default async function DashboardPage() {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  // Fetch Fallback Data for SWR
  const activeProperty = await db.property.findFirst({
    where: { clientId: jwtUser.sub, isDefault: true }
  });
  const propertyId = activeProperty?.id;

  const [readings, unreadAlertCount, latestReport, lpgStatus, activePropertyRecord] = await Promise.all([
    db.utilityReading.findMany({
      where: { clientId: jwtUser.sub, ...(propertyId ? { propertyId } : {}) },
      orderBy: { readingDate: 'desc' },
      take: 12,
      select: { readingDate: true, kwhUsed: true, billAmountElectric: true, m3Used: true, billAmountWater: true }
    }),
    db.alert.count({ where: { clientId: jwtUser.sub, isRead: false } }),
    db.aIReport.findFirst({
      where: { clientId: jwtUser.sub, ...(propertyId ? { propertyId } : {}) },
      orderBy: { generatedAt: 'desc' },
      select: { summary: true }
    }),
    db.lPGReading.findFirst({
      where: { clientId: jwtUser.sub, ...(propertyId ? { propertyId } : {}) },
      orderBy: { replacementDate: 'desc' }
    }),
    db.property.findUnique({ where: { id: propertyId } })
  ]);

  const currentHour = new Date().getHours();
  let gridStatus = { status: 'NORMAL', penalty: 0 };
  if (currentHour >= 14 && currentHour <= 16) {
    gridStatus = { status: 'YELLOW', penalty: 40 };
  } else if (currentHour === 13) {
    gridStatus = { status: 'RED', penalty: 100 };
  }

  const latest = readings[0] || {};
  const previous = readings[1] || {};

  const currentBill = (latest.billAmountElectric ?? 0) + (latest.billAmountWater ?? 0);
  const prevBill = (previous.billAmountElectric ?? 0) + (previous.billAmountWater ?? 0);

  const kpiData = {
    currentMonthKwh: latest.kwhUsed ?? 0,
    currentMonthBill: currentBill,
    effectiveRate: latest.kwhUsed > 0 ? (latest.billAmountElectric / latest.kwhUsed) : 0,
    momChangePct: prevBill > 0 ? (((currentBill - prevBill) / prevBill) * 100) : null,
    currentMonthM3: latest.m3Used ?? 0,
    lpgPercentLeft: lpgStatus?.tankSizeKg ? 100 : null,
    ghostLoadPct: null,
    activeAlertCount: unreadAlertCount
  };

  const deduplicatedReadings = [];
  const seenMonths = new Set();
  for (const r of readings) {
    const month = new Date(r.readingDate).toISOString().substring(0, 7);
    if (!seenMonths.has(month)) {
      deduplicatedReadings.push(r);
      seenMonths.add(month);
    }
    if (deduplicatedReadings.length >= 6) break;
  }

  const fallbackData = {
    readings: deduplicatedReadings.reverse(),
    latestReport: latestReport?.summary || null,
    unreadAlertCount,
    userProfile: { 
      name: jwtUser.name, 
      plan: jwtUser.plan, 
      property: activePropertyRecord?.name || 'Main Property' 
    },
    gridStatus,
    kpiData
  };

  return <DashboardClient fallbackData={fallbackData} />;
}
