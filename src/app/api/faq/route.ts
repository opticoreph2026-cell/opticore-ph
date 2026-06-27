import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get('locale') || 'en';

  const entries = await db.faqEntry.findMany({
    where: { active: true, locale },
    orderBy: { sortOrder: 'asc' },
    select: {
      id: true,
      question: true,
      answer: true,
      category: true,
      sortOrder: true,
    },
  });

  return NextResponse.json({ data: entries });
}
