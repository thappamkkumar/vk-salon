// app/login/page.tsx

import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';  
import { redirect } from 'next/navigation';
import LoginForm from '@/components/login/LoginForm';

export default async function LoginPage() {
  const session = await getServerSession(authOptions);

  if (session?.user?.role === 'admin') {
    redirect('/admin/posts');
  }

  return (
    <main className="lg:min-h-screen flex lg:items-center justify-center py-30">
      <LoginForm />
    </main>
  );
}
