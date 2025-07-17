// src/components/admin/adminReviews/AdminReviewListWrapper.tsx
 
import { fetchReviews } from '@/lib/fetch/getReviews';
import AdminReviewListClient from './AdminReviewListClient';

export default async function AdminReviewListWrapper() {
  const reviews = await fetchReviews(null, 'next');
	 
	return <AdminReviewListClient initialReviewData={reviews} />;
	
}
