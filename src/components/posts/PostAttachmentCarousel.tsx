'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Post } from '@/types/posts';

export default function PostAttachmentCarousel({
  postList,
  postIndex,
  setSelectedPostIndex,
  postAttachmentIndex,
  setSelectedPostAttachmentIndex,
}: {
  postList: Post[];
  postIndex: number; 
  setSelectedPostIndex: (index: number | null) => void;
	postAttachmentIndex?: number;
  setSelectedPostAttachmentIndex?: (index: number | null) => void;
}) {
  const [currentAttIndex, setCurrentAttIndex] = useState(postAttachmentIndex || 0);
  const [animating, setAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null);

  const [attachmentAnimating, setAttachmentAnimating] = useState(false);
  const [attachmentDirection, setAttachmentDirection] = useState<'left' | 'right' | null>(null);

  const scrollThrottle = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const mediaRef = useRef<HTMLImageElement | HTMLVideoElement>(null);

  const post = postList[postIndex];
  const attachments = post.attachment;
  const currentItem = attachments[currentAttIndex];



	

  const prevAttachment = () => {
    if (attachmentAnimating) return;
    setAttachmentDirection('left');
    setAttachmentAnimating(true);
    setTimeout(() => {
      setCurrentAttIndex((prev) => (prev - 1 + attachments.length) % attachments.length);
      setAttachmentAnimating(false);
      setAttachmentDirection(null);
    }, 300);
  };

  const nextAttachment = () => {
    if (attachmentAnimating) return;
    setAttachmentDirection('right');
    setAttachmentAnimating(true);
    setTimeout(() => {
      setCurrentAttIndex((prev) => (prev + 1) % attachments.length);
      setAttachmentAnimating(false);
      setAttachmentDirection(null);
    }, 300);
  };

  const onClose = () =>{ 
	if(setSelectedPostAttachmentIndex)
	{
		setSelectedPostAttachmentIndex(null); 
	}
	setSelectedPostIndex(null); 
	
	}

  const triggerPostChange = (direction: 'up' | 'down') => {
    if (animating) return;

    const newIndex = direction === 'up' ? postIndex + 1 : postIndex - 1;
    if (newIndex < 0 || newIndex >= postList.length) {
      onClose();
      return;
    }

    setAnimating(true);
    setAnimationDirection(direction);

    setTimeout(() => {
      setSelectedPostIndex(newIndex);
      setCurrentAttIndex(0);
      setAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (attachments.length === 1) {
        if (Math.abs(diffX) > 80) {
          onClose(); // close if swiping left/right with only 1 attachment
        }
      } else {
        if (diffX > 80) prevAttachment();
        else if (diffX < -80) nextAttachment();
      }
    } else {
      if (diffY > 80) triggerPostChange('down');
      else if (diffY < -80) triggerPostChange('up');
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (scrollThrottle.current || animating) return;

    if (e.deltaY > 80) triggerPostChange('up');
    else if (e.deltaY < -80) triggerPostChange('down');

    scrollThrottle.current = setTimeout(() => {
      scrollThrottle.current = null;
    }, 500);
  };

  const postSlideOutClass =
    animationDirection === 'up'
      ? 'animate-slide-out-up'
      : animationDirection === 'down'
      ? 'animate-slide-out-down'
      : '';

  const postSlideInClass =
    animationDirection === 'up'
      ? 'animate-slide-in-up'
      : animationDirection === 'down'
      ? 'animate-slide-in-down'
      : '';

  const attSlideOutClass =
    attachmentDirection === 'left'
      ? 'animate-attachment-slide-out-left'
      : attachmentDirection === 'right'
      ? 'animate-attachment-slide-out-right'
      : '';

  const attSlideInClass =
    attachmentDirection === 'left'
      ? 'animate-attachment-slide-in-left'
      : attachmentDirection === 'right'
      ? 'animate-attachment-slide-in-right'
      : '';

  useEffect(() => {
    const preventDefault = (e: TouchEvent | WheelEvent) => {
      e.preventDefault();
    };

    // Add non-passive listeners to allow preventDefault to work
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-110 bg-black/90 flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
        aria-label="Close"
      >
        <FaTimes />
      </button>

      {/* Prev Attachment */}
      {attachments.length > 1 && currentAttIndex > 0 && (
        <button
          onClick={prevAttachment}
          className="absolute left-2 top-1/2 -translate-y-1/2 text-white/90 text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
          aria-label="Previous"
        >
          <FaChevronLeft />
        </button>
      )}

      {/* Media Viewer with animation */}
      <div
        className={`relative w-full md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[95vh] flex items-center justify-center transition-all duration-300 ease-in-out ${
          animating ? postSlideOutClass : postSlideInClass
        }`}
      >
        <div
          className={`w-full h-full relative flex items-center justify-center transition-all duration-300 ease-in-out ${
            attachmentAnimating ? attSlideOutClass : attSlideInClass
          }`}
        >
          {currentItem.type === 'image' ? (
            <Image
              ref={mediaRef as React.RefObject<HTMLImageElement>}
              src={currentItem.fileName}  // <--- changed here
              alt={`Attachment ${currentAttIndex + 1}`}
              fill
              className="object-contain"
              priority
            />
          ) : (
            <video
              ref={mediaRef as React.RefObject<HTMLVideoElement>}
              src={currentItem.fileName}  // <--- changed here
              controls
              className="max-w-full max-h-full object-contain"
							autoPlay
              preload="metadata"
              controlsList="nodownload"
              poster={currentItem.thumbnail ?? undefined}  // <--- optional poster for videos
            />
          )}
        </div>
      </div>

      {/* Next Attachment */}
      {attachments.length > 1 && currentAttIndex < attachments.length - 1 && (
        <button
          onClick={nextAttachment}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-white/90 text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
          aria-label="Next"
        >
          <FaChevronRight />
        </button>
      )}
    </div>
  );
}
