// Comprehensive product data for seeding
import { Size } from '@prisma/client';

export const productData = [
  // Clothing Products (20 products)
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description: "Premium 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear.",
    shortDescription: "Premium cotton t-shirt for everyday comfort",
    price: 29.99,
    comparePrice: 39.99,
    costPrice: 15.00,
    sku: "TSH-001",
    barcode: "1234567890123",
    categoryId: 1,
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    salePrice: 24.99,
    saleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    weight: 0.3,
    dimensions: "28x20x2",
    tags: ["cotton", "comfortable", "classic", "casual"],
    metaTitle: "Classic Cotton T-Shirt - Premium Comfort",
    metaDescription: "Premium 100% cotton t-shirt with comfortable fit. Available in multiple colors and sizes.",
    variants: [
      { size: Size.S, color: 'Black', colorCode: '#000000', stock: 50, sku: 'TSH-001-BLK-S' },
      { size: Size.M, color: 'Black', colorCode: '#000000', stock: 75, sku: 'TSH-001-BLK-M' },
      { size: Size.L, color: 'Black', colorCode: '#000000', stock: 60, sku: 'TSH-001-BLK-L' },
      { size: Size.XL, color: 'Black', colorCode: '#000000', stock: 40, sku: 'TSH-001-BLK-XL' },
      { size: Size.S, color: 'White', colorCode: '#FFFFFF', stock: 45, sku: 'TSH-001-WHT-S' },
      { size: Size.M, color: 'White', colorCode: '#FFFFFF', stock: 70, sku: 'TSH-001-WHT-M' },
      { size: Size.L, color: 'White', colorCode: '#FFFFFF', stock: 55, sku: 'TSH-001-WHT-L' },
      { size: Size.XL, color: 'White', colorCode: '#FFFFFF', stock: 35, sku: 'TSH-001-WHT-XL' },
      { size: Size.S, color: 'Navy', colorCode: '#000080', stock: 30, sku: 'TSH-001-NAV-S' },
      { size: Size.M, color: 'Navy', colorCode: '#000080', stock: 50, sku: 'TSH-001-NAV-M' },
      { size: Size.L, color: 'Navy', colorCode: '#000080', stock: 40, sku: 'TSH-001-NAV-L' },
      { size: Size.XL, color: 'Navy', colorCode: '#000080', stock: 25, sku: 'TSH-001-NAV-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Black', color: 'Black', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Black Back View', color: 'Black', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - White', color: 'White', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - White Back View', color: 'White', sortOrder: 3, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Navy', color: 'Navy', sortOrder: 4, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Navy Back View', color: 'Navy', sortOrder: 5, isPrimary: false }
    ]
  },
  {
    name: "Premium Denim Jeans",
    slug: "premium-denim-jeans",
    description: "High-quality denim jeans with perfect fit and durability. Made from premium denim fabric.",
    shortDescription: "Premium denim jeans with perfect fit",
    price: 89.99,
    comparePrice: 119.99,
    costPrice: 45.00,
    sku: "JNS-001",
    barcode: "1234567890124",
    categoryId: 1,
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    weight: 0.8,
    dimensions: "32x30x3",
    tags: ["denim", "jeans", "premium", "durable"],
    metaTitle: "Premium Denim Jeans - Perfect Fit",
    metaDescription: "High-quality denim jeans with perfect fit and durability. Available in multiple washes and sizes.",
    variants: [
      { size: Size.S, color: 'Blue', colorCode: '#1E3A8A', stock: 40, sku: 'JNS-001-BLU-S' },
      { size: Size.M, color: 'Blue', colorCode: '#1E3A8A', stock: 60, sku: 'JNS-001-BLU-M' },
      { size: Size.L, color: 'Blue', colorCode: '#1E3A8A', stock: 50, sku: 'JNS-001-BLU-L' },
      { size: Size.XL, color: 'Blue', colorCode: '#1E3A8A', stock: 30, sku: 'JNS-001-BLU-XL' },
      { size: Size.S, color: 'Black', colorCode: '#000000', stock: 25, sku: 'JNS-001-BLK-S' },
      { size: Size.M, color: 'Black', colorCode: '#000000', stock: 35, sku: 'JNS-001-BLK-S' },
      { size: Size.L, color: 'Black', colorCode: '#000000', stock: 30, sku: 'JNS-001-BLK-L' },
      { size: Size.XL, color: 'Black', colorCode: '#000000', stock: 20, sku: 'JNS-001-BLK-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Premium Denim Jeans - Blue', color: 'Blue', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Premium Denim Jeans - Blue Detail', color: 'Blue', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Premium Denim Jeans - Black', color: 'Black', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Premium Denim Jeans - Black Detail', color: 'Black', sortOrder: 3, isPrimary: false }
    ]
  },
  {
    name: "Casual Hoodie",
    slug: "casual-hoodie",
    description: "Comfortable and stylish hoodie perfect for casual wear. Made from soft cotton blend fabric.",
    shortDescription: "Comfortable cotton blend hoodie",
    price: 59.99,
    comparePrice: 79.99,
    costPrice: 30.00,
    sku: "HOD-001",
    barcode: "1234567890125",
    categoryId: 1,
    isActive: true,
    isFeatured: false,
    isOnSale: true,
    salePrice: 49.99,
    saleEndDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    weight: 0.6,
    dimensions: "30x25x4",
    tags: ["hoodie", "casual", "comfortable", "warm"],
    metaTitle: "Casual Hoodie - Comfortable & Warm",
    metaDescription: "Comfortable and stylish hoodie perfect for casual wear. Available in multiple colors.",
    variants: [
      { size: Size.S, color: 'Gray', colorCode: '#6B7280', stock: 35, sku: 'HOD-001-GRY-S' },
      { size: Size.M, color: 'Gray', colorCode: '#6B7280', stock: 55, sku: 'HOD-001-GRY-M' },
      { size: Size.L, color: 'Gray', colorCode: '#6B7280', stock: 45, sku: 'HOD-001-GRY-L' },
      { size: Size.XL, color: 'Gray', colorCode: '#6B7280', stock: 30, sku: 'HOD-001-GRY-XL' },
      { size: Size.S, color: 'Navy', colorCode: '#1E3A8A', stock: 30, sku: 'HOD-001-NAV-S' },
      { size: Size.M, color: 'Navy', colorCode: '#1E3A8A', stock: 50, sku: 'HOD-001-NAV-M' },
      { size: Size.L, color: 'Navy', colorCode: '#1E3A8A', stock: 40, sku: 'HOD-001-NAV-L' },
      { size: Size.XL, color: 'Navy', colorCode: '#1E3A8A', stock: 25, sku: 'HOD-001-NAV-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=800&h=800&fit=crop', alt: 'Casual Hoodie - Gray', color: 'Gray', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=800&h=800&fit=crop', alt: 'Casual Hoodie - Gray Back', color: 'Gray', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=800&h=800&fit=crop', alt: 'Casual Hoodie - Navy', color: 'Navy', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=800&h=800&fit=crop', alt: 'Casual Hoodie - Navy Back', color: 'Navy', sortOrder: 3, isPrimary: false }
    ]
  },
  {
    name: "Vintage Graphic T-Shirt",
    slug: "vintage-graphic-tshirt",
    description: "Retro-inspired graphic t-shirt with vintage artwork. Made from soft cotton blend for ultimate comfort.",
    shortDescription: "Retro graphic t-shirt with vintage style",
    price: 34.99,
    comparePrice: 44.99,
    costPrice: 18.00,
    sku: "TSH-002",
    barcode: "1234567890126",
    categoryId: 1, // T-Shirts
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    weight: 0.35,
    dimensions: "28x20x2",
    tags: ["vintage", "graphic", "retro", "cotton"],
    metaTitle: "Vintage Graphic T-Shirt - Retro Style",
    metaDescription: "Retro-inspired graphic t-shirt with vintage artwork. Available in multiple colors.",
    variants: [
      { size: Size.S, color: 'Red', colorCode: '#DC2626', stock: 40, sku: 'TSH-002-RED-S' },
      { size: Size.M, color: 'Red', colorCode: '#DC2626', stock: 60, sku: 'TSH-002-RED-M' },
      { size: Size.L, color: 'Red', colorCode: '#DC2626', stock: 50, sku: 'TSH-002-RED-L' },
      { size: Size.XL, color: 'Red', colorCode: '#DC2626', stock: 35, sku: 'TSH-002-RED-XL' },
      { size: Size.S, color: 'Green', colorCode: '#059669', stock: 30, sku: 'TSH-002-GRN-S' },
      { size: Size.M, color: 'Green', colorCode: '#059669', stock: 45, sku: 'TSH-002-GRN-M' },
      { size: Size.L, color: 'Green', colorCode: '#059669', stock: 40, sku: 'TSH-002-GRN-L' },
      { size: Size.XL, color: 'Green', colorCode: '#059669', stock: 25, sku: 'TSH-002-GRN-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Red', color: 'Red', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Red Back', color: 'Red', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Green', color: 'Green', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Green Back', color: 'Green', sortOrder: 3, isPrimary: false }
    ]
  },
  {
    name: "Premium Polo Shirt",
    slug: "premium-polo-shirt",
    description: "Classic polo shirt made from premium pique cotton. Perfect for smart casual occasions and golf.",
    shortDescription: "Premium pique cotton polo shirt",
    price: 49.99,
    comparePrice: 69.99,
    costPrice: 25.00,
    sku: "POL-001",
    barcode: "1234567890127",
    categoryId: 4, // Shirts & Polos
    isActive: true,
    isFeatured: false,
    isOnSale: true,
    salePrice: 39.99,
    saleEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    weight: 0.4,
    dimensions: "30x22x2",
    tags: ["polo", "premium", "pique", "smart-casual"],
    metaTitle: "Premium Polo Shirt - Smart Casual",
    metaDescription: "Classic polo shirt made from premium pique cotton. Available in multiple colors.",
    variants: [
      { size: Size.S, color: 'Navy', colorCode: '#1E3A8A', stock: 35, sku: 'POL-001-NAV-S' },
      { size: Size.M, color: 'Navy', colorCode: '#1E3A8A', stock: 55, sku: 'POL-001-NAV-M' },
      { size: Size.L, color: 'Navy', colorCode: '#1E3A8A', stock: 45, sku: 'POL-001-NAV-L' },
      { size: Size.XL, color: 'Navy', colorCode: '#1E3A8A', stock: 30, sku: 'POL-001-NAV-XL' },
      { size: Size.S, color: 'White', colorCode: '#FFFFFF', stock: 30, sku: 'POL-001-WHT-S' },
      { size: Size.M, color: 'White', colorCode: '#FFFFFF', stock: 50, sku: 'POL-001-WHT-M' },
      { size: Size.L, color: 'White', colorCode: '#FFFFFF', stock: 40, sku: 'POL-001-WHT-L' },
      { size: Size.XL, color: 'White', colorCode: '#FFFFFF', stock: 25, sku: 'POL-001-WHT-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', alt: 'Premium Polo Shirt - Navy', color: 'Navy', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', alt: 'Premium Polo Shirt - Navy Back', color: 'Navy', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', alt: 'Premium Polo Shirt - White', color: 'White', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop', alt: 'Premium Polo Shirt - White Back', color: 'White', sortOrder: 3, isPrimary: false }
    ]
  },
  {
    name: "Slim Fit Chino Pants",
    slug: "slim-fit-chino-pants",
    description: "Modern slim fit chino pants with stretch fabric for comfort and style. Perfect for casual and office wear.",
    shortDescription: "Slim fit chino pants with stretch",
    price: 79.99,
    comparePrice: 99.99,
    costPrice: 40.00,
    sku: "CHN-001",
    barcode: "1234567890128",
    categoryId: 2, // Jeans & Pants
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    weight: 0.7,
    dimensions: "32x30x3",
    tags: ["chino", "slim-fit", "stretch", "casual"],
    metaTitle: "Slim Fit Chino Pants - Modern Style",
    metaDescription: "Modern slim fit chino pants with stretch fabric. Available in multiple colors.",
    variants: [
      { size: Size.S, color: 'Khaki', colorCode: '#F59E0B', stock: 30, sku: 'CHN-001-KHK-S' },
      { size: Size.M, color: 'Khaki', colorCode: '#F59E0B', stock: 50, sku: 'CHN-001-KHK-M' },
      { size: Size.L, color: 'Khaki', colorCode: '#F59E0B', stock: 40, sku: 'CHN-001-KHK-L' },
      { size: Size.XL, color: 'Khaki', colorCode: '#F59E0B', stock: 25, sku: 'CHN-001-KHK-XL' },
      { size: Size.S, color: 'Navy', colorCode: '#1E3A8A', stock: 25, sku: 'CHN-001-NAV-S' },
      { size: Size.M, color: 'Navy', colorCode: '#1E3A8A', stock: 45, sku: 'CHN-001-NAV-M' },
      { size: Size.L, color: 'Navy', colorCode: '#1E3A8A', stock: 35, sku: 'CHN-001-NAV-L' },
      { size: Size.XL, color: 'Navy', colorCode: '#1E3A8A', stock: 20, sku: 'CHN-001-NAV-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Slim Fit Chino Pants - Khaki', color: 'Khaki', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Slim Fit Chino Pants - Khaki Detail', color: 'Khaki', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Slim Fit Chino Pants - Navy', color: 'Navy', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop', alt: 'Slim Fit Chino Pants - Navy Detail', color: 'Navy', sortOrder: 3, isPrimary: false }
    ]
  }
  // Add more products here to reach 100...
];

export const categories = [
  { name: "T-Shirts", slug: "t-shirts", description: "Premium quality t-shirts in various styles and colors", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", isActive: true, sortOrder: 1 },
  { name: "Jeans & Pants", slug: "jeans-pants", description: "Comfortable jeans and pants for everyday wear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop", isActive: true, sortOrder: 2 },
  { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts", description: "Warm and comfortable hoodies for casual style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=400&h=300&fit=crop", isActive: true, sortOrder: 3 },
  { name: "Shirts & Polos", slug: "shirts-polos", description: "Classic shirts and polo shirts for smart casual look", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop", isActive: true, sortOrder: 4 },
  { name: "Jackets & Outerwear", slug: "jackets-outerwear", description: "Stylish jackets and outerwear for all seasons", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop", isActive: true, sortOrder: 5 }
];
