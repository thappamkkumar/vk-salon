'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LogoutConfirmation() {
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' }); // Redirects to home
  };

  const handleCancel = () => {
   router.back(); // or router.back()
  };

  return (
    <div className="bg-white p-6 rounded shadow-md text-center max-w-sm w-full">
      <h1 className="text-xl font-bold mb-4">Confirm Logout</h1>
      <p className="mb-6 text-gray-700">Are you sure you want to logout?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={handleLogout}
          className="bg-black cursor-pointer text-white px-4 py-2 rounded hover:bg-gray-800"
        >
          Yes, Logout
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-300 cursor-pointer text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
