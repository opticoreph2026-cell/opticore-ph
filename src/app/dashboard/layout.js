import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getClientById }  from '@/lib/db';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const metadata = {
  title: 'Dashboard — OptiCore PH',
};

/**
 * Dashboard shell layout.
 * Verifies auth server-side and passes user info to the client-side shell.
 */
export default async function DashboardLayout({ children }) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  // Load full profile from Airtable (non-critical — degrade gracefully)
  let profile = null;
  try {
    const record = await getClientById(jwtUser.sub);
    if (record) {
      profile = {
        name:  record.name  ?? jwtUser.name,
        email: record.email ?? jwtUser.email,
        plan:  record.planTier ?? 'starter',
      };
    }
  } catch (err) {
    console.error('Airtable profile fetch error:', err);
    // Degrade gracefully using JWT data
  }

  const user = profile ?? { 
    name: jwtUser.name, 
    email: jwtUser.email, 
    plan: 'starter' 
  };

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
