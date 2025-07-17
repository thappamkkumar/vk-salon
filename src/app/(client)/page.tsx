// app/page.tsx (or your page file)
//import { getServerSession } from "next-auth/next";
//import { authOptions } from "@/app/api/auth/[...nextauth]/route";
//import { redirect } from "next/navigation";

import HeroSection from '@/components/home/HeroSection';
import ServicesSection from '@/components/home/ServicesSection';
import AboutSection from '@/components/home/AboutSection';
import BarberSection from '@/components/home/BarberSection';
import ReviewSection from '@/components/home/ReviewSection';
import AppointmentSection from '@/components/home/AppointmentSection';

import { fetchHomeData } from '@/lib/fetch/getHomeData';

export default async function Home() {
	
	const homeData = await fetchHomeData();
	
	
 // const session = await getServerSession(authOptions);

 // if (!session) {
    //redirect('/admin/login');
 // }

  return (
    <main>
      <div>
      
        <HeroSection />
        {homeData?.services && <ServicesSection  services={homeData.services}/>}
        <AboutSection />
        {homeData?.barbers && <BarberSection barbers={homeData.barbers} />}
				{homeData?.reviews &&  <ReviewSection reviews={homeData.reviews} />}
        <AppointmentSection contact={homeData?.contact} /> 
      </div>
    </main>
  );
}
