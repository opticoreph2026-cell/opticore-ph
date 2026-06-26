import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const signOutResponse = await signOut({ redirect: false });
  const response = NextResponse.redirect(new URL('/login', request.url));

  // Copy Set-Cookie headers from signOut to clear NextAuth session cookies
  const cookiesToClear =
    typeof signOutResponse.headers.getSetCookie === 'function'
      ? signOutResponse.headers.getSetCookie()
      : [signOutResponse.headers.get('Set-Cookie')].filter(Boolean);
  for (const cookie of cookiesToClear) {
    response.headers.append('Set-Cookie', cookie);
  }

  // Also clear the guard cookie
  response.cookies.set('opticore_session', '', { maxAge: 0, path: '/' });

  return response;
}
