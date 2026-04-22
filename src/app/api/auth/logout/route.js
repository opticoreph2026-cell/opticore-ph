import { NextResponse }  from 'next/server';
import { clearAuthCookie } from '@/lib/auth';

/** POST /api/auth/logout — clears the auth cookie */
export async function POST() {
  clearAuthCookie();
  return NextResponse.json({ success: true }, { status: 200 });
}
