// app/components/BarberSection.tsx 
import Image from 'next/image';
import { FaPhoneAlt, FaCut } from 'react-icons/fa'; 
 
import {  Barber } from '@/types/brabers';
 


 

export default async function BarberSection({
  barbers,
}: {
  barbers: Barber[];
}) {
  
  if (barbers.length === 0) {
    return null;
  }

  return (
    <section className="h-auto w-full pb-18 px-4 md:px-5 lg:px-8 xl:px-15" id="barbers">
      <div className="flex flex-wrap justify-center gap-8">
        {barbers.map((barber) => (
          <div
            key={barber.id}
            className="bg-gray-200 rounded-2xl shadow-lg border border-gray-200 p-6 flex flex-col items-center text-center w-full sm:max-w-sm  "
          >
            {/* Image Section */}
            <div className="relative w-28 h-28 lg:w-40 lg:h-40 mb-4">
              <Image
                src={barber.image}
                alt={barber.name}
                fill
								sizes={150}
                className="rounded-full object-cover"
              />
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{barber.name}</h3>
              <p className="text-gray-600 ">
								<a
									href={`tel:${barber.contact.replace(/\s+/g, '')}`} // Remove spaces
									className="flex items-center gap-2 hover:underline"
								>
									<FaPhoneAlt className="text-green-500" />
									{barber.contact}
								</a>

                
              </p>
              <p className="text-gray-500 mt-1 flex items-center gap-2">
                <FaCut className="text-blue-400" />
                {barber.experience} years experience
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
