import { NextResponse } from 'next/server';
import { generateAdvisoryReport } from '@/lib/advisory';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const data = await req.json();
    const { billData, propertyContext, currentAppliances } = data;

    if (!billData) {
      return NextResponse.json({ error: 'Bill data required' }, { status: 400 });
    }

    const advisory = await generateAdvisoryReport(billData, currentAppliances || [], [], 'all');

    return NextResponse.json({ advisory });
  } catch (error) {
    console.error('Advisory API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
