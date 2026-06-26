import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // Perform server-side sign out (cleans up internal state)
  await signOut({ redirect: false }).catch(() => {});

  const response = NextResponse.redirect(new URL('/login', request.url));

  // Clear NextAuth session token cookies (authjs.session-token + secure variant)
  for (const name of ['authjs.session-token', '__Secure-authjs.session-token', '__Host-authjs.session-token']) {
    response.cookies.set(name, '', { maxAge: 0, path: '/' });
  }

  // Clear the guard cookie
  response.cookies.set('opticore_session', '', { maxAge: 0, path: '/' });

  return response;
}
