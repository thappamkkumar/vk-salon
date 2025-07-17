'use client';

import { Review } from '@/types/reviews';
import ReviewCard from './ReviewCard';

type Props = {
  reviewList: Review[];
};

const ReviewList = ({ reviewList }: Props) => {
  return (
    <div>
      {reviewList.map((review) => (
        <div key={review.id}>
          <ReviewCard review={review} />
        </div>
      ))}
    </div>
  );
};

export default ReviewList;
