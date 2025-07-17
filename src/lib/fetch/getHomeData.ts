// lib/getHomeData.ts

import {  Barber } from '@/types/brabers';
import {  Review } from '@/types/reviews';
import {  Service} from '@/types/services';
import {  Contact} from '@/types/contact';

type props = {
	barbers: Barber[];
	reviews: Review[];
	services: Service[];
	contact: Contact;
};
export const fetchHomeData= async (): Promise<props> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/homeData`);
	
	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch data for home page.`');
  }

  return await res.json();
};
