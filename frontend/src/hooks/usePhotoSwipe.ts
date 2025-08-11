import { useEffect, useRef } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

interface UsePhotoSwipeProps {
  images: Array<{ url: string; alt?: string }>;
  isOpen: boolean;
  initialIndex?: number;
  onClose?: () => void;
}

export const usePhotoSwipe = ({ images, isOpen, initialIndex = 0, onClose }: UsePhotoSwipeProps) => {
  const pswpRef = useRef<PhotoSwipe | null>(null);

  useEffect(() => {
    if (!isOpen || !images.length) return;

    const options = {
      dataSource: images.map((image, index) => ({
        src: image.url,
        width: 1200,
        height: 1200,
        alt: image.alt || `Image ${index + 1}`
      })),
      index: initialIndex,
      showHideAnimationType: 'fade' as const,
      showAnimationDuration: 300,
      hideAnimationDuration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
      allowPanToNext: true,
      allowMouseDrag: true,
      allowTouchDrag: true,
      allowVerticalDrag: true,
      allowHorizontalDrag: true,
      zoomAnimationDuration: 300,
      maxZoomLevel: 4,
      minZoomLevel: 1,
      secondaryZoomLevel: 2,
      maxSpreadZoom: 2,
      getDoubleTapZoom: (isMouseClick: boolean, item: any) => {
        return item.initialZoomLevel * 2;
      },
      paddingFn: () => {
        return { top: 30, bottom: 30, left: 70, right: 70 };
      }
    };

    pswpRef.current = new PhotoSwipe(options);
    
    pswpRef.current.on('close', () => {
      onClose?.();
    });

    pswpRef.current.init();

    return () => {
      if (pswpRef.current) {
        pswpRef.current.destroy();
        pswpRef.current = null;
      }
    };
  }, [images, isOpen, initialIndex, onClose]);

  const openPhotoSwipe = (index: number = 0) => {
    if (!images.length) return;

    const options = {
      dataSource: images.map((image, idx) => ({
        src: image.url,
        width: 1200,
        height: 1200,
        alt: image.alt || `Image ${idx + 1}`
      })),
      index,
      showHideAnimationType: 'fade' as const,
      showAnimationDuration: 300,
      hideAnimationDuration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.22, 1)',
      allowPanToNext: true,
      allowMouseDrag: true,
      allowTouchDrag: true,
      allowVerticalDrag: true,
      allowHorizontalDrag: true,
      zoomAnimationDuration: 300,
      maxZoomLevel: 4,
      minZoomLevel: 1,
      secondaryZoomLevel: 2,
      maxSpreadZoom: 2,
      getDoubleTapZoom: (isMouseClick: boolean, item: any) => {
        return item.initialZoomLevel * 2;
      },
      paddingFn: () => {
        return { top: 30, bottom: 30, left: 70, right: 70 };
      }
    };

    pswpRef.current = new PhotoSwipe(options);
    pswpRef.current.on('close', () => {
      onClose?.();
    });
    pswpRef.current.init();
  };

  return { openPhotoSwipe };
};
