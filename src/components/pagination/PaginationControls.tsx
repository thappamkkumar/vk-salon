// components/PaginationControls.tsx
import React from 'react';

type Props = {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
};

const PaginationControls: React.FC<Props> = ({ onPrev, onNext, hasPrev, hasNext }) => {
  return (
    <div className="flex justify-center gap-4 mt-10">
      <button
        className={`px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer transition duration-300 hover:bg-gray-800`}
        onClick={onPrev}
        disabled={!hasPrev}
      >
        Prev 
      </button>
      <button
        className={`px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer transition duration-300 hover:bg-gray-800`}
        onClick={onNext}
        disabled={!hasNext}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
