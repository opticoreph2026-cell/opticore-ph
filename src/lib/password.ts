import 'server-only';

import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS ?? 12);

export async function hashPassword(password: string): Promise<string> {
  const hash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  return `bcrypt:${hash}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<{ valid: boolean; needsRehash: boolean }> {
  if (!stored) return { valid: false, needsRehash: false };

  if (stored.startsWith('bcrypt:')) {
    const hash = stored.slice('bcrypt:'.length);
    const valid = await bcrypt.compare(password, hash);
    return { valid, needsRehash: false };
  }

  if (stored.includes(':')) {
    const valid = await verifyLegacySha256(password, stored);
    return { valid, needsRehash: valid };
  }

  return { valid: false, needsRehash: false };
}

async function verifyLegacySha256(password: string, stored: string): Promise<boolean> {
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
