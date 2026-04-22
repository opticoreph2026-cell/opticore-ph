import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import { getClientById }  from '@/lib/db';
import DashboardSidebar   from '@/components/dashboard/Sidebar';
import DashboardMobileHeader from '@/components/dashboard/MobileHeader';
import Breadcrumbs from '@/components/ui/Breadcrumbs';

export const metadata = {
  title: 'Dashboard — OptiCore PH',
};

/**
 * Dashboard shell layout.
 * Verifies auth server-side and passes user info to nav components.
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
  } catch {
    // If Airtable is unreachable, still show dashboard with JWT data
    profile = { name: jwtUser.name, email: jwtUser.email, plan: 'starter' };
  }

  const user = profile ?? { name: jwtUser.name, email: jwtUser.email, plan: 'starter' };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative">
      {/* ── Global Mesh Glows — fixed so they cover viewport regardless of scroll ── */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-brand-500/[0.07] rounded-full blur-[130px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[700px] h-[700px] bg-blue-500/[0.04] rounded-full blur-[150px] pointer-events-none z-0" />

      <DashboardSidebar user={user} />

      {/* Main content — offset by sidebar width (260px) + left margin (24px) = 284px */}
      <div className="lg:ml-[284px] flex flex-col min-h-screen relative z-10">
        <DashboardMobileHeader user={user} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full max-w-7xl mx-auto">
          <Breadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
