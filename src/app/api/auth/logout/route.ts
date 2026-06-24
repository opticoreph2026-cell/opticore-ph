import { signOut } from '@/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await signOut({ redirect: false });
  return NextResponse.redirect(new URL('/login', request.url));
}
