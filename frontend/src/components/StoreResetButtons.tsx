import React from 'react';
import { resetAllStores, resetDataStores } from '../utils/storeReset';

interface StoreResetButtonsProps {
  showInProduction?: boolean; // Set to false to hide in production
}

export const StoreResetButtons: React.FC<StoreResetButtonsProps> = ({ 
  showInProduction = false 
}) => {
  // Hide in production unless explicitly enabled
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  const handleResetAll = () => {
    if (window.confirm('Are you sure you want to reset ALL stores? This will clear cart, wishlist, and user data.')) {
      resetAllStores();
      // Optionally refresh the page to see the reset effect
      // window.location.reload();
    }
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset data stores? This will clear cart, wishlist, and user interactions.')) {
      resetDataStores();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      <h3 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
        🧹 Store Reset (Dev)
      </h3>
      <div className="space-y-2">
        <button
          onClick={handleResetData}
          className="w-full px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Reset Data Stores
        </button>
        <button
          onClick={handleResetAll}
          className="w-full px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Reset All Stores
        </button>
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Only visible in development
      </p>
    </div>
  );
};
