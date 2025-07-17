'use client';

import { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useContextState } from '@/context/contextState';
import { resizeImage } from '@/lib/resize/resizeImage';
import StarRating from './StarRating';

type MediaItem = {
  file: File;
};

export default function NewReviewForm() {
  const { setUploading, setMessageBox } = useContextState();

  const [clientName, setClientName] = useState('');
  const [address, setAddress] = useState('');
  const [rating, setRating] = useState('');
  const [message, setMessage] = useState('');
  const [mediaFile, setMediaFile] = useState<MediaItem | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);

  const allowedTypes = ['jpg', 'jpeg', 'png'];

  const validateFile = (file: File): boolean => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    return !!ext && allowedTypes.includes(ext);
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) {
      setMessageBox({
        message: 'Invalid file type. Only JPG, JPEG, and PNG are allowed.',
        type: 'error',
      });
      return;
    }
    setMediaFile({ file });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientName || !address || !rating || !message) {
      setMessageBox({
        message: 'All fields are required.',
        type: 'error',
      });
      return;
    }

    const numericRating = Number(rating);
    if (isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
      setMessageBox({
        message: 'Rating must be a number between 1 and 5.',
        type: 'error',
      });
      return;
    }

    if (!mediaFile) {
      setMessageBox({
        message: 'Please select an image before submitting.',
        type: 'error',
      });
      return;
    }

    try {
      setUploading(true);

      const resizedFile = await resizeImage(mediaFile.file, 800, 0.9);

      const formData = new FormData();
      formData.append('file', resizedFile);
      formData.append('name', clientName);
      formData.append('address', address);
      formData.append('rating', rating);
      formData.append('message', message);

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/reviews`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.status) {
        setClientName('');
        setAddress('');
        setRating('');
        setMessage('');
        setMediaFile(null);
        setMessageBox({
          message: 'Review submitted successfully!',
          type: 'success',
        });
      } else {
        setMessageBox({
          message: 'Failed to submit review.',
          type: 'error',
        });
      }
    } catch (error) {
      setMessageBox({
        message: 'Something went wrong.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white shadow-md rounded-lg border border-gray-100">
      <h1 className="text-xl font-semibold mb-4 text-center">Submit a Review</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
			
				<div className="p-2 border border-gray-300 rounded">
          <label className="block text-md font-medium text-gray-700 mb-1">Rating</label>
          <StarRating
            rating={Number(rating)}
            onRate={(value) => setRating(String(value))}
          />
        </div>
				<input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
        />

				
        <input
          type="text"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          placeholder="Your Name"
          className="w-full p-2 border border-gray-300 rounded"
        />

        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Your Address"
          className="w-full p-2 border border-gray-300 rounded"
        />

        

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Review Message"
          className="w-full p-2 border border-gray-300 rounded h-32 resize-none"
        />

        
        <div
          onDrop={handleDrop}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          className={`cursor-pointer text-center py-10 px-4 border-2 border-dashed rounded transition ${
            dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
        >
          <p className="text-gray-600 mb-2">Drag & drop an image here</p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900"
          >
            Select Image
          </button>
          <p className="text-sm text-gray-400 mt-2">(Only jpg, jpeg, png)</p>
        </div>

        {mediaFile && (
          <div className="space-y-4">
            <div className="relative border rounded overflow-hidden shadow-sm group cursor-pointer w-48">
              <img
                src={URL.createObjectURL(mediaFile.file)}
                alt="preview"
                className="object-cover w-full h-40"
                onClick={() =>
                  setPreviewFile({
                    url: URL.createObjectURL(mediaFile.file),
                    type: mediaFile.file.name.split('.').pop() || '',
                  })
                }
              />
              <button
                type="button"
                onClick={() => setMediaFile(null)}
                className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded hover:bg-red-700"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="block w-full bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900"
        >
          Submit Review
        </button>
      </form>

      {previewFile && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setPreviewFile(null)}
        >
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-2 right-2 text-2xl text-white px-3 py-1 rounded hover:text-white/80"
            aria-label="Close preview"
          >
            <FaTimes />
          </button>
          <div
            className="relative max-w-3xl max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewFile.url} alt="Preview" className="max-h-[80vh] mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
