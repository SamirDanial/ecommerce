import React from 'react';
import { Heart } from 'lucide-react';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { cn } from '../lib/utils';

interface WishlistButtonProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: number;
    comparePrice?: number;
    images?: { url: string; alt?: string }[];
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  showText?: boolean;
}

export const WishlistButton: React.FC<WishlistButtonProps> = ({
  product,
  size = 'md',
  className,
  showText = false
}) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useUserInteractionStore();
  const isWishlisted = isInWishlist(product.id);

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <button
      onClick={handleToggleWishlist}
      className={cn(
        showText ? 'flex items-center gap-2' : 'flex items-center justify-center',
        'rounded-full transition-all duration-200 hover:scale-110',
        'bg-background/80 backdrop-blur-sm border border-border/50',
        'hover:bg-background hover:border-border',
        sizeClasses[size],
        className
      )}
      aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
    >
      <Heart
        className={cn(
          iconSizes[size],
          'transition-all duration-200',
          isWishlisted
            ? 'fill-red-500 text-red-500 animate-pulse'
            : 'text-muted-foreground hover:text-red-500'
        )}
      />
      {showText && (
        <span className="text-sm font-medium">
          {isWishlisted ? 'Saved' : 'Save'}
        </span>
      )}
    </button>
  );
};
