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

// ── GET ───────────────────────────────────────────────────────────────────────
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

  return NextResponse.json({ error: 'Unknown section.' }, { status: 400 });
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
