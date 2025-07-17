'use client';

import { useRef, useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import { useContextState } from '@/context/contextState';

type MediaItem = {
  file: File;
  thumbnail?: File; // Only for videos
};

export default function AdminNewPostForm() {

	const { setUploading, setMessageBox  } = useContextState();

  const [mediaFiles, setMediaFiles] = useState<MediaItem[]>([]); 
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewFile, setPreviewFile] = useState<{ url: string; type: string } | null>(null);
 
	const allowedTypes = ['jpg', 'jpeg', 'png', 'mp4'];
	
	
  const createVideoThumbnail = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(file);
      video.crossOrigin = 'anonymous';
      video.preload = 'metadata';
      video.muted = true;

      video.addEventListener('loadeddata', () => {
        video.currentTime = 1;
      });

      video.addEventListener('seeked', () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              const thumbFile = new File([blob], `${file.name}_thumb.jpg`, { type: 'image/jpg' });
              resolve(thumbFile);
            } else {
              reject('Failed to generate thumbnail');
            }
          }, 'image/jpeg');
        }
      });

      video.onerror = reject;
    });
  };

  const processFiles = async (inputFiles: File[]) => {
    const newItems: MediaItem[] = [];

    for (const file of inputFiles) {
      const ext = file.name.split('.').pop()?.toLowerCase();
			
			if (!allowedTypes.includes(ext || '')) {
				 
				setMessageBox({
					message: 'One or more files are invalid.',
					type: 'error',
				});
				continue;
			}
		
      if (['mp4'].includes(ext || '')) {
        try {
          const thumbnail = await createVideoThumbnail(file);
          newItems.push({ file, thumbnail });
        } catch {
          newItems.push({ file });
        }
      } else {
        newItems.push({ file });
      }
    }

    setMediaFiles((prev) => [...prev, ...newItems]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
		
		// Extra validation before upload
		const hasInvalid = mediaFiles.some(({ file }) => {
			const ext = file.name.split('.').pop()?.toLowerCase();
			return !allowedTypes.includes(ext || '');
		});

		if (hasInvalid) { 
			setMessageBox({
					message: 'One or more files are invalid.',
					type: 'error',
				});
			return;
		}
	
	
		try
		{
			setUploading(true);
			const formData = new FormData();

			mediaFiles.forEach(({ file, thumbnail }, index) => {
				const ext = file.name.split('.').pop()?.toLowerCase();
				formData.append(`file_${index}`, file);
				if (ext === 'mp4' && thumbnail) {
					formData.append(`thumbnail_${index}`, thumbnail);
				}
			});
		
		  

		
			const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/posts`, {
				method: 'POST',
				body: formData,
			});

			const data = await res.json();
		 console.log(data);
			if(data.status)
			{
				setMediaFiles([]); 
				setMessageBox({
					message: 'Post is upload successful!',
					type: 'success',
				});
			}
			else
			{ 
				setMessageBox({
					message: 'Failed to upload post.',
					type: 'error',
				});
			}
		}
		catch(error)
		{ 
			setMessageBox({
					message: 'Something went wrong.',
					type: 'error',
				});
		}
		finally
		{
			setUploading(false);
		}
			
  };
	
	
	 

  return (
    <div className="max-w-3xl mx-auto mt-10 p-4 bg-white shadow-md rounded-lg border-1 border-gray-100">
      <h1 className="text-xl font-semibold mb-4 text-center">Create New Post</h1>

      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        accept=".jpg,.jpeg,.png,.mp4"
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
        <p className="text-gray-600 mb-2">Drag & drop images or videos here</p>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900"
        >
          Select Files
        </button>
        <p className="text-sm text-gray-400 mt-2">(jpg, jpeg, png, mp4)</p>
      </div>

      {mediaFiles.length > 0 && (
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {mediaFiles.map((item, index) => {
              const ext = item.file.name.split('.').pop()?.toLowerCase();
              const imageUrl = ['jpg', 'jpeg', 'png'].includes(ext || '')
                ? URL.createObjectURL(item.file)
                : item.thumbnail
                ? URL.createObjectURL(item.thumbnail)
                : '';

              return (
                <div
                  key={index}
                  className="relative border rounded overflow-hidden shadow-sm group cursor-pointer"
                  onClick={() =>
                    setPreviewFile({
                      url: URL.createObjectURL(item.file),
                      type: ext || '',
                    })
                  }
                >
                  {imageUrl ? (
                    <img src={imageUrl} alt="preview" className="object-cover w-full h-40" />
                  ) : (
                    <p className="p-2 text-sm text-red-500">Unsupported</p>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="absolute top-1 right-1 bg-red-600 text-white text-xs px-2 py-1 rounded   cursor-pointer  hover:bg-red-700"
                  >
                    <FaTimes />
                  </button>
                </div>
              );
            })}
          </div>

          <button
            type="submit"
            className="block w-full bg-black text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-900"
          >
            Submit Post
          </button>
        </form>
      )}

      

      {/* Fullscreen Preview Modal */}
      {previewFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-101"
          onClick={() => setPreviewFile(null)}
        >
          <button
            onClick={() => setPreviewFile(null)}
            className="absolute top-2 right-2 text-2xl text-white px-3 py-1 rounded  cursor-pointer hover:text-white/80 transition-color duration-300"
            aria-label="Close preview"
          >
            <FaTimes />
          </button>

          <div
            className="relative max-w-3xl max-h-[90vh] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {['jpg', 'jpeg', 'png'].includes(previewFile.type) ? (
              <img src={previewFile.url} alt="Preview" className="max-h-[80vh] mx-auto" />
            ) : previewFile.type === 'mp4' ? (
              <video controls autoPlay className="max-h-[80vh] mx-auto">
                <source src={previewFile.url} type="video/mp4" />
              </video>
            ) : null}
          </div>
        </div>
      )}
			
		 
			
    </div>
  );
}
