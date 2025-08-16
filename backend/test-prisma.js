import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testPrisma() {
  try {
    console.log('Testing Prisma client...');
    
    // Check if countryConfig exists
    console.log('Available models:', Object.keys(prisma));
    
    // Try to access countryConfig
    if (prisma.countryConfig) {
      console.log('countryConfig model is available');
      const count = await prisma.countryConfig.count();
      console.log('Country count:', count);
    } else {
      console.log('countryConfig model is NOT available');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPrisma();
