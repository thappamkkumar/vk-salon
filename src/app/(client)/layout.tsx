// app/(client)/layout.tsx

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';


import Navigation from '@/components/header/Navigation';
import Footer from '@/components/footer/Footer';	

export default async function ClientLayout({ children }: { children: React.ReactNode }) {

	const session = await getServerSession(authOptions);

  if (session && session.user.role === 'admin') {
    redirect('/admin/posts');
  }
	
	
  return (
    <>
      <Navigation />
			  
     {children}
		   
			<Footer />
    </>
  );
}
