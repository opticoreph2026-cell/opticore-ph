/**
 * GET /api/dashboard/attribution
 * 
 * Runs the Attribution Engine against the latest reading and user's appliances.
 * Returns ghost-load percentages, category breakdown, and severity.
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getClientById, getReadingsByClient, getAppliancesByClient, getActiveProperty, ensureDefaultProperty } from '@/lib/db';
import { calculateAttribution, calculateWaterAttribution } from '@/utils/attributionEngine';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const activeProperty = await ensureDefaultProperty(user.sub);
    const [client, readings, appliances] = await Promise.all([
      getClientById(user.sub),
      getReadingsByClient(user.sub, activeProperty.id),
      getAppliancesByClient(user.sub, activeProperty.id),
    ]);

    if (!readings || readings.length === 0) {
      return NextResponse.json({ success: true, data: null, message: 'No readings yet.' });
    }

    const latest = readings[0];

    // Electric attribution
    const electricAttribution = latest.kwhUsed > 0
      ? calculateAttribution(latest.kwhUsed, appliances)
      : null;

    // Water attribution — rough household size estimate from appliance count
    const householdSize = Math.max(1, Math.ceil((client?.applianceCount ?? 1) / 4));
    const waterAttribution = latest.m3Used > 0
      ? calculateWaterAttribution(latest.m3Used, householdSize)
      : null;

    return NextResponse.json({
      success: true,
      data: {
        electric: electricAttribution,
        water: waterAttribution,
        readingDate: latest.readingDate,
        effectiveRate: latest.effectiveRate,
        sourceType: latest.sourceType,
      },
    });

  } catch (error) {
    console.error('[Attribution API]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
