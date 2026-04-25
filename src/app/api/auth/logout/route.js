import { NextResponse }  from 'next/server';
import { clearAuthCookies } from '@/lib/auth';

/** POST /api/auth/logout — clears all auth cookies */
export async function POST() {
  await clearAuthCookies();
  return NextResponse.json({ success: true }, { status: 200 });
}
