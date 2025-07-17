'use client';

import Image from 'next/image';
import { Service } from '@/types/services';

interface ServiceCardProps {
  service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <div
      className="border border-gray-200 rounded-md shadow-[8px_5px_15px_-3px_rgba(0,0,0,0.5)] overflow-hidden p-4 flex flex-col cursor-pointer transition-colors hover:bg-gray-200 group"
    >
      {/* Image container with hover scale effect */}
      <div className="relative aspect-square w-full mb-4 overflow-hidden rounded-sm">
        <div className="absolute inset-0 transition-transform duration-300 ease-in-out group-hover:scale-105">
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover rounded-sm"
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 200px, 100vw"
          />
        </div>
      </div>

      <h3 className="text-lg font-bold text-center">{service.title}</h3>
      <p className="text-center text-gray-500 font-semibold">{service.price}</p>
    </div>
  );
}
