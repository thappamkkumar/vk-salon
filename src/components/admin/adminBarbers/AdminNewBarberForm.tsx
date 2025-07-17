'use client';

import { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useContextState } from '@/context/contextState';
import { resizeImage } from '@/lib/resize/resizeImage';

type MediaItem = {
  file: File;
};

export default function AdminNewBarberForm() {
  const { setUploading, setMessageBox } = useContextState();

  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [experience, setExperience] = useState('');
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

    if (!name || !contact || !experience) {
      setMessageBox({
        message: 'Please fill out all fields.',
        type: 'error',
      });
      return;
    }

    if (contact.length < 10 || contact.length > 15) {
      setMessageBox({
        message: 'Contact number must be between 10 and 15 digits.',
        type: 'error',
      });
      return;
    }

    const experienceNum = parseInt(experience);
    if (isNaN(experienceNum) || experienceNum <= 0) {
      setMessageBox({
        message: 'Experience must be a valid positive number.',
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
      formData.append('name', name);
      formData.append('contact', contact);
      formData.append('experience', experience);

      const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/barbers`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      //console.log(data);

      if (data.status) {
        setMediaFile(null);
        setName('');
        setContact('');
        setExperience('');
        setMessageBox({
          message: 'Barber added successfully!',
          type: 'success',
        });
      } else {
        setMessageBox({
          message: 'Failed to add barber.',
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
      <h1 className="text-xl font-semibold mb-4 text-center">Add New Barber</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter barber's name"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          placeholder="Enter contact number"
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="number"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Enter experience (e.g. 5)"
          className="w-full p-2 border border-gray-300 rounded"
        />

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
          Submit Barber
        </button>
      </form>

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
            className="relative max-w-3xl max-h-[95vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewFile.url} alt="Preview" className="max-h-[90vh] mx-auto" />
          </div>
        </div>
      )}
    </div>
  );
}
