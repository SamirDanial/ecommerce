import React from 'react';
import { Plus, Grid3X3 } from 'lucide-react';
import { Button } from '../ui/button';

interface CategoryHeaderProps {
  onAddCategory: () => void;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ onAddCategory }) => {
  return (
    <>
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
          <div className="flex items-center justify-between">
            <div className="space-y-3">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                    <Grid3X3 className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Category Management
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base font-medium">
                    Organize and manage your product categories with style
                  </p>
                </div>
              </div>
            </div>
            
            {/* Desktop Button */}
            <Button 
              onClick={onAddCategory} 
              className="hidden sm:flex bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Add Category
            </Button>
          </div>
        </div>
      </div>
      
      {/* Mobile Floating Action Button */}
      <div 
        onClick={onAddCategory} 
        className="sm:hidden fixed bottom-6 right-4 z-50 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_32px_rgba(147,51,234,0.4),0_16px_48px_rgba(147,51,234,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2),0_16px_48px_rgba(147,51,234,0.5),0_24px_64px_rgba(147,51,234,0.3)] transition-all duration-300 border-0 cursor-pointer flex items-center justify-center"
      >
        <Plus className="w-6 h-6" />
      </div>
    </>
  );
};

export default CategoryHeader;
