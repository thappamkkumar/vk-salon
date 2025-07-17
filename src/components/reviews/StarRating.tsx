'use client';
import { FaStar } from 'react-icons/fa';

type StarRatingProps = {
  rating: number;
  onRate: (rating: number) => void;
};

export default function StarRating({ rating, onRate }: StarRatingProps) {
  return (
    <div className="flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onRate(star)}
          className={`text-2xl focus:outline-none ${
            star <= rating ? 'text-yellow-400' : 'text-gray-300'
          }`}
          aria-label={`Rate ${star}`}
        >
          <FaStar />
        </button>
      ))}
    </div>
  );
}
