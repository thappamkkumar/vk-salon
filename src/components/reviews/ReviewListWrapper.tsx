// src/components/reviews/ReviewListWrapper.tsx
 
import { fetchReviews } from '@/lib/fetch/getReviews';
import ReviewListClient from './ReviewListClient';

export default async function ReviewListWrapper() {
  const reviews = await fetchReviews(null, 'next');
	 
	  return <ReviewListClient initialReviewData={reviews} />;
	
}
