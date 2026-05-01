import { NextRequest } from 'next/server';

// Simple in-memory rate limiter for MVP
const cache = new Map<string, { count: number; expires: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number = 60000) {
  const now = Date.now();
  const record = cache.get(key);

  if (!record || now > record.expires) {
    cache.set(key, { count: 1, expires: now + windowMs });
    return { success: true, count: 1 };
  }

  if (record.count >= limit) {
    return { success: false, count: record.count };
  }

  record.count++;
  return { success: true, count: record.count };
}

export function getClientIp(req: NextRequest) {
  return req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
}
