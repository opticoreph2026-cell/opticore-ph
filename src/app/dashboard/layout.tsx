import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getUserById }  from '@/lib/db';
import DashboardShell from '@/components/dashboard/DashboardShell';

export const metadata = {
  title: 'Dashboard — OptiCore PH',
};

/**
 * Dashboard shell layout.
 * Verifies auth server-side and passes user info to the client-side shell.
 */
export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const jwtUser = await getCurrentUser();
  if (!jwtUser) redirect('/login');

  // Load full profile from DB
  let profile = null;
  try {
    const record = await getUserById(jwtUser.sub);
    if (record) {
      profile = {
        name:  record.name  ?? jwtUser.name,
        email: record.email ?? jwtUser.email,
        planTier:  record.planTier ?? 'starter',
        avatar: record.avatar ?? jwtUser.avatar,
        properties: record.properties || [],
      };
    }
  } catch (err) {
    console.error('DB profile fetch error:', err);
  }

  const user = profile ?? { 
    name: jwtUser.name, 
    email: jwtUser.email, 
    planTier: 'starter',
    avatar: jwtUser.avatar,
    properties: [],
  };

  return (
    <DashboardShell user={user}>
      {children}
    </DashboardShell>
  );
}
