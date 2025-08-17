import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function clear() {
  try {
    console.log('Clearing existing data...');
    
    // Clear in correct order due to foreign key constraints
    await prisma.orderItem.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.wishlistItem.deleteMany();
    await prisma.review.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    
    console.log('Database cleared successfully!');
  } catch (error) {
    console.error('Error clearing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

clear();


