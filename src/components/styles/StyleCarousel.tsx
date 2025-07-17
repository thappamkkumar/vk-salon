'use client';
import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { FaTimes } from 'react-icons/fa';
import { Style } from '@/types/styles';

export default function StyleCarousel({
  styleList,
  styleIndex,
  setSelectedStyleIndex,
}: {
  styleList: Style[];
  styleIndex: number;
  setSelectedStyleIndex: (index: number | null) => void;
}) {
  const [animating, setAnimating] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<'up' | 'down' | null>(null);

  const scrollThrottle = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const style = styleList[styleIndex];
  const currentItem = style.image;

  const onClose = () => setSelectedStyleIndex(null);

  const triggerPostChange = (direction: 'up' | 'down') => {
    if (animating) return;

    const newIndex = direction === 'up' ? styleIndex + 1 : styleIndex - 1;
    if (newIndex < 0 || newIndex >= styleList.length) {
      onClose();
      return;
    }

    setAnimating(true);
    setAnimationDirection(direction);

    setTimeout(() => {
      setSelectedStyleIndex(newIndex);
      setAnimating(false);
      setAnimationDirection(null);
    }, 300);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const diffX = e.changedTouches[0].clientX - touchStartX.current;
    const diffY = e.changedTouches[0].clientY - touchStartY.current;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      if (Math.abs(diffX) > 80) onClose(); // Horizontal swipe to close
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

  const styleSlideOutClass =
    animationDirection === 'up'
      ? 'animate-slide-out-up'
      : animationDirection === 'down'
      ? 'animate-slide-out-down'
      : '';

  const styleSlideInClass =
    animationDirection === 'up'
      ? 'animate-slide-in-up'
      : animationDirection === 'down'
      ? 'animate-slide-in-down'
      : '';

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const preventDefault = (e: TouchEvent | WheelEvent) => e.preventDefault();
    window.addEventListener('wheel', preventDefault, { passive: false });
    window.addEventListener('touchmove', preventDefault, { passive: false });
    return () => {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
    };
  }, []);

  useEffect(() => {
    const state = { modalOpen: true };
    const currentState = window.history.state;
    if (!currentState || !currentState.modalOpen) {
      window.history.pushState(state, '');
    }

    const handlePopState = () => setSelectedStyleIndex(null);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  if (!currentItem) return null;

  return (
    <div
      className="fixed inset-0 z-110 bg-black/90 flex items-center justify-center overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onWheel={handleWheel}
    >
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-white text-xl lg:text-3xl p-2 bg-black/90 rounded-full z-111 shadow-[0px_0px_10px_1px_rgba(255,255,255,0.4)] hover:shadow-white/30 hover:text-white/60 cursor-pointer transition duration-300"
        aria-label="Close"
      >
        <FaTimes />
      </button>

      <div
        className={`relative w-full md:max-w-[80vw] lg:max-w-[70vw] xl:max-w-[60vw] h-[95vh] flex items-center justify-center transition-all duration-300 ease-in-out ${animating ? styleSlideOutClass : styleSlideInClass}`}
      >
        <div className="w-full h-full relative flex items-center justify-center">
          <Image
            src={currentItem}
            alt="Style"
            fill
            className="object-contain w-full h-full"
          />
        </div>
      </div>
    </div>
  );
}
