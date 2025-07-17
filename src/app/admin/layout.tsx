// app/admin/layout.tsx (or wherever your AdminLayout is used)
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

import AdminNavbar from '@/components/admin/adminNavbar/AdminNavbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div className="md:flex w-full md:h-screen md:overflow-hidden bg-white">
      <AdminNavbar />
      <main className="flex-1 md:overflow-auto p-6">
        {children}
      </main>
    </div>
  );
}
