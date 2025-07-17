// src/components/admin/adminAppointments/AdminAppointmentListWrapper.tsx
 
import { fetchAppointment } from '@/lib/fetch/getAppointments';
import AdminAppointmentListClient from './AdminAppointmentListClient';

export default async function AdminAppointmentListWrapper() {
  const appointments = await fetchAppointment(null, 'next');
 
	return <AdminAppointmentListClient initialAppointmentData={appointments} />;
	
}
