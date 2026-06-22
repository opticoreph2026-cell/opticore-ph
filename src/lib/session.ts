import 'server-only';

import { auth } from '@/auth';
import type { EnergySession } from '@/lib/energy-auth';

/** Server-side session helper — maps NextAuth session to EnergySession shape. */
export async function getSession(): Promise<EnergySession | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  return {
    sub: session.user.id,
    email: session.user.email,
    name: session.user.name ?? undefined,
    role: session.user.role,
    organizationId: session.user.organizationId,
  };
}

export async function getCurrentUser(): Promise<EnergySession | null> {
  return getSession();
}
