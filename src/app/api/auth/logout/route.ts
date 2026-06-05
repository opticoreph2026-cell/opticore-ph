import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Try to read the refresh token cookie to delete it from DB
    const refreshToken = req.cookies.get('refresh_token')?.value;
    if (refreshToken) {
      await db.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    }

    // ── Clear cookies on NextResponse ─────────────────────────────────────────
    const response = NextResponse.json({ success: true });
    response.cookies.set('access_token', '', { maxAge: 0, path: '/' });
    response.cookies.set('refresh_token', '', { maxAge: 0, path: '/' });
    return response;
  } catch (error) {
    console.error('Logout Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
