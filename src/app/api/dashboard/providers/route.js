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
    console.error('[Providers API] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch providers' }, { status: 500 });
  }
}
