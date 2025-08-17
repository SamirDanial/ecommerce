import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Product templates for different categories
const productTemplates = {
  't-shirts': [
    {
      baseName: "Classic Cotton T-Shirt",
      variants: ["Premium", "Vintage", "Graphic", "Striped", "Pocket", "Long Sleeve", "Short Sleeve"],
      colors: ["Black", "White", "Navy", "Red", "Green", "Gray", "Yellow", "Pink", "Orange", "Purple"],
      basePrice: 29.99,
      baseCost: 15.00
    },
    {
      baseName: "Premium T-Shirt",
      variants: ["Organic", "Pima Cotton", "Tri-Blend", "Heavyweight", "Lightweight", "V-Neck", "Crew Neck"],
      colors: ["Black", "White", "Navy", "Charcoal", "Heather Gray", "Burgundy", "Forest Green", "Royal Blue"],
      basePrice: 39.99,
      baseCost: 20.00
    }
  ],
  'jeans-pants': [
    {
      baseName: "Premium Denim Jeans",
      variants: ["Slim Fit", "Straight Leg", "Boot Cut", "Skinny", "Relaxed", "High Waist", "Low Waist"],
      colors: ["Blue", "Black", "Gray", "White", "Light Blue", "Dark Blue"],
      basePrice: 89.99,
      baseCost: 45.00
    },
    {
      baseName: "Chino Pants",
      variants: ["Slim Fit", "Straight Leg", "Cargo", "Pleated", "Flat Front", "Stretch", "Classic"],
      colors: ["Khaki", "Navy", "Olive", "Gray", "Beige", "Brown", "Black"],
      basePrice: 79.99,
      baseCost: 40.00
    }
  ],
  'hoodies-sweatshirts': [
    {
      baseName: "Casual Hoodie",
      variants: ["Pullover", "Zip-Up", "Fleece", "Cotton Blend", "Heavyweight", "Lightweight", "Oversized"],
      colors: ["Gray", "Navy", "Black", "Red", "Blue", "Green", "Purple", "Pink"],
      basePrice: 59.99,
      baseCost: 30.00
    },
    {
      baseName: "Premium Sweatshirt",
      variants: ["French Terry", "Fleece", "Cotton", "Blend", "Oversized", "Fitted", "Relaxed"],
      colors: ["Gray", "Navy", "Black", "White", "Burgundy", "Forest Green", "Royal Blue"],
      basePrice: 69.99,
      baseCost: 35.00
    }
  ],
  'shirts-polos': [
    {
      baseName: "Classic Polo Shirt",
      variants: ["Pique", "Jersey", "Mesh", "Long Sleeve", "Short Sleeve", "Slim Fit", "Classic Fit"],
      colors: ["Navy", "White", "Black", "Red", "Green", "Yellow", "Pink", "Orange"],
      basePrice: 49.99,
      baseCost: 25.00
    },
    {
      baseName: "Oxford Shirt",
      variants: ["Button Down", "Regular Collar", "Slim Fit", "Classic Fit", "Long Sleeve", "Short Sleeve"],
      colors: ["White", "Blue", "Pink", "Yellow", "Light Blue", "Striped"],
      basePrice: 69.99,
      baseCost: 35.00
    }
  ],
  'jackets-outerwear': [
    {
      baseName: "Denim Jacket",
      variants: ["Classic", "Distressed", "Oversized", "Cropped", "Long", "Lightweight", "Heavyweight"],
      colors: ["Blue", "Black", "Gray", "White", "Light Blue"],
      basePrice: 99.99,
      baseCost: 50.00
    },
    {
      baseName: "Bomber Jacket",
      variants: ["Classic", "Modern", "Lightweight", "Heavyweight", "Zip-Up", "Button-Up"],
      colors: ["Black", "Navy", "Olive", "Gray", "Red", "Blue", "Green"],
      basePrice: 119.99,
      baseCost: 60.00
    }
  ]
};

// Generate products
function generateProducts() {
  const products = [];
  let productId = 1;
  let skuCounter = 1;

  Object.entries(productTemplates).forEach(([categorySlug, templates]) => {
    const categoryId = getCategoryId(categorySlug);
    
    templates.forEach(template => {
      template.variants.forEach(variant => {
        template.colors.forEach(color => {
          const product = {
            name: `${variant} ${template.baseName}`,
            slug: `${variant.toLowerCase().replace(/\s+/g, '-')}-${template.baseName.toLowerCase().replace(/\s+/g, '-')}`,
            description: `High-quality ${variant.toLowerCase()} ${template.baseName.toLowerCase()} in ${color.toLowerCase()}. Made from premium materials for comfort and style.`,
            shortDescription: `${variant} ${template.baseName.toLowerCase()} in ${color.toLowerCase()}`,
            price: template.basePrice + (Math.random() * 20 - 10),
            comparePrice: template.basePrice + 20,
            costPrice: template.baseCost,
            sku: `PROD-${String(skuCounter).padStart(3, '0')}`,
            barcode: `1234567890${String(skuCounter).padStart(3, '0')}`,
            categoryId: categoryId,
            isActive: true,
            isFeatured: Math.random() > 0.7,
            isOnSale: Math.random() > 0.6,
            salePrice: template.basePrice * 0.8,
            saleEndDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
            weight: 0.3 + Math.random() * 0.7,
            dimensions: `${28 + Math.floor(Math.random() * 8)}x${20 + Math.floor(Math.random() * 6)}x${2 + Math.floor(Math.random() * 3)}`,
            tags: [variant.toLowerCase(), template.baseName.toLowerCase().split(' ')[0], color.toLowerCase(), 'premium'],
            metaTitle: `${variant} ${template.baseName} - ${color}`,
            metaDescription: `High-quality ${variant.toLowerCase()} ${template.baseName.toLowerCase()} in ${color.toLowerCase()}. Available in multiple sizes.`,
            variants: generateVariants(skuCounter, color),
            images: generateImages(color)
          };
          
          products.push(product);
          skuCounter++;
        });
      });
    });
  });

  return products.slice(0, 100); // Limit to 100 products
}

function getCategoryId(categorySlug) {
  const categoryMap = {
    't-shirts': 1,
    'jeans-pants': 2,
    'hoodies-sweatshirts': 3,
    'shirts-polos': 4,
    'jackets-outerwear': 5
  };
  return categoryMap[categorySlug] || 1;
}

function generateVariants(skuBase, color) {
  const sizes = ['S', 'M', 'L', 'XL'];
  const colorCode = getColorCode(color);
  const variants = [];
  
  sizes.forEach((size, index) => {
    variants.push({
      size: size,
      color: color,
      colorCode: colorCode,
      stock: 30 + Math.floor(Math.random() * 50),
      sku: `PROD-${String(skuBase).padStart(3, '0')}-${color.substring(0, 3).toUpperCase()}-${size}`
    });
  });
  
  return variants;
}

function generateImages(color) {
  const images = [];
  const colorCode = getColorCode(color);
  
  // Primary image
  images.push({
    url: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop&color=${encodeURIComponent(colorCode)}`,
    alt: `Product in ${color}`,
    color: color,
    sortOrder: 0,
    isPrimary: true
  });
  
  // Additional images
  for (let i = 1; i <= 3; i++) {
    images.push({
      url: `https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop&color=${encodeURIComponent(colorCode)}`,
      alt: `Product in ${color} - View ${i}`,
      color: color,
      sortOrder: i,
      isPrimary: false
    });
  }
  
  return images;
}

function getColorCode(color) {
  const colorMap = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Navy': '#1E3A8A',
    'Red': '#DC2626',
    'Green': '#059669',
    'Gray': '#6B7280',
    'Yellow': '#EAB308',
    'Pink': '#EC4899',
    'Orange': '#EA580C',
    'Purple': '#9333EA',
    'Blue': '#2563EB',
    'Brown': '#A16207',
    'Beige': '#F5F5DC',
    'Olive': '#84CC16',
    'Burgundy': '#991B1B',
    'Charcoal': '#374151',
    'Heather Gray': '#9CA3AF',
    'Forest Green': '#166534',
    'Royal Blue': '#1D4ED8',
    'Light Blue': '#3B82F6'
  };
  return colorMap[color] || '#000000';
}

// Generate the products
const products = generateProducts();

// Create the TypeScript file content
const tsContent = `import { Size } from '@prisma/client';

export const productData = ${JSON.stringify(products, null, 2).replace(/"size": "([^"]+)"/g, '"size": Size.$1')};

export const categories = [
  { name: "T-Shirts", slug: "t-shirts", description: "Premium quality t-shirts in various styles and colors", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", isActive: true, sortOrder: 1 },
  { name: "Jeans & Pants", slug: "jeans-pants", description: "Comfortable jeans and pants for everyday wear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop", isActive: true, sortOrder: 2 },
  { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts", description: "Warm and comfortable hoodies for casual style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=400&h=300&fit=crop", isActive: true, sortOrder: 3 },
  { name: "Shirts & Polos", slug: "shirts-polos", description: "Classic shirts and polo shirts for smart casual look", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop", isActive: true, sortOrder: 4 },
  { name: "Jackets & Outerwear", slug: "jackets-outerwear", description: "Stylish jackets and outerwear for all seasons", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop", isActive: true, sortOrder: 5 }
];
`;

// Write to file
fs.writeFileSync(path.join(__dirname, 'product-data-generated.ts'), tsContent);

console.log(`✅ Generated ${products.length} clothing products!`);
console.log('📁 File saved as: product-data-generated.ts');
console.log('🔄 You can now replace the existing product-data.ts with this generated file');
