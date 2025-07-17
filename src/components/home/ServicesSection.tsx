import Image from 'next/image';
import ServiceCarousel from './ServiceCarousel';
import {Service} from '@/types/services';
import { fetchServices } from '@/lib/fetch/getServices';  
import { Service,   } from '@/types/services';

 

export default async function ServicesSection({
  services,
}: {
  services: Service[];
}) {

   
  if ( services.length === 0) {
    return null;
  }

  return (
    <section
      className="h-auto w-full py-18 px-2 md:px-5 lg:px-8 xl:px-15"
      id="services"
    >
      <div className="text-[10vw] sm:text-5xl lg:text-6xl xl:text-7xl py-8 md:py-2 flex justify-center items-center font-[family-name:var(--font-lora)] ">
        <strong>Ser</strong>
        <span className="block h-[25vw] w-[9vw] sm:h-30 sm:w-10 lg:h-35 lg:w-11 xl:h-45 xl:w-15 mx-2 bg-[url('/vendor/images/img2.png')] bg-contain bg-left bg-no-repeat" />
        <strong>ices</strong>
      </div>

       <ServiceCarousel serviceList={services} />
    </section>
  );
}
