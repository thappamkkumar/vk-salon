'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function Footer() {
  const router = useRouter();
  const pathname = usePathname();

	const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) return null;
	
  const handleAnchorClick = (hash: string) => {
    const id = hash.replace('#', '');
    if (pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // Navigate to home with hash, scroll handled by useEffect
      router.push(`/#${id}`);
    }
  };

  useEffect(() => {
    if (pathname === '/') {
      const hash = window.location.hash;
      if (hash) {
        const id = hash.replace('#', '');

        const scrollToElement = () => {
          const el = document.getElementById(id);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          } else {
            setTimeout(scrollToElement, 100);
          }
        };

        scrollToElement();
      }
    }
  }, [pathname]);

  return (
    <footer className="bg-gradient-to-r from-black via-gray-900 to-black text-white px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Column 1: Logo & Intro */}
        <div>
          <h2 className="text-2xl font-bold mb-4">VK Hair</h2>
          <p className="text-sm text-gray-300">
            At VK Hair, it’s not just grooming — it’s an experience. 
            We blend tradition with style to deliver confidence and class.
          </p>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-2 text-sm">
            <li><Link href="/" className="hover:underline cursor-pointer">Home</Link></li>
            <li><Link href="/posts" className="hover:underline cursor-pointer">Posts</Link></li>
            <li><Link href="/styles" className="hover:underline cursor-pointer">Styles</Link></li>
            <li><Link href="/services" className="hover:underline cursor-pointer">Services</Link></li>
            <li><Link href="/reviews" className="hover:underline cursor-pointer">Reviews</Link></li>
            
            <li>
              <button
                onClick={() => handleAnchorClick('#about')}
                className="hover:underline text-left cursor-pointer"
              >
                About
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Appointment CTA */}
        <div>
          <h3 className="text-xl font-semibold mb-4">Book Your Appointment</h3>
          <p className="text-sm text-gray-300 mb-4">
            Ready for a fresh look? Schedule your visit today.
          </p>
          <button
            onClick={() => handleAnchorClick('#appointment')}
            className="inline-block bg-yellow-500 hover:bg-yellow-600 text-black font-semibold  px-4 py-2 rounded transition cursor-pointer"
            aria-label="Book appointment now"
          >
            Book Now
          </button>
        </div>
      </div>

      <div className="mt-12 border-t border-gray-700 pt-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} VK Hair. All rights reserved.
      </div>
    </footer>
  );
}
