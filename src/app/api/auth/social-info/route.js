import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * GET /api/auth/social-info
 * Returns basic info about the current social session (email, name, isNew).
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const email = session.user.email?.toLowerCase();
    if (!email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await db.client.findUnique({
      where: { email },
    });

    if (!client) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Determine if user is new/needs password setup
    // A password starting with 'GOOGLE_OAUTH_USER_' is our placeholder.
    const isNew = client.passwordHash?.startsWith('GOOGLE_OAUTH_USER_') || false;

    return NextResponse.json({
      email: client.email,
      name: client.name,
      isNew: isNew
    });

  } catch (error) {
    console.error('[social-info] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch user state' }, { status: 500 });
  }
}
