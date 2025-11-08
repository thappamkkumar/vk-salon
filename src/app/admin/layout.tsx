// app/admin/layout.tsx (or wherever your AdminLayout is used)
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

import AdminNavbar from '@/components/admin/adminNavbar/AdminNavbar';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
	
	const user = session?.user as { id?: number; role?: string } | undefined;

  if (user?.role !== "admin") {
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
