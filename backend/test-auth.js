import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Check if we can connect
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Check users table
    const userCount = await prisma.user.count();
    console.log(`📊 Total users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          email: true,
          clerkId: true,
          role: true,
          isEmailVerified: true
        }
      });
      console.log('👥 Users found:', users);
    }
    
    // Check categories table
    const categoryCount = await prisma.category.count();
    console.log(`📂 Total categories in database: ${categoryCount}`);
    
    // Check products table
    const productCount = await prisma.product.count();
    console.log(`📦 Total products in database: ${productCount}`);
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
