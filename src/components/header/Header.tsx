// components/Header.tsx
'use client';
import { FaArrowLeft } from 'react-icons/fa';
import { useRouter } from 'next/navigation'; // For Next.js, to handle navigation
import Link from 'next/link';

const Header: React.FC = () => {
  const router = useRouter();

  const handleBackClick = () => {
    // Check if there's a previous page in the browser history
    if (window.history.length > 2) {
      // Navigate back if there is a history state
			 
      router.back();
    } else {
      // Redirect to the home page if no history (direct access to the page)
      router.push('/');
    }
  };

  return (
    <header className="w-auto sticky top-0 left-0 flex w-full md:w-[93vw] md:rounded-xl border border-gray-100 px-2 py-4 bg-white shadow-lg mx-auto mt-2 z-100">
      {/* Back Button */}
      <button
        onClick={handleBackClick}
        className="text-gray-900 text-2xl hover:text-gray-400 rounded transition duration-300 px-2 py-1 cursor-pointer"
      >
        <FaArrowLeft />
      </button>
      <div className="w-full flex items-center justify-center text-2xl font-bold text-gray-900 font-[family-name:var(--font-lora)]">
        <Link href="/">VK Hair</Link>
      </div>
    </header>
  );
};

export default Header;
