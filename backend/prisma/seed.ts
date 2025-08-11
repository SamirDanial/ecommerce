import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting T-shirt e-commerce database seeding...');

  // Clear existing data
  await prisma.recentlyViewed.deleteMany();
  await prisma.review.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.order.deleteMany();
  await prisma.address.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.discountCode.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@example.com',
        password: hashedPassword,
        role: 'USER',
        phone: '+1234567890',
        isEmailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+1234567891',
        isEmailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: hashedPassword,
        role: 'USER',
        phone: '+1234567892',
        isEmailVerified: true
      }
    })
  ]);

  console.log(`✅ Created ${users.length} users`);

  // Create categories
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'T-Shirts',
        slug: 't-shirts',
        description: 'Comfortable and stylish t-shirts for everyday wear',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        isActive: true,
        sortOrder: 1
      }
    }),
    prisma.category.create({
      data: {
        name: 'Polo Shirts',
        slug: 'polo-shirts',
        description: 'Classic polo shirts for a smart casual look',
        image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
        isActive: true,
        sortOrder: 2
      }
    }),
    prisma.category.create({
      data: {
        name: 'Hoodies',
        slug: 'hoodies',
        description: 'Warm and cozy hoodies for cold weather',
        image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
        isActive: true,
        sortOrder: 3
      }
    }),
    prisma.category.create({
      data: {
        name: 'Sweatshirts',
        slug: 'sweatshirts',
        description: 'Comfortable sweatshirts for casual wear',
        image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
        isActive: true,
        sortOrder: 4
      }
    })
  ]);

  console.log(`✅ Created ${categories.length} categories`);

  // Create T-shirts
  const tshirts = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Classic Cotton T-Shirt',
        slug: 'classic-cotton-t-shirt',
        description: 'Premium 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
        shortDescription: 'Comfortable cotton t-shirt for daily wear',
        price: 29.99,
        comparePrice: 39.99,
        sku: 'TSH-001',
        categoryId: categories[0].id,
        isActive: true,
        isFeatured: true,
        tags: ['cotton', 'classic', 'comfortable'],
        metaTitle: 'Classic Cotton T-Shirt - Premium Quality',
        metaDescription: 'Premium 100% cotton t-shirt with a comfortable fit. Perfect for everyday wear.',
        variants: {
          create: [
            { size: 'S', color: 'White', colorCode: '#FFFFFF', stock: 50, sku: 'TSH-001-S-WHITE' },
            { size: 'M', color: 'White', colorCode: '#FFFFFF', stock: 75, sku: 'TSH-001-M-WHITE' },
            { size: 'L', color: 'White', colorCode: '#FFFFFF', stock: 60, sku: 'TSH-001-L-WHITE' },
            { size: 'XL', color: 'White', colorCode: '#FFFFFF', stock: 40, sku: 'TSH-001-XL-WHITE' },
            { size: 'S', color: 'Black', colorCode: '#000000', stock: 45, sku: 'TSH-001-S-BLACK' },
            { size: 'M', color: 'Black', colorCode: '#000000', stock: 70, sku: 'TSH-001-M-BLACK' },
            { size: 'L', color: 'Black', colorCode: '#000000', stock: 55, sku: 'TSH-001-L-BLACK' },
            { size: 'XL', color: 'Black', colorCode: '#000000', stock: 35, sku: 'TSH-001-XL-BLACK' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', alt: 'Classic Cotton T-Shirt - White', isPrimary: true, sortOrder: 1 },
            { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', alt: 'Classic Cotton T-Shirt - Black', isPrimary: false, sortOrder: 2 }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Graphic Print T-Shirt',
        slug: 'graphic-print-t-shirt',
        description: 'Stylish t-shirt with unique graphic prints. Made from soft, breathable fabric.',
        shortDescription: 'Stylish t-shirt with unique graphic prints',
        price: 34.99,
        comparePrice: 44.99,
        sku: 'TSH-002',
        categoryId: categories[0].id,
        isActive: true,
        isFeatured: true,
        tags: ['graphic', 'stylish', 'unique'],
        metaTitle: 'Graphic Print T-Shirt - Unique Designs',
        metaDescription: 'Stylish t-shirt with unique graphic prints. Made from soft, breathable fabric.',
        variants: {
          create: [
            { size: 'S', color: 'Navy', colorCode: '#000080', stock: 30, sku: 'TSH-002-S-NAVY' },
            { size: 'M', color: 'Navy', colorCode: '#000080', stock: 45, sku: 'TSH-002-M-NAVY' },
            { size: 'L', color: 'Navy', colorCode: '#000080', stock: 40, sku: 'TSH-002-L-NAVY' },
            { size: 'XL', color: 'Navy', colorCode: '#000080', stock: 25, sku: 'TSH-002-XL-NAVY' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', alt: 'Graphic Print T-Shirt - Navy', isPrimary: true, sortOrder: 1 }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Vintage Style T-Shirt',
        slug: 'vintage-style-t-shirt',
        description: 'Retro-inspired t-shirt with a vintage feel. Made from soft, pre-shrunk cotton.',
        shortDescription: 'Retro-inspired t-shirt with vintage feel',
        price: 27.99,
        comparePrice: 37.99,
        sku: 'TSH-003',
        categoryId: categories[0].id,
        isActive: true,
        isFeatured: false,
        tags: ['vintage', 'retro', 'cotton', 'classic'],
        metaTitle: 'Vintage Style T-Shirt - Retro Design',
        metaDescription: 'Retro-inspired t-shirt with a vintage feel. Made from soft, pre-shrunk cotton.',
        variants: {
          create: [
            { size: 'S', color: 'Cream', colorCode: '#F5F5DC', stock: 35, sku: 'TSH-003-S-CREAM' },
            { size: 'M', color: 'Cream', colorCode: '#F5F5DC', stock: 50, sku: 'TSH-003-M-CREAM' },
            { size: 'L', color: 'Cream', colorCode: '#F5F5DC', stock: 40, sku: 'TSH-003-L-CREAM' },
            { size: 'XL', color: 'Cream', colorCode: '#F5F5DC', stock: 30, sku: 'TSH-003-XL-CREAM' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', alt: 'Vintage Style T-Shirt - Cream', isPrimary: true, sortOrder: 1 }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Premium Polo Shirt',
        slug: 'premium-polo-shirt',
        description: 'Classic polo shirt made from premium pique cotton. Perfect for smart casual occasions.',
        shortDescription: 'Classic polo shirt for smart casual occasions',
        price: 49.99,
        comparePrice: 59.99,
        sku: 'POLO-001',
        categoryId: categories[1].id,
        isActive: true,
        isFeatured: true,
        tags: ['polo', 'premium', 'smart-casual'],
        metaTitle: 'Premium Polo Shirt - Smart Casual',
        metaDescription: 'Classic polo shirt made from premium pique cotton. Perfect for smart casual occasions.',
        variants: {
          create: [
            { size: 'S', color: 'Blue', colorCode: '#0066CC', stock: 35, sku: 'POLO-001-S-BLUE' },
            { size: 'M', color: 'Blue', colorCode: '#0066CC', stock: 50, sku: 'POLO-001-M-BLUE' },
            { size: 'L', color: 'Blue', colorCode: '#0066CC', stock: 45, sku: 'POLO-001-L-BLUE' },
            { size: 'XL', color: 'Blue', colorCode: '#0066CC', stock: 30, sku: 'POLO-001-XL-BLUE' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=400&fit=crop', alt: 'Premium Polo Shirt - Blue', isPrimary: true, sortOrder: 1 }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Comfortable Hoodie',
        slug: 'comfortable-hoodie',
        description: 'Warm and comfortable hoodie perfect for cold weather. Made from soft fleece material.',
        shortDescription: 'Warm and comfortable hoodie for cold weather',
        price: 69.99,
        comparePrice: 79.99,
        sku: 'HOOD-001',
        categoryId: categories[2].id,
        isActive: true,
        isFeatured: true,
        tags: ['hoodie', 'warm', 'comfortable'],
        metaTitle: 'Comfortable Hoodie - Warm and Cozy',
        metaDescription: 'Warm and comfortable hoodie perfect for cold weather. Made from soft fleece material.',
        variants: {
          create: [
            { size: 'S', color: 'Gray', colorCode: '#808080', stock: 25, sku: 'HOOD-001-S-GRAY' },
            { size: 'M', color: 'Gray', colorCode: '#808080', stock: 40, sku: 'HOOD-001-M-GRAY' },
            { size: 'L', color: 'Gray', colorCode: '#808080', stock: 35, sku: 'HOOD-001-L-GRAY' },
            { size: 'XL', color: 'Gray', colorCode: '#808080', stock: 20, sku: 'HOOD-001-XL-GRAY' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', alt: 'Comfortable Hoodie - Gray', isPrimary: true, sortOrder: 1 }
          ]
        }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Casual Sweatshirt',
        slug: 'casual-sweatshirt',
        description: 'Comfortable casual sweatshirt perfect for lounging or casual outings.',
        shortDescription: 'Comfortable casual sweatshirt for lounging',
        price: 54.99,
        comparePrice: 64.99,
        sku: 'SWEAT-001',
        categoryId: categories[3].id,
        isActive: true,
        isFeatured: false,
        tags: ['sweatshirt', 'casual', 'comfortable'],
        metaTitle: 'Casual Sweatshirt - Comfortable and Stylish',
        metaDescription: 'Comfortable casual sweatshirt perfect for lounging or casual outings.',
        variants: {
          create: [
            { size: 'S', color: 'Black', colorCode: '#000000', stock: 30, sku: 'SWEAT-001-S-BLACK' },
            { size: 'M', color: 'Black', colorCode: '#000000', stock: 45, sku: 'SWEAT-001-M-BLACK' },
            { size: 'L', color: 'Black', colorCode: '#000000', stock: 40, sku: 'SWEAT-001-L-BLACK' },
            { size: 'XL', color: 'Black', colorCode: '#000000', stock: 25, sku: 'SWEAT-001-XL-BLACK' }
          ]
        },
        images: {
          create: [
            { url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop', alt: 'Casual Sweatshirt - Black', isPrimary: true, sortOrder: 1 }
          ]
        }
      }
    })
  ]);

  console.log(`✅ Created ${tshirts.length} products with variants and images`);

  // Create some reviews
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        userId: users[0].id,
        productId: tshirts[0].id,
        rating: 5,
        title: 'Excellent quality!',
        comment: 'This t-shirt is incredibly comfortable and the quality is outstanding. Highly recommend!',
        isVerified: true
      }
    }),
    prisma.review.create({
      data: {
        userId: users[1].id,
        productId: tshirts[0].id,
        rating: 4,
        title: 'Great fit',
        comment: 'Perfect fit and very comfortable. Will definitely buy more!',
        isVerified: true
      }
    }),
    prisma.review.create({
      data: {
        userId: users[2].id,
        productId: tshirts[1].id,
        rating: 5,
        title: 'Love the design!',
        comment: 'The graphic print is amazing and the fabric is so soft. Great purchase!',
        isVerified: true
      }
    })
  ]);

  console.log(`✅ Created ${reviews.length} reviews`);

  // Create some discount codes
  const discountCodes = await Promise.all([
    prisma.discountCode.create({
      data: {
        code: 'WELCOME10',
        type: 'PERCENTAGE',
        value: 10,
        minAmount: 50,
        maxDiscount: 20,
        usageLimit: 100,
        isActive: true,
        expiresAt: new Date('2025-12-31')
      }
    }),
    prisma.discountCode.create({
      data: {
        code: 'SAVE20',
        type: 'PERCENTAGE',
        value: 20,
        minAmount: 100,
        maxDiscount: 50,
        usageLimit: 50,
        isActive: true,
        expiresAt: new Date('2025-12-31')
      }
    })
  ]);

  console.log(`✅ Created ${discountCodes.length} discount codes`);

  // Create flash sales
  const flashSales = await Promise.all([
    prisma.flashSale.create({
      data: {
        title: 'Summer Collection Flash Sale',
        description: 'Get up to 50% off on our summer collection! Limited time offer.',
        discountPercentage: 50,
        startDate: new Date(),
        endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
        isActive: true,
        isFeatured: true,
        bannerColor: '#dc2626' // Red color
      }
    }),
    prisma.flashSale.create({
      data: {
        title: 'Weekend Special',
        description: 'Weekend special offer on all premium t-shirts!',
        discountPercentage: 30,
        startDate: new Date(),
        endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        isActive: true,
        isFeatured: false,
        bannerColor: '#7c3aed' // Purple color
      }
    })
  ]);

  console.log(`✅ Created ${flashSales.length} flash sales`);

  console.log('🎉 T-shirt e-commerce database seeding completed successfully!');
  console.log('\n📊 Seeded Data Summary:');
  console.log(`- ${users.length} users`);
  console.log(`- ${categories.length} categories`);
  console.log(`- ${tshirts.length} products`);
  console.log(`- ${reviews.length} reviews`);
  console.log(`- ${discountCodes.length} discount codes`);
  console.log(`- ${flashSales.length} flash sales`);
  console.log('\n🔑 Test Credentials:');
  console.log('- Admin: jane@example.com / password123');
  console.log('- User: john@example.com / password123');
  console.log('- User: bob@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
