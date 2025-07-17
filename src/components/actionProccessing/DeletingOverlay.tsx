'use client';

import { useContextState } from '@/context/contextState';
import { FaTrash, FaTimes } from 'react-icons/fa';

export default function DeletingOverlay() {
  const { deleting, setDeleting } = useContextState();

  if (!deleting) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9998]">
      <div className="relative flex items-center gap-3 bg-white shadow-xl px-4 py-3 rounded-xl border-l-4 border-red-500">
        <FaTrash className="text-red-500 text-xl animate-bounce" />
        <span className="text-gray-800 font-medium">Deleting...</span>
        <button
          onClick={() => setDeleting(false)}
          className="absolute top-1 right-1 text-gray-400 cursor-pointer hover:text-black transition"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
