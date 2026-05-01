import { db, ensureDefaultProperty, migrateLegacyDataToProperty } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardOverview from '@/components/dashboard/Overview';
import { predictLPGDepletion } from '@/lib/algorithms/lpgPredictor';
import { analyzeWaterUsage } from '@/lib/algorithms/waterAnalyzer';

/**
 * OptiCore PH - Dashboard Overview (app/dashboard/page.js)
 * Fix: AIReport is now fetched as a separate query — readings[0]?.report
 * never existed on the UtilityReading model and always returned null.
 */
export const dynamic = 'force-dynamic';
export const metadata = { title: 'Dashboard — OptiCore PH' };

export default async function DashboardPage({ searchParams }) {
  // 1. Session Guard
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  try {
    // 2. Fetch and migrate to active property scoping
    const activeProperty = await ensureDefaultProperty(jwtUser.sub);
    await migrateLegacyDataToProperty(jwtUser.sub, activeProperty.id);

    // 3. Parallel data fetch — Scoped by active property
    const [readings, alerts, appliances, clientRecord, latestReport] = await Promise.all([
      db.utilityReading.findMany({
        where: { clientId: jwtUser.sub, propertyId: activeProperty.id },
        orderBy: { readingDate: 'desc' },
        take: 12,
        select: {
          id: true, readingDate: true,
          kwhUsed: true, m3Used: true,
          billAmountElectric: true, billAmountWater: true,
          effectiveRate: true, generationCharge: true, distributionCharge: true
        }
      }),
      db.alert.findMany({
        where: { clientId: jwtUser.sub, isRead: false },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, type: true, message: true, createdAt: true }
      }),
      db.appliance.findMany({
        where: { clientId: jwtUser.sub, propertyId: activeProperty.id },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, name: true, wattage: true, hoursPerDay: true, 
          category: true, energyRating: true, quantity: true
        }
      }),
      db.client.findUnique({ 
        where: { id: jwtUser.sub },
        select: { id: true, name: true, email: true, planTier: true, role: true }
      }),
      db.aIReport.findFirst({
        where: { clientId: jwtUser.sub, propertyId: activeProperty.id },
        orderBy: { generatedAt: 'desc' },
        select: { id: true, summary: true, narrativeSummary: true, potentialSavings: true }
      }),
    ]);

    let lpgStatus = null;
    if (process.env.FEATURE_LPG_TRACKING === 'true') {
      try {
        lpgStatus = await predictLPGDepletion(jwtUser.sub, activeProperty.id);
      } catch (e) {
        console.error('[Dashboard Page] predictLPGDepletion non-fatal error:', e.message);
      }
    }

    let waterAnalysis = null;
    try {
      waterAnalysis = await analyzeWaterUsage(jwtUser.sub, activeProperty.id);
    } catch (e) {
      console.error('[Dashboard Page] analyzeWaterUsage non-fatal error:', e.message);
    }

    // 3. Null Guard
    if (!clientRecord) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
          <h2 className="text-xl font-bold text-text-primary">Account Synchronization Error</h2>
          <p className="text-text-muted text-sm max-w-md">
            Your login is valid, but your primary account record was not found. 
            Please sign out and register a new account.
          </p>
          <a href="/login" className="btn-primary text-xs px-6 py-2">Return to Login</a>
        </div>
      );
    }

    return (
      <DashboardOverview
        user={{ ...clientRecord, activeProperty }}
        readings={readings || []}
        alerts={alerts || []}
        appliances={appliances || []}
        latestReport={latestReport || null}
        lpgStatus={lpgStatus}
        waterAnalysis={waterAnalysis}
        searchParams={searchParams}
      />
    );

  } catch (error) {
    console.error('[Dashboard Page] Critical Data Fetch Error:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-xl font-bold text-red-500">System Error</h2>
        <p className="text-text-muted text-sm mt-2">Failed to load dashboard data. Please try again later.</p>
      </div>
    );
  }
}
