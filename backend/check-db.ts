import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  try {
    const products = await prisma.product.findMany();
    const variants = await prisma.productVariant.findMany();
    const images = await prisma.productImage.findMany();
    
    console.log('Products:', products.length);
    console.log('Variants:', variants.length);
    console.log('Images:', images.length);
    
    if (variants.length > 0) {
      console.log('Sample variant SKU:', variants[0].sku);
    }
    
    if (products.length > 0) {
      console.log('Sample product:', products[0].name);
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

check();


