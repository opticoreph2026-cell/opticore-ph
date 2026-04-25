import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const url = (process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL || '').trim();
  const token = (process.env.TURSO_AUTH_TOKEN || '').trim();

  const results = {
    url: url ? `${url.substring(0, 15)}...` : 'MISSING',
    token: token ? 'PRESENT' : 'MISSING',
    step1_client: 'pending',
    step2_query: 'pending',
    error: null,
  };

  try {
    const client = createClient({ url, authToken: token || undefined });
    results.step1_client = 'ok';

    const rs = await client.execute('SELECT 1 as connected');
    results.step2_query = 'ok';
    
    try {
      const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
      results.tables = tables.rows.map(r => r.name);
    } catch (e) {
      results.tables_error = e.message;
    }

    // Test Prisma
    try {
      const { db: prismaDb } = await import('@/lib/db');
      results.step3_prisma = 'pending';
      const count = await prismaDb.client.count();
      results.step3_prisma = 'ok';
      results.client_count = count;
    } catch (e) {
      results.step3_prisma = 'error';
      results.prisma_error = {
        message: e.message,
        stack: e.stack,
      };
    }

    return NextResponse.json(results);
  } catch (e) {
    results.error = {
      message: e.message,
      stack: e.stack,
      code: e.code,
    };
    return NextResponse.json(results, { status: 500 });
  }
}
