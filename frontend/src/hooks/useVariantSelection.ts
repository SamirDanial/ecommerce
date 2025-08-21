import { useState, useEffect, useCallback, useRef } from 'react';
import ClientVariantService, { 
  VariantsByColorResponse, 
  ProductColorsResponse, 
  VariantStockInfo 
} from '../services/clientVariantService';

interface UseVariantSelectionProps {
  productId: number;
  initialColor?: string;
  onVariantChange?: (variant: VariantStockInfo | null) => void;
}

interface VariantSelectionState {
  selectedColor: string | null;
  selectedSize: string | null;
  availableColors: ProductColorsResponse | null;
  currentVariants: VariantsByColorResponse | null;
  loading: boolean;
  error: string | null;
}

interface UseVariantSelectionReturn extends VariantSelectionState {
  // Actions
  selectColor: (color: string) => Promise<void>;
  selectSize: (size: string) => void;
  resetSelection: () => void;
  
  // Computed values
  currentPrice: number | null;
  currentComparePrice: number | null;
  isOnSale: boolean;
  salePrice: number | null;
  availableSizes: string[];
  selectedVariant: VariantStockInfo | null;
  
  // Loading states
  colorsLoading: boolean;
  variantsLoading: boolean;
}

export const useVariantSelection = ({ 
  productId, 
  initialColor,
  onVariantChange
}: UseVariantSelectionProps): UseVariantSelectionReturn => {
  const [state, setState] = useState<VariantSelectionState>({
    selectedColor: initialColor || null,
    selectedSize: null,
    availableColors: null,
    currentVariants: null,
    loading: false,
    error: null
  });

  const [colorsLoading, setColorsLoading] = useState(false);
  const [variantsLoading, setVariantsLoading] = useState(false);
  
  // Use ref to prevent callback from causing infinite loops
  const onVariantChangeRef = useRef(onVariantChange);
  onVariantChangeRef.current = onVariantChange;

  // Load available colors on mount
  useEffect(() => {
    loadAvailableColors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // Load variants when color changes
  useEffect(() => {
    if (state.selectedColor) {
      loadVariantsForColor(state.selectedColor);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedColor]);

  // Auto-select first available size when variants load
  useEffect(() => {
    if (state.currentVariants && !state.selectedSize) {
      const firstAvailableSize = state.currentVariants.stockSummary.availableSizes[0];
      if (firstAvailableSize) {
        setState(prev => ({ ...prev, selectedSize: firstAvailableSize }));
      }
    }
  }, [state.currentVariants, state.selectedSize]);

  // Notify parent component when selected variant changes
  useEffect(() => {
    if (onVariantChangeRef.current && state.currentVariants && state.selectedSize) {
      const selectedVariant = state.currentVariants.variants.find(v => v.size === state.selectedSize);
      if (selectedVariant) {
        onVariantChangeRef.current(selectedVariant);
      }
    }
  }, [state.currentVariants, state.selectedSize]);

  const loadAvailableColors = useCallback(async () => {
    try {
      setColorsLoading(true);
      setState(prev => ({ ...prev, error: null }));
      
      const colors = await ClientVariantService.getProductColors(productId);
      
      // Auto-select first color if none selected (using prev state)
      setState(prev => {
        const shouldAutoSelect = !prev.selectedColor && colors.colors.length > 0;
        const firstColor = shouldAutoSelect ? 
          (colors.colors.find(c => c.hasStock) || colors.colors[0]) : 
          null;
        
        return {
          ...prev,
          availableColors: colors,
          selectedColor: firstColor ? firstColor.color : prev.selectedColor
        };
      });
    } catch (error) {
      console.error('Error loading available colors:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load available colors: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }));
    } finally {
      setColorsLoading(false);
    }
  }, [productId]);

  const loadVariantsForColor = useCallback(async (color: string) => {
    try {
      setVariantsLoading(true);
      setState(prev => ({ ...prev, error: null }));
      
      const variants = await ClientVariantService.getVariantsByColor(productId, color);
      setState(prev => ({ 
        ...prev, 
        currentVariants: variants,
        selectedSize: null // Reset size selection when color changes
      }));
    } catch (error) {
      console.error('Error loading variants for color:', error);
      setState(prev => ({ 
        ...prev, 
        error: `Failed to load variants for this color: ${error instanceof Error ? error.message : 'Unknown error'}`,
        currentVariants: null
      }));
    } finally {
      setVariantsLoading(false);
    }
  }, [productId]);

  const selectColor = useCallback(async (color: string) => {
    setState(prev => ({ ...prev, selectedColor: color }));
  }, []);

  const selectSize = useCallback((size: string) => {
    setState(prev => ({ ...prev, selectedSize: size }));
  }, []);

  const resetSelection = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedColor: initialColor || null,
      selectedSize: null,
      currentVariants: null
    }));
  }, [initialColor]);

  // Computed values
  const currentPrice = state.currentVariants?.variants.find(v => v.size === state.selectedSize)?.finalPrice || 
                      state.currentVariants?.product.basePrice || null;

  const currentComparePrice = state.currentVariants?.variants.find(v => v.size === state.selectedSize)?.finalComparePrice || 
                             state.currentVariants?.product.comparePrice || null;

  const isOnSale = state.currentVariants?.product.isOnSale || false;
  const salePrice = state.currentVariants?.product.salePrice || null;

  const availableSizes = state.currentVariants?.stockSummary.availableSizes || [];

  const selectedVariant = state.currentVariants?.variants.find(v => 
    v.size === state.selectedSize
  ) || null;

  return {
    // State
    ...state,
    
    // Actions
    selectColor,
    selectSize,
    resetSelection,
    
    // Computed values
    currentPrice,
    currentComparePrice,
    isOnSale,
    salePrice,
    availableSizes,
    selectedVariant,
    
    // Loading states
    colorsLoading,
    variantsLoading
  };
};
