'use client';

import { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useContextState } from '@/context/contextState';
import { resizeImage } from '@/lib/resize/resizeImage';

type MediaItem = {
  file: File;
};

export default function AdminNewStyleForm() {
  const { setUploading, setMessageBox } = useContextState();

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

    if (!mediaFile) {
      setMessageBox({
        message: 'Please select an image before submitting.',
        type: 'error',
      });
      return;
    }

    const ext = mediaFile.file.name.split('.').pop()?.toLowerCase();
    if (!allowedTypes.includes(ext || '')) {
      setMessageBox({
        message: 'Invalid file type.',
        type: 'error',
      });
      return;
    }

    try {
      setUploading(true);
			
			const resizedFile = await resizeImage( mediaFile.file, 800, 0.9); // resize before submission
			
      const formData = new FormData();
      formData.append('file', resizedFile);

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/styles`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
			//console.log(data);
      if (data.status) {
        setMediaFile(null);
        setMessageBox({
          message: 'Style upload successful!',
          type: 'success',
        });
      } else {
        setMessageBox({
          message: 'Failed to upload style.',
          type: 'error',
        });
      }
    } catch(error) {
			//console.log(error);
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
      <h1 className="text-xl font-semibold mb-4 text-center">Create New Style</h1>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept=".jpg,.jpeg,.png"
        onChange={handleFileChange}
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
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
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

          <button
            type="submit"
            className="block w-full bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900"
          >
            Submit Style
          </button>
        </form>
      )}

      {/* Fullscreen Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-120"
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
