import { redirect }   from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminSidebar   from '@/components/admin/AdminSidebar';

export const metadata = { title: 'Admin — OptiCore PH' };

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  return (
    <div className="min-h-screen bg-surface-950 flex">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
        {children}
      </main>
    </div>
  );
}
