/**
 * GET /api/admin/clients
 * Admin-only: returns all client records.
 */

import { NextResponse }    from 'next/server';
import { getCurrentUser }  from '@/lib/auth';
import { listAllClients }  from '@/lib/db';

export async function GET() {
  const jwtUser = await getCurrentUser();

  if (!jwtUser || jwtUser.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const clients = await listAllClients();

    // Strip password hashes before returning to admin UI
    const safe = clients.map(({ passwordHash, ...rest }) => rest);

    return NextResponse.json({ clients: safe });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch clients.' }, { status: 500 });
  }
}
