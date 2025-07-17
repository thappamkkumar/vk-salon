'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { Post } from '@/types/posts';
import { FaPlay, FaLayerGroup } from 'react-icons/fa';

export default function PostThumbnail({
  post,
  onClick,
}: {
  post: Post;
  onClick: () => void;
}) {
  const [aspectRatio, setAspectRatio] = useState(9 / 16);
  const imgRef = useRef<HTMLImageElement>(null);

  const firstAttachment = post.attachment[0];
  const isVideo = firstAttachment?.type === 'video';
  const displaySrc = isVideo ? firstAttachment.thumbnail : firstAttachment.fileName;

  useEffect(() => {
    if (imgRef.current) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalHeight / naturalWidth);
      }
    }
  }, [displaySrc]);

  return (
    <div
      className="relative cursor-pointer      overflow-hidden shadow-[8px_5px_15px_-3px_rgba(0,0,0,0.5)] rounded  transform transition-transform duration-300 hover:scale-102" 
      onClick={onClick}
    >
      <div
        className="relative w-full max-h-[70vh]"
        style={{ aspectRatio: `${1 / aspectRatio}` }}
      >
        <Image
          src={displaySrc}
          alt={`Thumbnail for post ${post.id}`}
          fill
          className="object-cover rounded hover:opacity-50"
          sizes="(max-width: 768px) 100vw, 25vw"
          priority={false}
        />

        {/* Hidden image to calculate aspect ratio */}
        <img
          ref={imgRef}
          src={displaySrc}
          alt=""
          style={{ display: 'none' }}
          onLoad={() => {
            if (imgRef.current) {
              const { naturalWidth, naturalHeight } = imgRef.current;
              if (naturalWidth && naturalHeight) {
                setAspectRatio(naturalHeight / naturalWidth);
              }
            }
          }}
        />

        {/* Play icon for video */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center">
            <FaPlay className="text-white text-4xl drop-shadow-md" />
          </div>
        )}

        {/* Stack icon if multiple attachments */}
        {post.attachment.length > 1 && (
          <div className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1">
            <FaLayerGroup className="text-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
