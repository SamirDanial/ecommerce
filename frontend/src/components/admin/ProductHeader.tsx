import React from 'react';
import { Plus, Package, RefreshCw, Loader2, Download, Upload } from 'lucide-react';
import { Button } from '../ui/button';

interface ProductHeaderProps {
  onAddProduct: () => void;
  onRefresh: () => void;
  onExportProducts: () => void;
  onImportProducts: () => void;
  loading: boolean;
}

const ProductHeader: React.FC<ProductHeaderProps> = ({ 
  onAddProduct, 
  onRefresh, 
  onExportProducts,
  onImportProducts,
  loading 
}) => {
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
                    <Package className="w-7 h-7 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Product Management
                  </h1>
                  <p className="text-slate-600 text-sm sm:text-base font-medium">
                    Manage your product catalog, inventory, and variants with style
                  </p>
                </div>
              </div>
            </div>
            
            {/* Desktop Controls */}
            <div className="hidden sm:flex items-center gap-3">
              {/* Export Button */}
              <Button 
                onClick={onExportProducts} 
                variant="outline"
                className="border-purple-200 text-purple-600 hover:bg-purple-50 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              {/* Import Button */}
              <Button 
                onClick={onImportProducts} 
                variant="outline"
                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              
              {/* Refresh Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={loading}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Refresh
              </Button>
              
              {/* Create Product Button */}
              <Button 
                onClick={onAddProduct} 
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-4 sm:px-6 py-2 sm:py-3 text-base sm:text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                disabled={loading}
              >
                <Plus className="w-4 h-4 sm:w-5 sm:w-5 mr-2" />
                Create Product
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Mobile Action Buttons */}
      <div className="sm:hidden mt-4">
        <div className="flex flex-col gap-3">
          {/* Import/Export Row */}
          <div className="flex gap-3">
            <Button 
              onClick={onExportProducts} 
              variant="outline"
              className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50 h-12 text-sm font-medium rounded-xl transition-all duration-300"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button 
              onClick={onImportProducts} 
              variant="outline"
              className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50 h-12 text-sm font-medium rounded-xl transition-all duration-300"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import
            </Button>
          </div>
          
          {/* Create Product Button */}
          <Button 
            onClick={onAddProduct} 
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white h-12 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            disabled={loading}
          >
            <Plus className="w-5 h-5 mr-2" />
            Create Product
          </Button>
        </div>
      </div>
      
      {/* Mobile Floating Action Buttons */}
      {/* Refresh Button - Left */}
      <div 
        onClick={loading ? undefined : onRefresh} 
        className={`sm:hidden fixed bottom-6 right-20 z-50 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_32px_rgba(34,197,94,0.4),0_16px_48px_rgba(34,197,94,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2),0_16px_48px_rgba(34,197,94,0.5),0_24px_64px_rgba(34,197,94,0.3)] transition-all duration-300 border-0 flex items-center justify-center ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <RefreshCw className="w-5 h-5" />
        )}
      </div>
      
      {/* Create Product Button - Right */}
      <div 
        onClick={loading ? undefined : onAddProduct} 
        className={`sm:hidden fixed bottom-6 right-4 z-50 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.15),0_8px_32px_rgba(147,51,234,0.4),0_16px_48px_rgba(147,51,234,0.2)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2),0_16px_48px_rgba(147,51,234,0.5),0_24px_64px_rgba(147,51,234,0.3)] transition-all duration-300 border-0 flex items-center justify-center ${
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
      >
        <Plus className="w-6 h-6" />
      </div>
    </>
  );
};

export default ProductHeader;
