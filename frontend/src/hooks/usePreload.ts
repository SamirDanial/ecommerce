import { useCallback } from "react";

interface PreloadableComponent {
  preload: () => Promise<any>;
}

export const usePreload = () => {
  const preloadComponent = useCallback((component: PreloadableComponent) => {
    // Start preloading the component
    component.preload();
  }, []);

  const preloadOnHover = useCallback((component: PreloadableComponent) => {
    // Preload component when user hovers over a link
    const timeoutId = setTimeout(() => {
      component.preload();
    }, 100); // Small delay to avoid unnecessary preloading

    return () => clearTimeout(timeoutId);
  }, []);

  return {
    preloadComponent,
    preloadOnHover,
  };
};
