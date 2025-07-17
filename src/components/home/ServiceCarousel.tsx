'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Service } from '@/types/services';
import Link from 'next/link';

export default function ServiceCarousel({ serviceList }: { serviceList: Service[] }) {
  const [activeIndex, setActiveIndex] = useState(1); // Start with second item
  const [renderedIndices, setRenderedIndices] = useState([0, 1, 2]);

  const totalSlides = serviceList.length + 1; // +1 for the "View All" slide

  const navigateTo = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= totalSlides || newIndex === activeIndex) return;

    // Move active slide first
    setActiveIndex(newIndex);

    // After delay, update renderedIndices for left/right slides
    setTimeout(() => {
      const updated = [newIndex - 1, newIndex, newIndex + 1];
      setRenderedIndices(updated.filter((i) => i >= 0 && i < totalSlides));
    }, 400); // Delay matches CSS transition duration
  };

  return (
    <>
      <div className="py-10 lg:py-18 min-h-[24rem] sm:min-h-[26rem] lg:min-h-[34rem] overflow-hidden">
        <div className="relative w-full max-w-6xl h-full mx-auto">
          {renderedIndices.map((index) => {
            const isActive = index === activeIndex;
            const isLeft = index === activeIndex - 1;
            const isRight = index === activeIndex + 1;

            let positionClass = '';
            if (isActive) {
              positionClass =
                'left-1/2 -translate-x-1/2 scale-[1.15] lg:scale-[1.3] z-30 bg-black text-white';
            } else if (isLeft) {
              positionClass =
                'left-[8%] sm:left-1/4 -translate-x-1/2 scale-90 z-20 bg-black/80 text-white hover:bg-black/50';
            } else if (isRight) {
              positionClass =
                'left-[92%] sm:left-3/4 -translate-x-1/2 scale-90 z-20 bg-black/80 text-white hover:bg-black/50';
            } else {
              return null;
            }

            // Render final "View All" slide
            if (index === serviceList.length) {
              return (
                <div
                  key="view-all"
                  onClick={() => navigateTo(index)}
                  className={`absolute top-0 transition-all duration-400 ease-in-out cursor-pointer p-4 rounded-xl shadow-lg bg-yellow-500 text-black w-55 h-72 sm:w-65 sm:h-80 lg:w-79 lg:h-96 flex flex-col justify-center items-center text-center ${positionClass}`}
                >
                  <h3 className="text-xl font-bold mb-2">Want to see more?</h3>
                  <p className="text-sm mb-4">Explore our full list of services</p>
                  <Link
                    href="/services"
                    className="px-5 py-2 bg-black text-white rounded hover:bg-gray-800 transition"
                  >
                    View All Services
                  </Link>
                </div>
              );
            }

            const service = serviceList[index];
            if (!service) return null;

            return (
              <div
                key={service.id}
                onClick={() => navigateTo(index)}
                className={`absolute top-0 transition-all duration-400 ease-in-out cursor-pointer p-4 rounded-xl shadow-lg bg-black text-white ${positionClass}`}
              >
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 lg:w-72 lg:h-72 mx-auto mb-4">
                  <Image
                    src={service.image}
                    alt={service.title}
                    fill
                    sizes="300px"
                    className="object-cover rounded-lg"
                  />
                </div>
                <h3 className="text-xl font-bold text-center">{service.title}</h3>
                <p className="text-center text-yellow-500 font-semibold">{service.price}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-3">
        <button
          onClick={() => navigateTo(activeIndex - 1)}
          className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 transition disabled:opacity-40 cursor-pointer"
          disabled={activeIndex === 0}
        >
          Prev
        </button>
        <button
          onClick={() => navigateTo(activeIndex + 1)}
          className="px-4 py-2 bg-yellow-500 text-black font-semibold rounded-md hover:bg-yellow-600 transition disabled:opacity-40 cursor-pointer"
          disabled={activeIndex === totalSlides - 1}
        >
          Next
        </button>
      </div>
    </>
  );
}
