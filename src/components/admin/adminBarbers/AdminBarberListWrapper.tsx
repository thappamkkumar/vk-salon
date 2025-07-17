// src/components/admin/adminBarbers/AdminBarberListWrapper.tsx
 
import { fetchBarber } from '@/lib/fetch/getBarbers';
import AdminBarberListClient from './AdminBarberListClient';

export default async function AdminBarberListWrapper() {
  const barbers = await fetchBarber(null, 'next');
 
	return <AdminBarberListClient initialBarberData={barbers} />;
	
}
