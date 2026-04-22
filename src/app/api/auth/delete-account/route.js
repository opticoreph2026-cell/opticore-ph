/**
 * DELETE /api/auth/delete-account
 * Permanently deletes the authenticated user's account and all associated data.
 * Requires password confirmation for non-Google accounts.
 */
import { NextResponse } from 'next/server';
import { getCurrentUser, clearAuthCookie, verifyPassword } from '@/lib/auth';
import { getClientById, deleteClient } from '@/lib/db';

export async function DELETE(request) {
  try {
    const jwtUser = await getCurrentUser();
    if (!jwtUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await getClientById(jwtUser.sub);
    if (!client) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    // For password-based accounts, require confirmation
    if (!client.googleId) {
      const body = await request.json().catch(() => ({}));
      const { password } = body;

      if (!password) {
        return NextResponse.json(
          { error: 'Password confirmation is required to delete your account.' },
          { status: 400 }
        );
      }

      const { valid } = await verifyPassword(password, client.passwordHash ?? '');
      if (!valid) {
        return NextResponse.json(
          { error: 'Incorrect password. Account deletion cancelled.' },
          { status: 401 }
        );
      }
    }

    // Delete the account — Prisma cascade handles all related records
    await deleteClient(client.id);
    await clearAuthCookie();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[Delete Account]:', error);
    return NextResponse.json({ error: 'Failed to delete account.' }, { status: 500 });
  }
}
