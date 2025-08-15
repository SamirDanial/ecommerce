import React from 'react';
import { Star } from 'lucide-react';

interface RatingDisplayProps {
  rating: number | null | undefined;
  reviewCount: number | null | undefined;
  showCount?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const RatingDisplay: React.FC<RatingDisplayProps> = ({
  rating,
  reviewCount,
  showCount = true,
  size = 'md',
  className = ''
}) => {
  const hasReviews = reviewCount && reviewCount > 0;
  const averageRating = rating || 0;
  
  // Size mappings
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5'
  };
  
  const starSize = sizeClasses[size];

  if (!hasReviews) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`${starSize} text-gray-200`}
            />
          ))}
        </div>
        {showCount && (
          <span className="text-sm text-muted-foreground">
            No reviews yet
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${starSize} ${
              i < Math.floor(averageRating)
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          ({reviewCount})
        </span>
      )}
    </div>
  );
};

export default RatingDisplay;
