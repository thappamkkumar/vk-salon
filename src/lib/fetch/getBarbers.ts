// lib/getBarbers.ts

import {  BarberResponse } from '@/types/brabers';

export const fetchBarber= async (cursor: number | null = null, direction: 'next' | 'prev' = 'next'): Promise<BarberResponse> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/barbers`);
	if (cursor !== null) url.searchParams.set('cursor', cursor.toString());
	url.searchParams.set('direction', direction);

	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch barbers`');
  }

  return await res.json();
};
