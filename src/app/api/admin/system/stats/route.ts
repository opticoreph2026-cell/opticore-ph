import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const admin = await getCurrentUser();
  if (!admin || admin.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const [totalUsers, totalReports, totalTransactions, totalTokens] = await Promise.all([
    db.client.count(),
    db.aIReport.count(),
    db.transaction.count(),
    db.client.aggregate({ _sum: { totalTokensUsed: true } })
  ]);

  // Mock system health data (simulating DB latency and provider status)
  const stats = {
    totalUsers,
    totalReports,
    totalTransactions,
    totalTokens: totalTokens._sum.totalTokensUsed || 0,
    system: {
      dbLatency: Math.floor(Math.random() * 50) + 10, // ms
      uptime: '99.98%',
      lastScan: new Date().toISOString()
    },
    providers: [
      { id: 'meralco', name: 'Meralco', status: 'operational', coverage: 'Full' },
      { id: 'veco', name: 'VECO', status: 'beta', coverage: 'Best Effort' },
      { id: 'davao', name: 'Davao Light', status: 'beta', coverage: 'Best Effort' },
      { id: 'cebu', name: 'Cebu Light', status: 'coming_soon', coverage: 'Pending' }
    ]
  };

  return NextResponse.json(stats);
}
