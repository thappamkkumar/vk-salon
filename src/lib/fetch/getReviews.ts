// lib/getReviews.ts

import {  ReviewResponse } from '@/types/reviews';

export const fetchReviews = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next'): Promise<ServiceResponse> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/reviews`);
	if (cursor !== null) url.searchParams.set('cursor', cursor.toString());
	url.searchParams.set('direction', direction);

	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch reviews`');
  }

  return await res.json();
};
