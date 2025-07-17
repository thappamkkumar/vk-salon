// src/components/admin/adminStyles/AdminStyleListWrapper.tsx
 
import { fetchStyle } from '@/lib/fetch/getStyles';
import AdminStyleListClient from './AdminStyleListClient';

export default async function AdminStyleListWrapper() {
  const styles = await fetchStyle(null, 'next');
 
	
  return <AdminStyleListClient initialStyleData={styles} />;
}
