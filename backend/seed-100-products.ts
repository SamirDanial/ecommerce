import { PrismaClient, Size } from '@prisma/client';

const prisma = new PrismaClient();

// Categories
const categories = [
  { name: "T-Shirts", slug: "t-shirts", description: "Premium quality t-shirts in various styles and colors", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", isActive: true, sortOrder: 1 },
  { name: "Jeans & Pants", slug: "jeans-pants", description: "Comfortable jeans and pants for everyday wear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop", isActive: true, sortOrder: 2 },
  { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts", description: "Warm and comfortable hoodies for casual style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=400&h=300&fit=crop", isActive: true, sortOrder: 3 },
  { name: "Shirts & Polos", slug: "shirts-polos", description: "Classic shirts and polo shirts for smart casual look", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop", isActive: true, sortOrder: 4 },
  { name: "Jackets & Outerwear", slug: "jackets-outerwear", description: "Stylish jackets and outerwear for all seasons", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop", isActive: true, sortOrder: 5 }
];

// Sample products (I'll create a few examples, then generate more)
const sampleProducts = [
  {
    name: "Premium Classic Cotton T-Shirt",
    slug: "premium-classic-cotton-tshirt",
    description: "High-quality premium classic cotton t-shirt in black. Made from premium materials for comfort and style.",
    shortDescription: "Premium classic cotton t-shirt in black",
    price: 29.99,
    comparePrice: 39.99,
    costPrice: 15.00,
    sku: "TSH-001",
    barcode: "1234567890001",
    categoryId: 1,
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    weight: 0.3,
    dimensions: "28x20x2",
    tags: ["premium", "cotton", "classic", "black"],
    metaTitle: "Premium Classic Cotton T-Shirt - Black",
    metaDescription: "High-quality premium classic cotton t-shirt in black. Available in multiple sizes.",
    variants: [
      { size: Size.S, color: 'Black', colorCode: '#000000', stock: 50, sku: 'TSH-001-BLK-S' },
      { size: Size.M, color: 'Black', colorCode: '#000000', stock: 75, sku: 'TSH-001-BLK-M' },
      { size: Size.L, color: 'Black', colorCode: '#000000', stock: 60, sku: 'TSH-001-BLK-L' },
      { size: Size.XL, color: 'Black', colorCode: '#000000', stock: 40, sku: 'TSH-001-BLK-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', alt: 'Premium Classic Cotton T-Shirt - Black', color: 'Black', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Premium Classic Cotton T-Shirt - Black Back', color: 'Black', sortOrder: 1, isPrimary: false }
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
    barcode: "1234567890002",
    categoryId: 1,
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    salePrice: 29.99,
    saleEndDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    weight: 0.35,
    dimensions: "28x20x2",
    tags: ["vintage", "graphic", "retro", "cotton"],
    metaTitle: "Vintage Graphic T-Shirt - Retro Style",
    metaDescription: "Retro-inspired graphic t-shirt with vintage artwork. Available in multiple colors.",
    variants: [
      { size: Size.S, color: 'Red', colorCode: '#DC2626', stock: 40, sku: 'TSH-002-RED-S' },
      { size: Size.M, color: 'Red', colorCode: '#DC2626', stock: 60, sku: 'TSH-002-RED-M' },
      { size: Size.L, color: 'Red', colorCode: '#DC2626', stock: 50, sku: 'TSH-002-RED-L' },
      { size: Size.XL, color: 'Red', colorCode: '#DC2626', stock: 35, sku: 'TSH-002-RED-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Red', color: 'Red', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Vintage Graphic T-Shirt - Red Back', color: 'Red', sortOrder: 1, isPrimary: false }
    ]
  }
];

// Generate 100 products
function generateProducts() {
  const products = [];
  let skuCounter = 1;
  
  const productTypes = [
    { baseName: "Premium Cotton T-Shirt", categoryId: 1, basePrice: 29.99, baseCost: 15.00 },
    { baseName: "Vintage Graphic T-Shirt", categoryId: 1, basePrice: 34.99, baseCost: 18.00 },
    { baseName: "Organic Cotton T-Shirt", categoryId: 1, basePrice: 39.99, baseCost: 20.00 },
    { baseName: "Premium Denim Jeans", categoryId: 2, basePrice: 89.99, baseCost: 45.00 },
    { baseName: "Slim Fit Chino Pants", categoryId: 2, basePrice: 79.99, baseCost: 40.00 },
    { baseName: "Casual Hoodie", categoryId: 3, basePrice: 59.99, baseCost: 30.00 },
    { baseName: "Premium Sweatshirt", categoryId: 3, basePrice: 69.99, baseCost: 35.00 },
    { baseName: "Classic Polo Shirt", categoryId: 4, basePrice: 49.99, baseCost: 25.00 },
    { baseName: "Oxford Shirt", categoryId: 4, basePrice: 69.99, baseCost: 35.00 },
    { baseName: "Denim Jacket", categoryId: 5, basePrice: 99.99, baseCost: 50.00 }
  ];
  
  const colors = ['Black', 'White', 'Navy', 'Red', 'Green', 'Gray', 'Blue', 'Brown', 'Pink', 'Orange'];
  const variants = ['Premium', 'Classic', 'Vintage', 'Modern', 'Casual', 'Sporty', 'Elegant', 'Street', 'Minimalist', 'Bold'];
  
  for (let i = 0; i < 100; i++) {
    const productType = productTypes[i % productTypes.length];
    const variant = variants[i % variants.length];
    const color = colors[i % colors.length];
    
         const product = {
       name: `${variant} ${productType.baseName} ${i + 1}`,
       slug: `${variant.toLowerCase().replace(/\s+/g, '-')}-${productType.baseName.toLowerCase().replace(/\s+/g, '-')}-${i + 1}`,
      description: `High-quality ${variant.toLowerCase()} ${productType.baseName.toLowerCase()} in ${color.toLowerCase()}. Made from premium materials for comfort and style.`,
      shortDescription: `${variant} ${productType.baseName.toLowerCase()} in ${color.toLowerCase()}`,
      price: productType.basePrice + (Math.random() * 20 - 10),
      comparePrice: productType.basePrice + 20,
      costPrice: productType.baseCost,
      sku: `PROD-${String(skuCounter).padStart(3, '0')}`,
      barcode: `1234567890${String(skuCounter).padStart(3, '0')}`,
      categoryId: productType.categoryId,
      isActive: true,
      isFeatured: Math.random() > 0.7,
      isOnSale: Math.random() > 0.6,
      salePrice: productType.basePrice * 0.8,
      saleEndDate: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000),
      weight: 0.3 + Math.random() * 0.7,
      dimensions: `${28 + Math.floor(Math.random() * 8)}x${20 + Math.floor(Math.random() * 6)}x${2 + Math.floor(Math.random() * 3)}`,
      tags: [variant.toLowerCase(), productType.baseName.toLowerCase().split(' ')[0], color.toLowerCase(), 'premium'],
      metaTitle: `${variant} ${productType.baseName} - ${color}`,
      metaDescription: `High-quality ${variant.toLowerCase()} ${productType.baseName.toLowerCase()} in ${color.toLowerCase()}. Available in multiple sizes.`,
      variants: generateVariants(skuCounter, color),
      images: generateImages(color)
    };
    
    products.push(product);
    skuCounter++;
  }
  
  return products;
}

function generateVariants(skuBase: number, color: string) {
  const sizes = [Size.S, Size.M, Size.L, Size.XL];
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

function generateImages(color: string) {
  const images = [];
  const colorCode = getColorCode(color);
  
  // Primary image
  images.push({
    url: `https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop`,
    alt: `Product in ${color}`,
    color: color,
    sortOrder: 0,
    isPrimary: true
  });
  
  // Additional image
  images.push({
    url: `https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop`,
    alt: `Product in ${color} - Back View`,
    color: color,
    sortOrder: 1,
    isPrimary: false
  });
  
  return images;
}

function getColorCode(color: string) {
  const colorMap: Record<string, string> = {
    'Black': '#000000',
    'White': '#FFFFFF',
    'Navy': '#1E3A8A',
    'Red': '#DC2626',
    'Green': '#059669',
    'Gray': '#6B7280',
    'Blue': '#2563EB',
    'Brown': '#A16207',
    'Pink': '#EC4899',
    'Orange': '#EA580C'
  };
  return colorMap[color] || '#000000';
}

async function main() {
  console.log('Starting 100-product seeding...');

  // Create categories
  console.log('Creating categories...');
  const createdCategories: any[] = [];
  for (const category of categories) {
    const createdCategory = await prisma.category.create({
      data: category
    });
    createdCategories.push(createdCategory);
    console.log(`Created category: ${createdCategory.name}`);
  }

  // Generate and create products
  console.log('Generating 100 products...');
  const products = generateProducts();
  
  console.log('Creating products...');
  for (const productItem of products) {
    const { variants, images, ...productInfo } = productItem;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        categoryId: createdCategories[productInfo.categoryId - 1].id
      }
    });
    
    console.log(`Created product: ${product.name}`);

    // Create variants
    for (const variant of variants) {
      await prisma.productVariant.create({
        data: {
          ...variant,
          productId: product.id
        }
      });
    }

    // Create images
    for (const image of images) {
      await prisma.productImage.create({
        data: {
          ...image,
          productId: product.id
        }
      });
    }
  }

  console.log(`✅ Successfully created ${products.length} products with variants and images!`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
