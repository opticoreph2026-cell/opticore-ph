import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/password';
import { changePasswordSchema } from '@/lib/validations';

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 422 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const dbUser = await db.client.findUnique({
      where: { id: user.sub },
      select: { passwordHash: true },
    });

    if (!dbUser?.passwordHash) {
      return NextResponse.json({ error: 'Account has no password set' }, { status: 400 });
    }

    const { valid } = await verifyPassword(currentPassword, dbUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 403 });
    }

    const newHash = await hashPassword(newPassword);

    await db.client.update({
      where: { id: user.sub },
      data: { passwordHash: newHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
