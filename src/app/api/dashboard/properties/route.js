/**
 * GET  /api/dashboard/properties  — list all properties for the current user
 * POST /api/dashboard/properties  — create a new property
 */
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getPropertiesByClient, createProperty } from '@/lib/db';

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const properties = await getPropertiesByClient(user.sub);
  return NextResponse.json({ properties });
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const { name, address, electricityProviderId, waterProviderId, isDefault } = body;

  if (!name || typeof name !== 'string' || name.trim().length < 1) {
    return NextResponse.json({ error: 'Property name is required.' }, { status: 400 });
  }

  const property = await createProperty(user.sub, {
    name: name.trim(),
    address,
    electricityProviderId,
    waterProviderId,
    isDefault: isDefault ?? false,
  });

  return NextResponse.json({ property }, { status: 201 });
}
