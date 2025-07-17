type PaginationProps = {
  hasNext: boolean;
  hasPrev: boolean;
  onNext: () => void;
  onPrev: () => void;
	
};

export default function Pagination({ hasNext, hasPrev, onNext, onPrev }: PaginationProps) {
  return (
    <div className="flex justify-center gap-4 mt-8">
      <button
        onClick={onPrev}
        disabled={!hasPrev}
        className={`px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer transition duration-300 hover:bg-gray-800`}
      >
        Prev
      </button>
      <button
        onClick={onNext}
        disabled={!hasNext}
        className={`px-4 py-2 rounded bg-black text-white disabled:opacity-50 cursor-pointer transition duration-300 hover:bg-gray-800`}
      >
        Next
      </button>
    </div>
  );
}
