// lib/getServices.ts

import {  ServiceResponse } from '@/types/services';

export const fetchServices = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next'): Promise<ServiceResponse> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/services`);
	if (cursor !== null) url.searchParams.set('cursor', cursor.toString());
	url.searchParams.set('direction', direction);

	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch services`');
  }

  return await res.json();
};
