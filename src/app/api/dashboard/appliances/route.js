/**
 * GET  /api/dashboard/appliances
 * POST /api/dashboard/appliances        — create
 * PUT  /api/dashboard/appliances        — update (body: { id, ...fields })
 * DELETE /api/dashboard/appliances?id= — delete
 *
 * Authenticated-only.
 */

import { NextResponse }   from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import {
  getAppliancesByClient,
  createAppliance,
  updateAppliance,
  deleteAppliance,
  getActiveProperty,
  ensureDefaultProperty,
  getClientById
} from '@/lib/db';

// ── GET — list all appliances for this user ───────────────────────────────────
export async function GET() {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const activeProperty = await ensureDefaultProperty(jwtUser.sub);
    const appliances = await getAppliancesByClient(jwtUser.sub, activeProperty.id);
    return NextResponse.json({ appliances });
  } catch {
    return NextResponse.json({ appliances: [] });
  }
}

// ── POST — create a new appliance ────────────────────────────────────────────
export async function POST(request) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { name, category, brand, model, year, wattage, hours_per_day, energy_rating, notes, quantity } = body ?? {};

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return NextResponse.json({ error: 'Appliance name is required.' }, { status: 400 });
  }

  try {
    const activeProperty = await getActiveProperty(jwtUser.sub);
    const client = await getClientById(jwtUser.sub);
    const plan = client?.planTier ?? 'starter';

    if (plan === 'starter') {
      const appliances = await getAppliancesByClient(jwtUser.sub, activeProperty?.id);
      if (appliances.length >= 5) {
        return NextResponse.json({ 
          error: 'LIMIT_REACHED', 
          message: 'Starter plan is limited to 5 appliances. Upgrade to Pro for unlimited hardware tracking.' 
        }, { status: 403 });
      }
    }

    const record = await createAppliance({
      client_id: jwtUser.sub,
      name:          name.trim(),
      category:      category      ?? 'other',
      brand:         brand         ?? '',
      model:         model         ?? '',
      year:          year          ?? null,
      wattage:       wattage       ?? null,
      hours_per_day: hours_per_day ?? null,
      energy_rating: energy_rating ?? 'not-rated',
      notes:         notes         ?? '',
      quantity:      quantity      ?? 1,
      property_id:   activeProperty?.id,
    });
    return NextResponse.json({ success: true, appliance: record }, { status: 201 });
  } catch (err) {
    console.error('[Appliances] Create Error:', err);
    return NextResponse.json({ error: 'Failed to create appliance.' }, { status: 500 });
  }
}

// ── PUT — update an existing appliance ──────────────────────────────────────
export async function PUT(request) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let body;
  try { body = await request.json(); } catch {
    return NextResponse.json({ error: 'Invalid JSON.' }, { status: 400 });
  }

  const { id, ...fields } = body ?? {};
  if (!id) return NextResponse.json({ error: 'Appliance id is required.' }, { status: 400 });

  try {
    const record = await updateAppliance(id, jwtUser.sub, fields);
    return NextResponse.json({ success: true, appliance: record });
  } catch (err) {
    const msg = err?.message ?? 'Failed to update appliance.';
    const status = msg === 'Forbidden.' ? 403 : msg === 'Appliance not found.' ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}

// ── DELETE — delete an appliance ─────────────────────────────────────────────
export async function DELETE(request) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Appliance id query param is required.' }, { status: 400 });

  try {
    await deleteAppliance(id, jwtUser.sub);
    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err?.message ?? 'Failed to delete appliance.';
    const status = msg === 'Forbidden.' ? 403 : msg === 'Appliance not found.' ? 404 : 500;
    return NextResponse.json({ error: msg }, { status });
  }
}
