// lib/getAppointments.ts

import {  AppointmentResponse } from '@/types/appointment';

export const fetchAppointment = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next'): Promise<AppointmentResponse> => {

 const url = new URL(`${process.env.NEXT_PUBLIC_SITE_URL}/api/appointments`);
	if (cursor !== null) url.searchParams.set('cursor', cursor.toString());
	url.searchParams.set('direction', direction);

	const res = await fetch(url.toString(),{
    cache: 'no-store', // Ensure SSR: no caching
  });
	 
 
  if (!res.ok) {
    throw new Error('Failed to fetch appointments`');
  }

  return await res.json();
};
