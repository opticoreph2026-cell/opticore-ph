# OTP Auth Flow — Implementation Plan

## File 1: `prisma/schema.prisma`

After line 132 (`suspended Boolean @default(false)`), add:

```prisma
  otpCode               String?
  otpExpiresAt          DateTime?
```

Then run: `npx prisma db push`

## File 2: `src/app/api/auth/send-otp/route.ts` (NEW)

```ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { sendOTPEmail } from '@/lib/email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json({ exists: false, error: 'No account found with this email' }, { status: 404 });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.client.update({
      where: { id: client.id },
      data: { otpCode, otpExpiresAt },
    });

    await sendOTPEmail({ to: email, otpCode });

    return NextResponse.json({ exists: true, message: 'OTP sent to your email' });
  } catch (err) {
    console.error('[POST /api/auth/send-otp]', err);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
```

## File 3: `src/app/api/auth/verify-otp/route.ts` (NEW)

```ts
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { signIn } from '@/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();
    if (!email || !otpCode) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 });
    }

    const client = await db.client.findUnique({ where: { email } });
    if (!client) {
      return NextResponse.json({ error: 'No account found' }, { status: 404 });
    }

    if (!client.otpCode || !client.otpExpiresAt) {
      return NextResponse.json({ error: 'No OTP requested. Request a new one.' }, { status: 400 });
    }

    if (client.otpCode !== otpCode) {
      return NextResponse.json({ error: 'Invalid OTP code' }, { status: 400 });
    }

    if (new Date() > client.otpExpiresAt) {
      return NextResponse.json({ error: 'OTP expired. Request a new one.' }, { status: 400 });
    }

    // Clear OTP and sign in
    await db.client.update({
      where: { id: client.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    const result = await signIn('credentials', {
      email,
      password: otpCode, // won't work — need a different approach
      redirect: false,
    });

    // Alternative: use a custom sign-in approach
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/auth/verify-otp]', err);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
```

**NOTE**: The `signIn` call won't work because OTP users don't have a password. Instead, I'll create a custom server-side session setter using NextAuth's `auth()` and JWT directly. OR use a simpler approach: set a special one-time token in the Client record and redirect the user to a login-with-token endpoint.

**Better approach for verify-otp**: Instead of calling `signIn('credentials')`, use NextAuth's `auth` config to support OTP login. Or simpler: on successful OTP verification, create a temporary auth token, set a cookie, and redirect. Let me think...

**Actually simplest approach**: On successful OTP verify, use the Credentials provider by temporarily setting a random password that the verify endpoint knows. No — that's hacky.

**Best approach**: Create a helper that creates a JWT directly and sets it as a cookie, mimicking what NextAuth does. Or use NextAuth's `signIn` with a custom "otp" provider.

**Simplest working approach**: On OTP verify success, respond with a redirect URL and a session token. The client-side calls `signIn('credentials', { email, password: '<special>' })` but that won't work without modifying the authorize function.

**Actually, THE SIMPLEST approach**: Modify the Credentials provider's `authorize` to accept OTP login. Or create a new "otp" provider.

**REAL SIMPLEST**: Use NextAuth's `signIn` with a special password. On OTP verify, set the user's passwordHash to a known value temporarily, sign them in, then restore it. Too hacky.

**FINAL APPROACH**: The verify-otp route creates a NextAuth session directly using `jwt` encryption and sets the session cookie. But this requires internal NextAuth APIs.

**ACTUAL FINAL APPROACH**: After OTP verification, redirect the user to a special callback that creates their session:

1. verify-otp creates a `sessionToken` in a new table or field
2. The user is redirected to `/api/auth/callback/otp?token=xxx`
3. That endpoint validates the token and calls NextAuth to create a session

**SIMPLEST VIABLE APPROACH**: Use NextAuth's built-in Credentials flow. Modify the authorize function to support both password and OTP-based login:

In `src/auth.ts`, modify the Credentials `authorize` to check:
- If credentials include `type: 'otp'`, validate the OTP instead of the password
- If credentials include `type: 'password'`, validate password as before

On the client side after OTP verify:
```
const result = await signIn('credentials', { 
  email, 
  password: otpCode,
  type: 'otp', 
  redirect: false 
});
```

This is clean and uses NextAuth's existing flow.

## File 4: `src/app/api/auth/register/route.ts`

After creating the client (line 54), add:

```ts
import { sendWelcomeEmail } from '@/lib/email';

// After the client + authProvider creation:
try {
  await sendWelcomeEmail({ to: client.email, name: client.name || '' });
} catch (emailErr) {
  console.error('[Register] Welcome email failed:', emailErr);
  // Non-fatal — don't block registration
}
```

## File 5: `src/app/login/page.tsx`

Replace the magic link section with OTP flow:

1. Add state: `showOtpInput`, `otpCode`
2. Replace `handleMagicLink` with `handleSendOtp`:
   - POST to `/api/auth/send-otp`
   - If 404 response (user not found), show error "No account found. Sign up instead." with a link to `/signup`
   - If success, set `showOtpInput = true`
3. Add `handleVerifyOtp`:
   - POST to `/api/auth/verify-otp`
   - If success, call `signIn('credentials', { email, password: otpCode, type: 'otp' })`
   - Redirect to post-login page
4. When `showOtpInput` is true, show OTP input field + "Verify" button
5. Update `NEXT_PUBLIC_RESEND_ENABLED` check to `NEXT_PUBLIC_OTP_ENABLED`

## File 6: `src/auth.ts` (modify Credentials authorize)

Add support for OTP type:

```ts
async authorize(credentials) {
  const email = credentials?.email as string | undefined;
  const authType = credentials?.type as string | undefined;

  if (authType === 'otp') {
    const otpCode = credentials?.password as string | undefined;
    if (!email || !otpCode) return null;
    
    const client = await db.client.findUnique({ where: { email } });
    if (!client?.otpCode || !client?.otpExpiresAt) return null;
    if (client.otpCode !== otpCode) return null;
    if (new Date() > client.otpExpiresAt) return null;
    
    // Clear OTP
    await db.client.update({
      where: { id: client.id },
      data: { otpCode: null, otpExpiresAt: null, lastLoginAt: new Date() },
    });
    
    return { id: client.id, email: client.email, name: client.name ?? undefined, role: client.role, organizationId: undefined };
  }

  // Original password logic
  const password = credentials?.password as string | undefined;
  if (!password) return null;
  // ... rest unchanged
```

## Summary

| File | Action |
|---|---|
| `prisma/schema.prisma` | Add `otpCode` + `otpExpiresAt` to Client |
| `src/auth.ts` | Extend `authorize` to handle OTP type |
| `src/app/api/auth/send-otp/route.ts` | **New** — generate OTP, store, email |
| `src/app/api/auth/verify-otp/route.ts` | **New** — validate OTP, clear, return success |
| `src/app/api/auth/register/route.ts` | Add `sendWelcomeEmail()` call |
| `src/app/login/page.tsx` | Replace magic link with OTP flow |

## After Implementation

```bash
npx prisma db push
npm run build
git add -A
git commit -m "feat: OTP auth via Gmail API + welcome email on signup"
git push origin main
```
