import React from 'react';
import { Check } from 'lucide-react';

interface ColorSwatch {
  name: string;
  color: string;
  colorCode?: string;
  imageUrl?: string;
  inStock?: boolean;
}

interface ColorSwatchesProps {
  colors: ColorSwatch[];
  selectedColor: string;
  onColorChange: (color: string) => void;
  className?: string;
  showPreview?: boolean;
}

const ColorSwatches: React.FC<ColorSwatchesProps> = ({
  colors,
  selectedColor,
  onColorChange,
  className = '',
  showPreview = true
}) => {


  const selectedColorData = colors.find(color => color.name === selectedColor);

  const handleColorClick = (colorName: string) => {
    onColorChange(colorName);
  };



  if (!colors || colors.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Color Swatches */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">Color</label>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color.name}
              onClick={() => handleColorClick(color.name)}

              disabled={color.inStock === false}
              className={`
                relative w-12 h-12 rounded-full border-2 transition-all duration-200
                ${selectedColor === color.name 
                  ? 'border-primary ring-2 ring-primary/20 scale-110' 
                  : 'border-border hover:border-primary/50 hover:scale-105'
                }
                ${color.inStock === false ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                ${color.inStock === false ? 'grayscale' : ''}
              `}
              style={{
                backgroundColor: color.colorCode || color.color,
                boxShadow: selectedColor === color.name 
                  ? '0 0 0 2px hsl(var(--primary))' 
                  : 'none'
              }}
              title={`${color.name}${color.inStock === false ? ' - Out of Stock' : ''}`}
            >
              {/* Selected indicator */}
              {selectedColor === color.name && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-4 w-4 text-white drop-shadow-lg" />
                </div>
              )}
              
              {/* Out of stock indicator */}
              {color.inStock === false && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-0.5 bg-red-500 rotate-45 transform origin-center"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Color Preview */}
      {showPreview && selectedColorData && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Selected Color</label>
          <div className="flex items-center gap-3 p-3 rounded-lg border bg-muted/50">
            <div
              className="w-8 h-8 rounded-full border-2 border-border"
              style={{ backgroundColor: selectedColorData.colorCode || selectedColorData.color }}
            />
            <div>
              <p className="font-medium">{selectedColorData.name}</p>
              <p className="text-sm text-muted-foreground">
                {selectedColorData.colorCode || selectedColorData.color}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorSwatches;
