'use client';

import { useState } from 'react';  
import ReviewCard from '@/components/reviews/ReviewCard';
import { Review } from '@/types/reviews';
import Link from 'next/link';

type Props = {
  reviews: Review[];
};

export default function ReviewCarousel({ reviews }: Props) {
  const [current, setCurrent] = useState(0);

  // +1 for the "View All" slide
  const totalSlides = reviews.length + 1;

  const nextSlide = () => {
		if(current < reviews.length)
		{  
		setCurrent((prev) => (prev + 1) % totalSlides);
		}
	}
  const prevSlide = () => {
		if(current > 0 )
		{
			setCurrent((prev) => (prev - 1 + totalSlides) % totalSlides);
		}
	}

  const isLastSlide = current === reviews.length;
  const review = reviews[current];

  return (
    <div className="relative w-full">
      {/* Prev/Next buttons */}
			{
				current > 0 && 
				<button
					onClick={prevSlide}
					className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 text-5xl rounded-lg shadow cursor-pointer hover:bg-gray-200 z-10"
				>
					‹
				</button>
			}
			{
				current < reviews.length && 
				 <button
					onClick={nextSlide}
					className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-gray-300 p-2 text-5xl rounded-lg shadow cursor-pointer hover:bg-gray-200 z-10"
				>
					›
				</button>
			}
     

      {/* Slide content */}
      {isLastSlide ? (
        <div className="flex flex-col items-center justify-center gap-4 bg-white border border-gray-200 rounded-xl shadow-md w-full max-w-2xl mx-auto mt-10 p-10 text-center">
          <h3 className="text-xl font-semibold text-gray-700">Want to see more?</h3>
          <p className="text-gray-500 text-sm">Browse all customer feedback</p>
          <Link href="/reviews" className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition">
            View All Reviews
          </Link>
        </div>
      ) : (
         <ReviewCard review={review} />
      )}
    </div>
  );
}
