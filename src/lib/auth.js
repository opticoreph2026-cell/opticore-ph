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

const COOKIE_NAME  = 'opticore_auth';
const TOKEN_EXPIRY = '24h';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

/** Encode the secret as a Uint8Array for jose */
function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set.');
  return new TextEncoder().encode(secret);
}

// ─── JWT ──────────────────────────────────────────────────────────────────────

/**
 * Sign a JWT payload and return the token string.
 * @param {object} payload - Data to encode (e.g. { sub: recordId, email, role })
 * @returns {Promise<string>} Signed JWT
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .setIssuer('opticore-ph')
    .sign(getSecret());
}

/**
 * Verify a JWT string and return its decoded payload.
 * @param {string} token
 * @returns {Promise<object|null>} Decoded payload, or null if invalid/expired
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      issuer: 'opticore-ph',
    });
    return payload;
  } catch {
    return null;
  }
}

// ─── Cookies ──────────────────────────────────────────────────────────────────

/**
 * Set the auth cookie in the current response.
 * Must be called inside a Route Handler or Server Action.
 * @param {string} token - Signed JWT string
 */
export async function setAuthCookie(token) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   60 * 60 * 24, // 24 hours in seconds
    path:     '/',
  });
}

/**
 * Clear the auth cookie (logout).
 */
export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Get the current authenticated user from the cookie.
 * Returns null if not authenticated or token is expired/invalid.
 * @returns {Promise<object|null>} JWT payload or null
 */
export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifyToken(token);
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
