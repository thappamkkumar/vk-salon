'use client';

import Image from 'next/image';
import { FaStar  } from 'react-icons/fa';

import { Review } from '@/types/reviews';

 
const ReviewCard = ({ review } : {Review}) => {
	
	 
	
	return(
		 
 
          <div className="sm:flex gap-6 bg-white border border-gray-200 rounded-xl shadow-md overflow-hidden w-full max-w-2xl mx-auto mt-10 p-5">
            {/* Image */}
            <div className="relative w-28 h-28 md:w-40 md:h-40 flex-shrink-0 mx-auto sm:mx-0   cursor-pointer"  >
              <Image
                src={review.image}
                alt={review.name}
                fill
                sizes="150"
                className="object-cover rounded-full sm:rounded-md"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col items-center sm:items-start pt-4 sm:pt-0">
              <h3 className="text-base sm:text-lg md:text-xl font-semibold text-center sm:text-start">
                {review.name}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-gray-500 text-center sm:text-start">
                {review.address}
              </p>
              <div className="flex items-center my-1 text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <p className="text-sm sm:text-base md:text-lg text-gray-700 text-center sm:text-start italic font-[cursive] mt-2 leading-relaxed">
                “{review.message}”
              </p>
            </div>
          </div>
         
				 
	);

}

export default ReviewCard;