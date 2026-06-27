import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  const role = session.user.role;
  if (role === 'opticore_owner' || role === 'opticore_staff') redirect('/crm');
  if (role === 'partner_admin' || role === 'partner_installer') redirect('/partner');
  if (role === 'admin') redirect('/admin');
  redirect('/customer');
}
