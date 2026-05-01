/**
 * GET  /api/dashboard/data?section=alerts
 * GET  /api/dashboard/data?section=appliances
 * POST /api/dashboard/data  { section: 'settings' | 'reading' | 'alert-read' | 'onboarding-complete' }
 *
 * Authenticated-only.
 */
export const dynamic = 'force-dynamic';

import { NextResponse }    from 'next/server';
import { signAccessToken, signRefreshToken, setAuthCookies, getCurrentUser }  from '@/lib/auth';
import {
  getAlertsByClient,
  markAlertRead,
  updateClientSettings,
  createReading,
  getAppliancesByClient,
  setOnboardingComplete,
} from '@/lib/db';

export async function GET(request) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const section = searchParams.get('section');

  if (section === 'alerts') {
    try {
      const alerts = await getAlertsByClient(jwtUser.sub);
      return NextResponse.json({ alerts });
    } catch {
      return NextResponse.json({ alerts: [] });
    }
  }

  if (section === 'appliances') {
    try {
      const appliances = await getAppliancesByClient(jwtUser.sub);
      return NextResponse.json({ appliances });
    } catch {
      return NextResponse.json({ appliances: [] });
    }
  }

  // ── Full Dashboard Data ──────────────────────────────────────────────────
  try {
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

    // ── Grid Status Logic (Consolidated) ───────────────────────────────────
    const currentHour = new Date().getHours();
    let gridStatus = { status: 'NORMAL', penalty: 0 };
    if (currentHour >= 14 && currentHour <= 16) {
      gridStatus = { status: 'YELLOW', penalty: 40 };
    } else if (currentHour === 13) {
      gridStatus = { status: 'RED', penalty: 100 };
    }

    // ── KPI Calculations ────────────────────────────────────────────────────
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
      lpgPercentLeft: lpgStatus?.tankSizeKg ? 100 : null, // Fallback logic for lpgPercentLeft
      ghostLoadPct: null, // Placeholder as per directive
      activeAlertCount: unreadAlertCount
    };

    // Deduplicate readings by month-year for charts
    const deduplicatedReadings = [];
    const seenMonths = new Set();
    for (const r of readings) {
      const month = new Date(r.readingDate).toISOString().substring(0, 7); // YYYY-MM
      if (!seenMonths.has(month)) {
        deduplicatedReadings.push(r);
        seenMonths.add(month);
      }
      if (deduplicatedReadings.length >= 6) break;
    }

    return NextResponse.json({
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
    });
  } catch (err) {
    console.error('[Dashboard Data] DB failure:', err);
    return NextResponse.json({ error: 'Failed to fetch dashboard data.' }, { status: 500 });
  }
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { section } = body ?? {};

  // ── Save provider settings ────────────────────────────────────────────────
  if (section === 'settings') {
    const { electricProvider, waterProvider, emailAlertsEnabled } = body;
    try {
      await updateClientSettings(jwtUser.sub, {
        electricProvider: electricProvider ?? '',
        waterProvider: waterProvider ?? '',
        emailAlertsEnabled,
        name: body.name,
        avatar: body.avatar
      });
      return NextResponse.json({ success: true });
    } catch {
      return NextResponse.json({ error: 'Failed to save settings.' }, { status: 500 });
    }
  }

  // ── Mark an alert as read ─────────────────────────────────────────────────
  if (section === 'alert-read') {
    const alertId = body.id;
    if (!alertId) {
      return NextResponse.json({ error: 'Alert id is required.' }, { status: 400 });
    }
    try {
      await markAlertRead(alertId, jwtUser.sub);
      return NextResponse.json({ success: true });
    } catch (err) {
      const msg = err?.message ?? 'Failed to mark alert.';
      const status = msg === 'Forbidden.' ? 403 : msg === 'Alert not found.' ? 404 : 500;
      return NextResponse.json({ error: msg }, { status });
    }
  }

  // ── Submit a utility reading ──────────────────────────────────────────────
  if (section === 'reading') {
    const { kwh_used, m3_used, reading_date, bill_amount_electric, bill_amount_water } = body;

    if (!reading_date || typeof reading_date !== 'string') {
      return NextResponse.json({ error: 'reading_date is required (ISO date string).' }, { status: 400 });
    }

    // Validate date format roughly
    const dateRe = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRe.test(reading_date)) {
      return NextResponse.json({ error: 'reading_date must be YYYY-MM-DD.' }, { status: 400 });
    }

    try {
      const record = await createReading({
        client_id:            jwtUser.sub,
        kwh_used:             Number(kwh_used             ?? 0),
        m3_used:              Number(m3_used              ?? 0),
        reading_date,
        bill_amount_electric: Number(bill_amount_electric ?? 0),
        bill_amount_water:    Number(bill_amount_water    ?? 0),
      });
      return NextResponse.json({ success: true, id: record.id });
    } catch {
      return NextResponse.json({ error: 'Failed to submit reading.' }, { status: 500 });
    }
  }

  // ── Mark onboarding complete ──────────────────────────────────────────────
  if (section === 'onboarding-complete') {
    try {
      const updatedUser = await setOnboardingComplete(jwtUser.sub);
      
      // REFRESH COOKIES: Update JWT to reflect onboarding_complete: true
      // Otherwise middleware will redirect user back to onboarding!
      const payload = {
        sub:                 updatedUser.id,
        email:               updatedUser.email,
        name:                updatedUser.name,
        role:                updatedUser.role ?? 'client',
        plan:                updatedUser.planTier ?? 'starter',
        onboarding_complete: true,
      };

      const accessToken = await signAccessToken(payload);
      const refreshToken = await signRefreshToken({ sub: updatedUser.id });
      await setAuthCookies(updatedUser, accessToken, refreshToken);

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error('[Onboarding API] Error:', err);
      return NextResponse.json({ error: 'Failed to update onboarding status.' }, { status: 500 });
    }
  }

  return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });
}
