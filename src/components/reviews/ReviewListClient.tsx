 
'use client';
import {useState} from 'react';
import ReviewPageHeader from './ReviewPageHeader';
import ReviewList from './ReviewList';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner'; 

import {  ReviewResponse } from '@/types/reviews';
import { fetchReviews } from '@/lib/fetch/getReviews';




export default function ReviewListClient({
  initialReviewData,
}: {
  initialReviewData: ReviewResponse;
}) {

	const [reviewList, setReviewList] = useState<Style[]>(initialReviewData.reviews);
  const [nextCursor, setNextCursor] = useState<number | null>(initialReviewData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialReviewData.prevCursor);
  const [hasNext, setHasNext] = useState(initialReviewData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialReviewData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	 
	 
	const fetchData = async (cursor: number | null = null, direction: 'next' | 'prev' = 'next') =>{
		try 
		{
			setLoading(true);
			const  data :BarberResponse = await fetchReviews(cursor, direction);
			
			//console.log(data);
			
			setReviewList(data.reviews);
      setNextCursor(data.nextCursor);
      setPrevCursor(data.prevCursor);
      setHasNext(data.hasNext);
      setHasPrev(data.hasPrev);
      
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	 
	
	const selectReview  = (index: number)=>{
		setSelectedReviewIndex(index);
		 
	}
	
  return (
    <div className="px-2 md:px-5 lg:px-8 xl:px-15 pt-5 pb-20 min-h-screen">
      <ReviewPageHeader />
     
			<div className="  overflow-auto">
				{
					loading ? 
					(
						<Spinner />
					) : 
					(
						< >
							
							{
								reviewList.length === 0
								?
									<div className="text-center col-span-full py-10 text-gray-500">
										No review available at the moment.
									</div>
								:
									<ReviewList reviewList={reviewList}  />
						
							}
							
							{
								(hasNext || hasPrev)
								&&
								<PaginationControls
									onPrev={() => fetchData(prevCursor, 'prev')}
									onNext={() => fetchData(nextCursor, 'next')}
									hasPrev={hasPrev}
									hasNext={hasNext}
								/>	
							}
						</>
					)
					
				}
			</div>
			
			 
					
					
    </div>
  ); 
	 
}
