import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'opticore_owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const body = await request.json();
  const { question, answer, locale, category, sortOrder } = body;

  if (!question || !answer) {
    return NextResponse.json({ error: 'Question and answer are required' }, { status: 400 });
  }

  const entry = await db.faqEntry.create({
    data: {
      question,
      answer,
      locale: locale || 'en',
      category: category || null,
      sortOrder: typeof sortOrder === 'number' ? sortOrder : 0,
    },
  });

  return NextResponse.json(entry);
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'opticore_owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const entries = await db.faqEntry.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ data: entries });
}
