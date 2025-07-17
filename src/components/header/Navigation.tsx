'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  FaBars,
  FaTimes,
  FaHome,
  FaClipboardList,
  FaCut,
  FaConciergeBell,
  FaInfoCircle,
} from 'react-icons/fa';
import { NavItem } from '@/types/naviagtion';

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
	const pathname = usePathname();
	
	//const isAdminRoute = pathname.startsWith("/admin");

  //if (isAdminRoute) return null;
	

  const navItems: NavItem[] = [
    { href: '/', label: 'Home', icon: <FaHome /> },
    { href: '/posts', label: 'Posts', icon: <FaClipboardList /> },
    { href: '/styles', label: 'Styles', icon: <FaCut /> },
    { href: '/services', label: 'Services', icon: <FaConciergeBell /> },
    { href: '#about', label: 'About', icon: <FaInfoCircle />, isAnchor: true },
  ];

  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  // Get current hash (anchor) safely
  const [hash, setHash] = useState('');
  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash || '');
    handleHashChange(); // set initially
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Compute active nav index from pathname + hash
  const activeIndex = navItems.findIndex((item) => {
    if (item.isAnchor) {
      return item.href === hash;
    } else {
      return item.href === pathname;
    }
  });

  const handleAnchorClick = (href: string, e: React.MouseEvent) => {
    e.preventDefault();
    const id = href.replace('#', '');
    if (pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        router.replace(`/#${id}`, undefined, { scroll: false });
        setIsOpen(false);
      }
    } else {
      router.push(`/#${id}`);
      setIsOpen(false);
    }
  };

  return (
    <>
      <header className="w-full md:w-[93vw] md:rounded-xl px-6 py-4 bg-white shadow-lg fixed top-0 md:top-2 left-1/2 transform -translate-x-1/2 z-50">
        <div className="flex justify-between items-center">
          <div className="text-2xl font-bold text-gray-900 font-[family-name:var(--font-lora)]">
            <Link href="/">VK Hair</Link>
          </div>

          <nav
            className="hidden md:flex gap-6 text-base items-center"
            aria-label="Primary Navigation"
          >
            {navItems.map((item, index) =>
              item.isAnchor ? (
                <Link
                  key={item.label}
                  href={item.href}
                  scroll={false}
                  onClick={(e) => handleAnchorClick(item.href, e)}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    activeIndex === index ? 'text-yellow-600' : 'text-gray-800'
                  } hover:text-yellow-500 transition-all duration-200 cursor-pointer`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-2 px-2 py-1 ${
                    activeIndex === index ? 'text-yellow-600' : 'text-gray-800'
                  } hover:text-yellow-500 transition-all duration-200 cursor-pointer`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              )
            )}
          </nav>

          <button
            className="md:hidden text-gray-800 cursor-pointer hover:text-gray-500 transition duration-300"
            onClick={() => setIsOpen(true)}
            aria-label="Open menu"
          >
            <FaBars size={20} />
          </button>
        </div>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        aria-label="Mobile Navigation"
      >
        <div className="flex justify-end p-4">
          <button
            className="text-gray-800 cursor-pointer hover:text-gray-500 transition duration-300"
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            <FaTimes size={24} />
          </button>
        </div>
        <ul className="flex flex-col gap-3 py-4 text-lg font-medium px-4">
          {navItems.map((item, index) =>
            item.isAnchor ? (
              <li key={item.label}>
                <Link
                  href={item.href}
                  scroll={false}
                  onClick={(e) => handleAnchorClick(item.href, e)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded ${
                    activeIndex === index ? 'bg-yellow-100 text-yellow-600' : 'text-gray-800'
                  } hover:bg-yellow-100 transition cursor-pointer`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            ) : (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded ${
                    activeIndex === index ? 'bg-yellow-100 text-yellow-600' : 'text-gray-800'
                  } hover:bg-yellow-100 transition cursor-pointer`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              </li>
            )
          )}
        </ul>
      </aside>
    </>
  );
}
