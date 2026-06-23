import 'server-only';
import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { sendContactFormEmail } from '@/lib/email';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subject, message } = await request.json();

    if (!subject || !message) {
      return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
    }

    await sendContactFormEmail({
      name: session.name ?? session.email,
      email: session.email,
      subject: String(subject),
      message: String(message),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[POST /api/support/contact]', err);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
