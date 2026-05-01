import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req) {
  const session = await getSession(req);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { provider } = await req.json();
  if (!provider || !['GOOGLE', 'APPLE', 'FACEBOOK'].includes(provider)) {
    return NextResponse.json({ error: 'Invalid provider' }, { status: 400 });
  }

  try {
    // 1. Check current providers
    const providers = await db.authProvider.findMany({
      where: { clientId: session.sub },
    });

    if (providers.length <= 1) {
      return NextResponse.json({ 
        error: 'Cannot unlink the only sign-in method for this account.' 
      }, { status: 400 });
    }

    const targetProvider = providers.find(p => p.provider === provider);
    if (!targetProvider) {
      return NextResponse.json({ error: 'Provider not linked' }, { status: 404 });
    }

    // 2. Unlink in a transaction
    await db.$transaction(async (tx) => {
      // Delete the provider record
      await tx.authProvider.delete({
        where: { id: targetProvider.id },
      });

      // Revoke all refresh tokens for this client (Security Requirement)
      await tx.refreshToken.deleteMany({
        where: { clientId: session.sub },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[auth/unlink] error:', error);
    return NextResponse.json({ error: 'Failed to unlink account' }, { status: 500 });
  }
}
