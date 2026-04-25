/**
 * @file src/lib/auth.js
 * @description JWT authentication using `jose` (Web Crypto compatible).
 * Tokens are stored in httpOnly, Secure, SameSite=Strict cookies.
 * Expiry: 24 hours.
 *
 * Password hashing uses bcryptjs (Node.js-only server routes).
 * A backward-compatible SHA-256 fallback is retained for users
 * registered before the bcrypt migration.
 */

import 'server-only';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';

const ACCESS_COOKIE  = 'opticore_access';
const REFRESH_COOKIE = 'opticore_refresh';

const ACCESS_EXPIRY  = '15m'; // Short-lived
const REFRESH_EXPIRY = '7d';  // Long-lived

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

/** Encode the JWT_SECRET as a Uint8Array for jose */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return new TextEncoder().encode(secret);
}

/** Encode the JWT_REFRESH_SECRET for refresh tokens — falls back to JWT_SECRET if not set */
function getRefreshSecret() {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_REFRESH_SECRET environment variable is not set.');
  return new TextEncoder().encode(secret);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

/**
 * Sign an Access JWT.
 * @param {object} payload 
 */
export async function signAccessToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_EXPIRY)
    .setIssuer('opticore-ph')
    .sign(getSecret());
}

/**
 * Sign a Refresh JWT.
 * @param {object} payload 
 */
export async function signRefreshToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_EXPIRY)
    .setIssuer('opticore-ph')
    .sign(getRefreshSecret());
}

/**
 * Verify a JWT string using the ACCESS secret.
 */
export async function verifyToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'opticore-ph',
    });
    return payload;
  } catch {
    return null;
  }
}

/**
 * Verify a REFRESH JWT string using the REFRESH secret.
 */
export async function verifyRefreshToken(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      issuer: 'opticore-ph',
    });
    return payload;
  } catch {
    return null;
  }
}

// ─── Cookies ──────────────────────────────────────────────────────────────────

/**
 * Set both Access and Refresh cookies.
 * Also persists the refresh token to the database.
 */
export async function setAuthCookies(user, accessToken, refreshToken) {
  const cookieStore = await cookies();
  
  // Set Access Cookie (15m)
  cookieStore.set(ACCESS_COOKIE, accessToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   15 * 60,
    path:     '/',
  });

  // Set Refresh Cookie (7d)
  cookieStore.set(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24 * 7,
    path:     '/',
  });

  // Persist Refresh Token to DB
  try {
    await db.refreshToken.create({
      data: {
        token: refreshToken,
        clientId: user.id || user.sub,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
      }
    });
  } catch (error) {
    console.error('[Auth] Failed to persist refresh token:', error);
  }
}

/**
 * Clear all auth cookies.
 */
export async function clearAuthCookies() {
  const cookieStore = await cookies();
  
  // Delete from DB if we have the refresh token
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;
  if (refreshToken) {
    try {
      await db.refreshToken.delete({ where: { token: refreshToken } }).catch(() => {});
    } catch {}
  }

  cookieStore.delete(ACCESS_COOKIE);
  cookieStore.delete(REFRESH_COOKIE);
}

/**
 * Get the current user from the access token.
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  
  if (accessToken) {
    const payload = await verifyToken(accessToken);
    if (payload) return payload;
  }

  // If access token is missing or expired, we might want to trigger a refresh here,
  // but in Server Components we can't set cookies. 
  // Refreshing should happen in Middleware or dedicated API routes.
  return null;
}

// ─── Password Hashing (bcryptjs) ──────────────────────────────────────────────

/**
 * Hash a password using bcryptjs.
 * Prefix "bcrypt:" so we can distinguish from legacy SHA-256 hashes.
 * @param {string} password
 * @returns {Promise<string>} "bcrypt:<hash>"
 */
export async function hashPassword(password) {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return `bcrypt:${hash}`;
}

/**
 * Verify a plaintext password against a stored hash.
 * Supports both bcrypt (new) and SHA-256 (legacy) formats:
 *   - "bcrypt:<bcrypt_hash>"  → bcryptjs.compare
 *   - "salt:hex"              → legacy SHA-256 fallback
 *
 * On successful SHA-256 verification, you should rehash with bcrypt.
 *
 * @param {string} password - Plaintext password from login form
 * @param {string} stored   - Stored hash string from database
 * @returns {Promise<{ valid: boolean; needsRehash: boolean }>}
 */
export async function verifyPassword(password, stored) {
  if (!stored) return { valid: false, needsRehash: false };

  // New bcrypt format
  if (stored.startsWith('bcrypt:')) {
    const hash = stored.slice('bcrypt:'.length);
    const valid = await bcrypt.compare(password, hash);
    return { valid, needsRehash: false };
  }

  // Legacy SHA-256 format: "salt:hexhash"
  if (stored.includes(':')) {
    const valid = await verifyLegacySha256(password, stored);
    return { valid, needsRehash: valid }; // rehash on success
  }

  return { valid: false, needsRehash: false };
}

/**
 * Verify a legacy SHA-256 salted password.
 * @param {string} password
 * @param {string} stored - "salt:hexhash"
 * @returns {Promise<boolean>}
 */
async function verifyLegacySha256(password, stored) {
  try {
    const [salt, expectedHash] = stored.split(':');
    if (!salt || !expectedHash) return false;
    const data = new TextEncoder().encode(salt + password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashHex = Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
    return hashHex === expectedHash;
  } catch {
    return false;
  }
}
