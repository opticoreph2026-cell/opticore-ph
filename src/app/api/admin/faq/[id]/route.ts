import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'opticore_owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const { question, answer, locale, category, sortOrder, active } = body;

  const data: Record<string, unknown> = {};
  if (question !== undefined) data.question = question;
  if (answer !== undefined) data.answer = answer;
  if (locale !== undefined) data.locale = locale;
  if (category !== undefined) data.category = category || null;
  if (sortOrder !== undefined) data.sortOrder = sortOrder;
  if (active !== undefined) data.active = active;

  const updated = await db.faqEntry.update({
    where: { id },
    data,
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'opticore_owner') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { id } = await params;

  await db.faqEntry.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
