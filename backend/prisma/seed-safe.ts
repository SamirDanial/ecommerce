import { PrismaClient, Size } from '@prisma/client';

const prisma = new PrismaClient();

// Simple product data for testing
const products = [
  {
    name: "Classic Cotton T-Shirt",
    slug: "classic-cotton-tshirt",
    description: "Premium 100% cotton t-shirt with a comfortable fit.",
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
      { size: Size.XL, color: 'White', colorCode: '#FFFFFF', stock: 35, sku: 'TSH-001-WHT-XL' }
    ],
    images: [
      { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Black', color: 'Black', sortOrder: 0, isPrimary: true },
      { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - Black Back View', color: 'Black', sortOrder: 1, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - White', color: 'White', sortOrder: 2, isPrimary: false },
      { url: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=800&h=800&fit=crop', alt: 'Classic Cotton T-Shirt - White Back View', color: 'White', sortOrder: 3, isPrimary: false }
    ]
  }
];

const categories = [
  { name: "T-Shirts", slug: "t-shirts", description: "Premium quality t-shirts in various styles and colors", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", isActive: true, sortOrder: 1 },
  { name: "Jeans & Pants", slug: "jeans-pants", description: "Comfortable jeans and pants for everyday wear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop", isActive: true, sortOrder: 2 },
  { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts", description: "Warm and comfortable hoodies for casual style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=400&h=300&fit=crop", isActive: true, sortOrder: 3 },
  { name: "Shirts & Polos", slug: "shirts-polos", description: "Classic shirts and polo shirts for smart casual look", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop", isActive: true, sortOrder: 4 },
  { name: "Jackets & Outerwear", slug: "jackets-outerwear", description: "Stylish jackets and outerwear for all seasons", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop", isActive: true, sortOrder: 5 }
];

async function main() {
  console.log('Starting safe database seeding...');

  // Check if categories already exist
  const existingCategories = await prisma.category.findMany();
  let createdCategories: any[] = [];

  if (existingCategories.length === 0) {
    console.log('Creating categories...');
    for (const category of categories) {
      const createdCategory = await prisma.category.create({
        data: category
      });
      createdCategories.push(createdCategory);
      console.log(`Created category: ${createdCategory.name}`);
    }
  } else {
    console.log('Categories already exist, using existing ones...');
    createdCategories = existingCategories;
  }

  // Check if products already exist
  const existingProducts = await prisma.product.findMany();
  
  if (existingProducts.length === 0) {
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
      console.log(`Created ${variants.length} variants for ${product.name}`);

      // Create images
      for (const image of images) {
        await prisma.productImage.create({
          data: {
            ...image,
            productId: product.id
          }
        });
      }
      console.log(`Created ${images.length} images for ${product.name}`);
    }
  } else {
    console.log('Products already exist, skipping creation...');
  }

  console.log('Safe database seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
