import React, { useState } from 'react';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ImageWithPlaceholderProps {
  src: string;
  alt: string;
  className?: string;
  placeholderClassName?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const ImageWithPlaceholder: React.FC<ImageWithPlaceholderProps> = ({
  src,
  alt,
  className,
  placeholderClassName,
  onLoad,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
    setHasError(false);
    onLoad?.();
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
    onError?.();
  };

  if (hasError) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
        "animate-pulse",
        className
      )}>
        <div className="flex flex-col items-center gap-2 text-gray-400">
          <div className="relative">
            <ImageIcon className="h-8 w-8" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-400 rounded-full animate-ping"></div>
          </div>
          <span className="text-xs font-medium">Image not available</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className={cn(
          "absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700",
          "animate-pulse",
          placeholderClassName
        )}>
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              <div className="absolute inset-0 rounded-full border-2 border-gray-300 border-t-gray-400 animate-spin"></div>
            </div>
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-xs text-gray-400 font-medium">Loading image...</span>
          </div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "transition-all duration-500 ease-in-out",
          isLoading ? "opacity-0 scale-95" : "opacity-100 scale-100",
          className
        )}
        onLoad={handleLoad}
        onError={handleError}
      />
    </div>
  );
};

export { ImageWithPlaceholder };
