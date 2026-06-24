/**
 * @file src/lib/energy-auth.ts
 * @description Role guard helpers for the OptiCore Energy platform.
 *
 * Uses the same JWT payload shape produced by src/lib/auth.js.
 * The energy platform extends the existing `role` field with
 * new values: opticore_owner, opticore_staff, partner_admin,
 * partner_installer, customer.
 *
 * Existing values ("client", "admin") continue to work unchanged.
 */

export type EnergyRole =
  | 'opticore_owner'
  | 'opticore_staff'
  | 'partner_admin'
  | 'partner_installer'
  | 'customer'
  | 'client'   // legacy bill-analytics role
  | 'admin';   // legacy admin role

export interface EnergySession {
  sub: string;
  email: string;
  name?: string;
  role: EnergyRole | string;
  plan?: string;
  organizationId?: string;
  onboarding_complete?: boolean;
  suspended?: boolean;
}

// ─── Role Predicates ─────────────────────────────────────────────────────────

export function isOptcoreOwner(session: EnergySession | null): boolean {
  return session?.role === 'opticore_owner';
}

export function isOptcoreStaff(session: EnergySession | null): boolean {
  return (
    session?.role === 'opticore_owner' ||
    session?.role === 'opticore_staff'
  );
}

export function isPartnerAdmin(session: EnergySession | null): boolean {
  return session?.role === 'partner_admin';
}

export function isPartnerInstaller(session: EnergySession | null): boolean {
  return (
    session?.role === 'partner_admin' ||
    session?.role === 'partner_installer'
  );
}

export function isCustomer(session: EnergySession | null): boolean {
  return session?.role === 'customer';
}

export function canAccessCustomerPortal(session: EnergySession | null): boolean {
  return isCustomer(session);
}

export function canAccessCrm(session: EnergySession | null): boolean {
  return isOptcoreStaff(session);
}

export function canAccessPartnerPortal(session: EnergySession | null): boolean {
  return isPartnerAdmin(session) || isPartnerInstaller(session);
}

export function canAccessDesigns(session: EnergySession | null): boolean {
  return isOptcoreStaff(session) || isPartnerAdmin(session) || isPartnerInstaller(session);
}

export function canAccessAdminEnergy(session: EnergySession | null): boolean {
  return isOptcoreOwner(session);
}

// ─── Guard Helpers (API routes) ───────────────────────────────────────────────

export class AuthorizationError extends Error {
  readonly statusCode: number;
  constructor(message: string, statusCode = 403) {
    super(message);
    this.name = 'AuthorizationError';
    this.statusCode = statusCode;
  }
}

/**
 * Require the session to have one of the specified roles.
 * Throws AuthorizationError if not satisfied.
 */
export function requireRole(
  session: EnergySession | null,
  allowedRoles: EnergyRole[],
): asserts session is EnergySession {
  if (!session) {
    throw new AuthorizationError('Authentication required.', 401);
  }
  if (!allowedRoles.includes(session.role as EnergyRole)) {
    throw new AuthorizationError(
      `Access denied. Required: ${allowedRoles.join(' or ')}, got: ${session.role}.`,
      403,
    );
  }
}

/**
 * Require the session to belong to a specific organization.
 * OptiCore owner/staff bypass the org check (global access).
 */
export function requireOrg(
  session: EnergySession | null,
  organizationId: string,
): asserts session is EnergySession {
  if (!session) throw new AuthorizationError('Authentication required.', 401);
  // Global access for opticore staff
  if (isOptcoreStaff(session)) return;
  if (session.organizationId !== organizationId) {
    throw new AuthorizationError('You do not have access to this organization.', 403);
  }
}

/**
 * Get the redirect path after login based on the user's role.
 */
export function getPostLoginRedirect(role: string): string {
  switch (role) {
    case 'opticore_owner':
    case 'opticore_staff':
      return '/crm';
    case 'partner_admin':
    case 'partner_installer':
      return '/partner';
    case 'customer':
      return '/customer';
    case 'admin':
      return '/admin';
    case 'client':
    default:
      return '/crm';
  }
}
