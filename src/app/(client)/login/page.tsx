// app/login/page.tsx
 
import LoginForm from '@/components/login/LoginForm';

export default async function LoginPage() {
  

  return (
    <main className="lg:min-h-screen flex lg:items-center justify-center py-30">
      <LoginForm />
    </main>
  );
}
