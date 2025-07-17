// components/ConfirmDialog.tsx

import React from 'react';

type ConfirmDialogProps = {
  isOpen: boolean;
  title?: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
};

const ConfirmDialog  = ({
  isOpen,
  title = 'Confirm Action',
  message,
  onConfirm,
  onCancel,
}:ConfirmDialogProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-start justify-center pt-10 bg-black/90">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-6 space-y-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <p>{message}</p>
        <div className="flex justify-end space-x-4 mt-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded bg-gray-200 cursor-pointer  hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded bg-red-600 text-white cursor-pointer  hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
