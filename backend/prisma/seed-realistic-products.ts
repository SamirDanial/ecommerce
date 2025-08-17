import { PrismaClient, Size } from '@prisma/client';
import { productData, categories } from './product-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Clear existing data
  console.log('Clearing existing data...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

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

  // Create products with variants and images
  console.log('Creating products...');
  for (const productItem of productData) {
    const { variants, images, ...productInfo } = productItem;
    
    // Create product
    const product = await prisma.product.create({
      data: {
        ...productInfo,
        categoryId: createdCategories[productInfo.categoryId - 1].id // Assign to correct category
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

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    // process.exit(1); // Commented out for now
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
