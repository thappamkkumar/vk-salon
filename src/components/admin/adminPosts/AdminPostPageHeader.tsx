'use client';

import Link from 'next/link';
import { FaPlus } from 'react-icons/fa';

export default function AdminPostPageHeader() {
  return (
    <header className="flex justify-between items-center mb-6">
      <h1 className="text-xl md:text-2xl xl:text-4xl font-bold">
        Our Posts
      </h1>

      <Link
        href="/admin/posts/create"
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-4 py-2 rounded transition"
      >
        <FaPlus />
        New Post
      </Link>
    </header>
  );
}
