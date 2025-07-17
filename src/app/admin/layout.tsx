import AdminNavbar from '@/components/admin/adminNavbar/AdminNavbar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="md:flex w-full md:h-screen md:overflow-hidden bg-white">
      <AdminNavbar />
      <main className="flex-1 md:overflow-auto p-6 ">
        {children}
      </main>
    </div>
  );
}
