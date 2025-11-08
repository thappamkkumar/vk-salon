// app/admin/logout/page.tsx
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';  
import { redirect } from 'next/navigation';
import LogoutConfirmation from '@/components/admin/logout/LogoutConfirmation';

export default async function AdminLogoutPage() {
  const session = await getServerSession(authOptions);
	
	const user = session?.user as { id?: number; role?: string } | undefined;
 
  // If not logged in or not admin, redirect to home
  if (user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <LogoutConfirmation />
    </main>
  );
}
	