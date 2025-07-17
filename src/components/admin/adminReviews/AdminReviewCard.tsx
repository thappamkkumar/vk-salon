'use client';
 
import { FaTimes   } from 'react-icons/fa';
import ReviewCard from '@/components/reviews/ReviewCard';
import { Review } from '@/types/reviews';

type Props = {
  review: Review;
  setSelectedStyleIndex: (index: number) => void;
};

const AdminReviewCard = ({ review, setSelectedStyleIndex }: Props) => {
	
	
	const onClose = () =>{  
		setSelectedStyleIndex(null);  
	}	
	
	return(
		<div className="fixed inset-0 z-110 bg-black/90 flex items-center justify-center">
			
			{/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
        aria-label="Close"
      >
        <FaTimes />
      </button>

			<div key={review.id} className="">
          <ReviewCard review={review} />
      </div>
				
		</div>
	);

}

export default AdminReviewCard;