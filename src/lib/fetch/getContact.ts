// lib/getContact.ts

import {  Contact} from '@/types/contact';

export const fetchContact= async (): Promise<Contact> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/contact`);
	
	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch contact');
  }

  return await res.json();
};
