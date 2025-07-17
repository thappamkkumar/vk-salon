import { Style } from '@/types/styles';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';

export default function StyleThumbnail({
  style,
  onClick,
}: {
  style: Style;
  onClick: () => void;
}) {
  const [aspectRatio, setAspectRatio] = useState(3 / 4); // default aspect ratio
  const [imageError, setImageError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setImageError(false); // reset if new style comes in
  }, [style.image]);

  useEffect(() => {
    if (imgRef.current && !imageError) {
      const { naturalWidth, naturalHeight } = imgRef.current;
      if (naturalWidth && naturalHeight) {
        setAspectRatio(naturalHeight / naturalWidth);
      }
    }
  }, [style.image, imageError]);

  return (
    <div
      className="cursor-pointer shadow-[8px_5px_15px_-3px_rgba(0,0,0,0.5)] rounded transform transition-transform duration-300 hover:scale-102"
      onClick={onClick}
    >
      <div
        className="relative w-full max-h-[70vh] flex items-center justify-center bg-gray-100 rounded"
        style={{ aspectRatio: `${1 / aspectRatio}` }}
      >
        {!imageError ? (
          <>
            <Image
              src={style.image}
              alt="Style thumbnail"
              fill
              className="object-cover rounded"
              sizes="(max-width: 768px) 100vw, 25vw"
              priority={true}
            />
            <img
              ref={imgRef}
              src={style.image}
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
              onError={() => setImageError(true)}
            />
          </>
        ) : (
          <span className="text-gray-600 text-sm font-medium">Image not available</span>
        )}
      </div>
    </div>
  );
}
