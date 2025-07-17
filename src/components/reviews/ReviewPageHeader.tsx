'use client';

import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

export default function ReviewPageHeader() {
  return (
    <header className="flex justify-between items-center  ">
      <h1 className="text-xl md:text-2xl xl:text-4xl font-bold">
        Client Reviews
      </h1>

      <Link
        href="/reviews/addNewReview"
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded transition"
      >
        <FaPlus />
        Your Reviews
      </Link>
    </header>
  );
}
