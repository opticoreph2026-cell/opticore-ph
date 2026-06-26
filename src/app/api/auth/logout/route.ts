import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await signOut({ redirect: false });
  const response = NextResponse.redirect(new URL('/login', request.url));
  response.cookies.set('opticore_session', '', { maxAge: 0, path: '/' });
  return response;
}
