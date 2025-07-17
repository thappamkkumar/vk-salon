 
'use client';
import {useState} from 'react';
import AdminReviewPageHeader from './AdminReviewPageHeader';
import AdminReviewList from './AdminReviewList';
import AdminReviewCard from './AdminReviewCard';
import PaginationControls from '@/components/pagination/PaginationControls';
import Spinner from '@/components/loader/Spinner';
import StyleCarousel from '@/components/styles/StyleCarousel';

import {Review,  ReviewResponse } from '@/types/reviews';
import { fetchReviews } from '@/lib/fetch/getReviews';




export default function AdminReviewListClient({
  initialReviewData,
}: {
  initialReviewData: ReviewResponse;
}) {

	const [reviewList, setReviewList] = useState<Review[]>(initialReviewData.reviews);
  const [nextCursor, setNextCursor] = useState<number | null>(initialReviewData.nextCursor);
  const [prevCursor, setPrevCursor] = useState<number | null>(initialReviewData.prevCursor);
  const [hasNext, setHasNext] = useState(initialReviewData.hasNext);
  const [hasPrev, setHasPrev] = useState(initialReviewData.hasPrev);
	const [loading, setLoading] = useState(false); // ?? New loading state
	const [selectedReviewIndex, setSelectedReviewIndex] = useState<number | null>(null);
  

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
      setSelectedReviewIndex(null);
			
			// ? Scroll to top after new data is loaded
			window.scrollTo({ top: 0, behavior: 'smooth' });
			
			
			
		} catch (error) {
     // console.error('Pagination fetch error:', error);
    }finally {
      setLoading(false); // End loading
    }
	}
	
	const onDelete = (id: number)=>{
		setReviewList(prev => prev.filter(barber => barber.id !== id));
	}
	
	const selectReview  = (index: number)=>{
		setSelectedReviewIndex(index);
		 
	}
	
  return (
    <>
      <AdminReviewPageHeader />
     
			<div className="py-10 overflow-auto">
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
									 <AdminReviewList reviewList={reviewList}  onDelete={onDelete} selectReview={selectReview} />
						
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
			
			{selectedReviewIndex !== null && (
				<AdminReviewCard  
					review={reviewList[selectedReviewIndex]} 
					setSelectedStyleIndex={setSelectedReviewIndex}
				/>
			)}
					
					
    </>
  ); 
	 
}
