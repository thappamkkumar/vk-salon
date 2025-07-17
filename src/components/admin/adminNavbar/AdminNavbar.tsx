'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FaBars,
  FaTimes,
  FaClipboardList,
  FaCut,
  FaConciergeBell,
  FaUserTie,
  FaStar,
  FaCalendarAlt,
  FaEnvelope,
  FaUser,
} from 'react-icons/fa';

const menuItems = [
  { label: 'Posts', href: '/admin/posts', icon: <FaClipboardList /> },
  { label: 'Styles', href: '/admin/styles', icon: <FaCut /> },
  { label: 'Services', href: '/admin/services', icon: <FaConciergeBell /> },
  { label: 'Barbers', href: '/admin/barbers', icon: <FaUserTie /> },
  { label: 'Reviews', href: '/admin/reviews', icon: <FaStar /> },
  { label: 'Appointments', href: '/admin/appointments', icon: <FaCalendarAlt /> },
  { label: 'Contact', href: '/admin/contact', icon: <FaEnvelope /> },
  { label: 'Profile', href: '/admin/profile', icon: <FaUser /> },
];

export default function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // ?? current route

  const toggleMenu = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);
	
	useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
	
  return (
    <div className="flex  ">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-screen w-64 overflow-auto  bg-gradient-to-r from-black via-gray-900 to-black pb-10  text-white z-100 transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:relative md:flex md:flex-col
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between sticky top-0 left-0 bg-black p-4 border-b border-gray-500">
          <div className="text-xl  md:text-2xl font-bold  font-[family-name:var(--font-lora)]">VK Hair  </div>
          <button onClick={toggleMenu} className="text-gray-100 text-lg  cursor-pointer hover:text-gray-300 transition duration-300  md:hidden">
            <FaTimes />
          </button>
        </div>
       

        {/* Navigation */}
        <nav className="flex flex-col p-4 space-y-4">
          {menuItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-3 px-2 py-2 rounded transition-colors ${
                  isActive
                    ? 'bg-yellow-500 text-black font-semibold'
                    : 'hover:text-yellow-400'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Topbar for Mobile */}
      <div className="md:hidden    w-full flex justify-between items-center p-4 bg-black text-white">
        <h1 className="text-xl  md:text-2xl  font-bold  font-[family-name:var(--font-lora)]">VK Hair</h1>
				{
					!isOpen && 
						<button onClick={toggleMenu} className="text-gray-100 text-lg cursor-pointer hover:text-gray-300 transition duration-300">
							<FaBars />
						</button>
				}
			
      </div>
    </div>
  );
}
