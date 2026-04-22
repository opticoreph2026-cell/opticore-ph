/**
 * @file src/lib/ratelimit.js
 * @description In-memory rate limiter for login and sensitive API routes.
 *
 * ⚠️  PRODUCTION NOTE: In-memory state is reset on each serverless function
 * cold start and is not shared across instances. For production deployments
 * on Netlify or Vercel, replace this with Upstash Redis:
 *
 *   npm install @upstash/ratelimit @upstash/redis
 *
 *   import { Ratelimit } from '@upstash/ratelimit';
 *   import { Redis }     from '@upstash/redis';
 *
 *   const ratelimit = new Ratelimit({
 *     redis: Redis.fromEnv(),
 *     limiter: Ratelimit.slidingWindow(10, '15 m'),
 *     analytics: true,
 *   });
 *
 *   export async function checkRateLimit(identifier) {
 *     const { success, limit, remaining, reset } = await ratelimit.limit(identifier);
 *     return { success, limit, remaining, reset };
 *   }
 *
 * Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in .env.
 */

/** @type {Map<string, { count: number; resetAt: number }>} */
const store = new Map();

const WINDOW_MS  = 15 * 60 * 1000; // 15-minute sliding window
const MAX_HITS   = 10;              // max attempts per window

/**
 * Check the rate limit for a given identifier (e.g. IP address or email).
 * @param {string} identifier
 * @returns {{ success: boolean; remaining: number; retryAfterMs: number }}
 */
export function checkRateLimit(identifier) {
  const now = Date.now();
  const entry = store.get(identifier);

  // No existing entry or window has expired → allow and reset
  if (!entry || now >= entry.resetAt) {
    store.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { success: true, remaining: MAX_HITS - 1, retryAfterMs: 0 };
  }

  // Still within the window
  if (entry.count >= MAX_HITS) {
    return {
      success: false,
      remaining: 0,
      retryAfterMs: entry.resetAt - now,
    };
  }

  entry.count += 1;
  return { success: true, remaining: MAX_HITS - entry.count, retryAfterMs: 0 };
}

/**
 * Extract the client IP from a Next.js Request object.
 * Falls back to 'unknown' if no IP can be determined.
 * @param {Request} req
 * @returns {string}
 */
export function getClientIp(req) {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  );
}
