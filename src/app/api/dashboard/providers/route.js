import { NextResponse } from 'next/server';
import { listProviders, createProvider, updateProvider, deleteProvider } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

/**
 * GET /api/dashboard/providers?type=electricity|water|lpg
 * Returns the list of utility providers from the database.
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? null;
  
  try {
    const providers = await listProviders(type);
    return NextResponse.json({ providers }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}

/**
 * POST /api/dashboard/providers
 * Admin only. Create a new utility provider.
 */
export async function POST(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { name, type, region, baseRate, benchmarkAvg, logoUrl, website } = body;

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and Type are required' }, { status: 400 });
    }

    const provider = await createProvider({
      name,
      type,
      region,
      baseRate,
      benchmarkAvg,
      logoUrl: logoUrl || null,
      website: website || null,
    });

    return NextResponse.json({ success: true, provider }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/dashboard/providers?id=...
 * Admin only.
 */
export async function DELETE(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await deleteProvider(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * PUT /api/dashboard/providers
 * Admin only. Update an existing utility provider.
 */
export async function PUT(request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { id, name, type, region, baseRate, benchmarkAvg, logoUrl, website } = body;

    if (!id || !name || !type) {
      return NextResponse.json({ error: 'ID, Name, and Type are required' }, { status: 400 });
    }

    const provider = await updateProvider(id, {
      name,
      type,
      region,
      baseRate,
      benchmarkAvg,
      logoUrl: logoUrl !== undefined ? logoUrl : undefined,
      website: website !== undefined ? website : undefined,
    });

    return NextResponse.json({ success: true, provider }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
