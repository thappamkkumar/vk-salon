// src/components/admin/adminStyles/AdminStyleListWrapper.tsx
 
import { fetchServices } from '@/lib/fetch/getServices';
import AdminServiceListClient from './AdminServiceListClient';

export default async function AdminServicesListWrapper() {
  const services = await fetchServices(null, 'next');
  
  return <AdminServiceListClient initialServicesData={services} />;
}
