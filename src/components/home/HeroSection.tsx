'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

const HeroSection = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, hash: string) => {
    e.preventDefault();
    const id = hash.replace('#', '');

    if (pathname === '/') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push(`/#${id}`);
    }
  };

  // Scroll on hash after navigation to home
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
    <section
      className="min-h-screen w-full bg-[url('/vendor/images/hero-section-bg-image-1.png')] bg-cover bg-[position:center_top] bg-no-repeat bg-fixed"
      id="hero-section"
    >
      <div className="min-h-screen w-full flex flex-col justify-end md:justify-center pb-30 md:pb-0 px-4 md:px-5 lg:px-9">
        <div>
          <h1 className="text-white text-6xl sm:text-7xl lg:text-7xl xl:text-9xl font-bold font-[family-name:var(--font-lora)]">
            Perfect Style
          </h1>

          <h5 className="text-gray-200 font-semibold text-lg sm:text-xl mt-3">
            Your best look start here - book your chair today.
          </h5>

          <a
            href="#appointment"
            onClick={(e) => handleAnchorClick(e, '#appointment')}
            className="inline-block text-lg sm:text-xl font-semibold mt-3 py-2 px-4 rounded-lg bg-yellow-500  text-black rounded-md hover:bg-yellow-600  transition-colors duration-300 ease-in-out"
          >
            BOOK AN APPOINTMENT
          </a>
        </div>

        <div className="mt-20">
          <strong className="w-full md:w-auto block md:inline text-center md:text-start text-lg sm:text-xl lg:text-4xl text-gray-300 bg-[rgba(255,255,255,0.2)] p-3 rounded-lg">
            Open :- 09:00 AM - 09:00 PM
          </strong>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
