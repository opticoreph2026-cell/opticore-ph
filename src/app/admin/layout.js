import { redirect }   from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import AdminShell from '@/components/admin/AdminShell';

export const metadata = { title: 'Admin — OptiCore PH' };

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') redirect('/login');

  return (
    <AdminShell user={user}>
      {children}
    </AdminShell>
  );
}
