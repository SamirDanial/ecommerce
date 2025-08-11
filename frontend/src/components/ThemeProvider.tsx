import React, { useEffect } from 'react';
import { useThemeStore } from '../stores/themeStore';

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { initializeTheme } = useThemeStore();

  useEffect(() => {
    // Initialize theme on app mount
    const cleanup = initializeTheme();
    
    // Cleanup function
    return cleanup;
  }, [initializeTheme]);

  return <>{children}</>;
};

export default ThemeProvider;
