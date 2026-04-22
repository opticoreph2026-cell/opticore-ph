import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser, verifyPassword, hashPassword } from '@/lib/auth';

export async function POST(request) {
  try {
    // 1. Authenticate
    const jwtUser = await getCurrentUser();
    if (!jwtUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new passwords are required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    // 2. Fetch User
    const user = await db.client.findUnique({
      where: { id: jwtUser.sub }
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: 'Account not found or password not set.' }, { status: 404 });
    }

    // 3. Verify Current Password
    const { valid } = await verifyPassword(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Incorrect current password.' }, { status: 403 });
    }

    // 4. Hash and Update
    const passwordHash = await hashPassword(newPassword);

    await db.client.update({
      where: { id: user.id },
      data: { passwordHash }
    });

    return NextResponse.json({ success: true, message: 'Password changed successfully.' });

  } catch (error) {
    console.error('Change Password Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
