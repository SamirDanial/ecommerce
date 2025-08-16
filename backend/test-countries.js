import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testCountries() {
  try {
    console.log('Testing database connection...');
    
    const count = await prisma.countryConfig.count();
    console.log('Country count:', count);
    
    if (count > 0) {
      const firstCountry = await prisma.countryConfig.findFirst();
      console.log('First country:', firstCountry);
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testCountries();
