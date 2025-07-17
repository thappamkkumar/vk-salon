'use client';

import { useEffect, useRef } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useContextState } from '@/context/contextState';

export default function MessageBox() {
  const { messageBox, closeMessageBox } = useContextState();
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        closeMessageBox();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeMessageBox]);

  if (!messageBox.show) return null;

  const iconMap = {
    success: <FaCheckCircle className="text-green-500 text-2xl" />,
    error: <FaExclamationCircle className="text-red-500 text-2xl" />,
    info: <FaInfoCircle className="text-blue-500 text-2xl" />,
  };

  const colorMap = {
    success: 'border-green-500',
    error: 'border-red-500',
    info: 'border-blue-500',
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center bg-black/80 pt-20">
      <div
        ref={modalRef}
        className={`bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm border-t-4 ${colorMap[messageBox.type]} relative`}
      >
        <div className="flex items-center gap-3">
          {iconMap[messageBox.type]}
          <p className="text-gray-800 text-base">{messageBox.message}</p>
        </div>
        <button
          onClick={closeMessageBox}
          className="absolute top-2 right-2 text-gray-400 cursor-pointer hover:text-black transition"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
}
