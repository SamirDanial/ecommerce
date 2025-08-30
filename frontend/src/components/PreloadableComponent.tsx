import React, { lazy, Suspense, ComponentType } from "react";

interface PreloadableComponentProps {
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

// Create a preloadable lazy component
export const createPreloadableComponent = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) => {
  const LazyComponent = lazy(importFunc);

  // Add preload method to the component
  (LazyComponent as any).preload = importFunc;

  return LazyComponent;
};

// Preloadable component wrapper
export const PreloadableComponent: React.FC<PreloadableComponentProps> = ({
  fallback,
  children,
}) => {
  return <Suspense fallback={fallback}>{children}</Suspense>;
};

// Preloadable link component for navigation
interface PreloadableLinkProps {
  to: string;
  children: React.ReactNode;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  className?: string;
  onClick?: () => void;
}

export const PreloadableLink: React.FC<PreloadableLinkProps> = ({
  to,
  children,
  onMouseEnter,
  onMouseLeave,
  className,
  onClick,
}) => {
  return (
    <a
      href={to}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={className}
      onClick={onClick}
    >
      {children}
    </a>
  );
};
