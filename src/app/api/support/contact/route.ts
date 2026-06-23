import 'server-only';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sendContactFormEmail } from '@/lib/email';
import { contactFormSchema } from '@/lib/validations';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = contactFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 422 });
    }

    const { subject, message } = parsed.data;

    await sendContactFormEmail({
      name: session.name ?? session.email,
      email: session.email,
      subject,
      message,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/support/contact]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
