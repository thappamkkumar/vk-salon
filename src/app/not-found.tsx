'use client';

import { useRouter } from 'next/navigation';

export default function NotFound() {
  const router = useRouter();

  function handleGoBack() {
    // If history length > 1, go back, else navigate to '/'
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center px-4">
      <div>
        <h1 className="text-6xl font-bold text-red-600">404</h1>
        <h2 className="text-2xl font-semibold mt-4">Page Not Found</h2>
        <p className="mt-2 text-gray-600">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button
          onClick={handleGoBack}
          className="inline-block mt-6 px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition cursor-pointer"
        >
          Go Back Home
        </button>
      </div>
    </div>
  );
}
