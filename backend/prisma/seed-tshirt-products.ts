import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👕 Starting T-shirt product database seeding...');

  try {
    // Get existing categories
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    if (categories.length === 0) {
      console.log('❌ No categories found. Please run seed:tshirt-categories first.');
      return;
    }

    console.log(`✅ Found ${categories.length} categories`);

    // Clear existing products
    console.log('🧹 Clearing existing products...');
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();

    console.log('✅ Existing products cleared');

    // Create sample products for each category
    const products = await Promise.all([
      // Basic T-Shirts
      prisma.product.create({
        data: {
          name: 'Classic Cotton Crew Neck',
          slug: 'classic-cotton-crew-neck',
          description: 'Essential 100% cotton crew neck t-shirt with a comfortable, classic fit. Perfect for everyday wear and layering.',
          shortDescription: 'Essential cotton crew neck for daily wear',
          price: 24.99,
          comparePrice: 34.99,
          sku: 'BASIC-001',
          categoryId: categories[0].id, // Basic T-Shirts
          isActive: true,
          isFeatured: true,
          tags: ['cotton', 'basic', 'crew-neck', 'essential'],
          metaTitle: 'Classic Cotton Crew Neck T-Shirt - Essential Basic',
          metaDescription: 'Essential 100% cotton crew neck t-shirt with a comfortable, classic fit. Perfect for everyday wear.',
          variants: {
            create: [
              { size: 'S', color: 'White', colorCode: '#FFFFFF', stock: 100, sku: 'BASIC-001-S-WHITE' },
              { size: 'M', color: 'White', colorCode: '#FFFFFF', stock: 150, sku: 'BASIC-001-M-WHITE' },
              { size: 'L', color: 'White', colorCode: '#FFFFFF', stock: 120, sku: 'BASIC-001-L-WHITE' },
              { size: 'XL', color: 'White', colorCode: '#FFFFFF', stock: 80, sku: 'BASIC-001-XL-WHITE' },
              { size: 'S', color: 'Black', colorCode: '#000000', stock: 90, sku: 'BASIC-001-S-BLACK' },
              { size: 'M', color: 'Black', colorCode: '#000000', stock: 140, sku: 'BASIC-001-M-BLACK' },
              { size: 'L', color: 'Black', colorCode: '#000000', stock: 110, sku: 'BASIC-001-L-BLACK' },
              { size: 'XL', color: 'Black', colorCode: '#000000', stock: 70, sku: 'BASIC-001-XL-BLACK' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', alt: 'Classic Cotton Crew Neck - White', isPrimary: true, sortOrder: 1 },
              { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', alt: 'Classic Cotton Crew Neck - Black', isPrimary: false, sortOrder: 2 }
            ]
          }
        }
      }),

      // Graphic T-Shirts
      prisma.product.create({
        data: {
          name: 'Abstract Art Print Tee',
          slug: 'abstract-art-print-tee',
          description: 'Bold abstract art print t-shirt featuring unique geometric designs. Made from soft, breathable fabric with vibrant colors.',
          shortDescription: 'Bold abstract art print with vibrant colors',
          price: 32.99,
          comparePrice: 42.99,
          sku: 'GRAPHIC-001',
          categoryId: categories[1].id, // Graphic T-Shirts
          isActive: true,
          isFeatured: true,
          tags: ['graphic', 'abstract', 'art', 'vibrant'],
          metaTitle: 'Abstract Art Print T-Shirt - Bold Geometric Designs',
          metaDescription: 'Bold abstract art print t-shirt featuring unique geometric designs. Made from soft, breathable fabric.',
          variants: {
            create: [
              { size: 'S', color: 'Navy', colorCode: '#000080', stock: 45, sku: 'GRAPHIC-001-S-NAVY' },
              { size: 'M', color: 'Navy', colorCode: '#000080', stock: 60, sku: 'GRAPHIC-001-M-NAVY' },
              { size: 'L', color: 'Navy', colorCode: '#000080', stock: 50, sku: 'GRAPHIC-001-L-NAVY' },
              { size: 'XL', color: 'Navy', colorCode: '#000080', stock: 35, sku: 'GRAPHIC-001-XL-NAVY' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop', alt: 'Abstract Art Print Tee - Navy', isPrimary: true, sortOrder: 1 }
            ]
          }
        }
      }),

      // Vintage & Retro T-Shirts
      prisma.product.create({
        data: {
          name: 'Retro Striped Vintage Tee',
          slug: 'retro-striped-vintage-tee',
          description: 'Nostalgic retro-striped t-shirt with a vintage feel. Made from soft, pre-shrunk cotton with authentic retro styling.',
          shortDescription: 'Nostalgic retro-striped vintage style',
          price: 28.99,
          comparePrice: 38.99,
          sku: 'VINTAGE-001',
          categoryId: categories[2].id, // Vintage & Retro T-Shirts
          isActive: true,
          isFeatured: false,
          tags: ['vintage', 'retro', 'striped', 'nostalgic'],
          metaTitle: 'Retro Striped Vintage T-Shirt - Nostalgic Style',
          metaDescription: 'Nostalgic retro-striped t-shirt with a vintage feel. Made from soft, pre-shrunk cotton.',
          variants: {
            create: [
              { size: 'S', color: 'Cream', colorCode: '#F5F5DC', stock: 40, sku: 'VINTAGE-001-S-CREAM' },
              { size: 'M', color: 'Cream', colorCode: '#F5F5DC', stock: 55, sku: 'VINTAGE-001-M-CREAM' },
              { size: 'L', color: 'Cream', colorCode: '#F5F5DC', stock: 45, sku: 'VINTAGE-001-L-CREAM' },
              { size: 'XL', color: 'Cream', colorCode: '#F5F5DC', stock: 30, sku: 'VINTAGE-001-XL-CREAM' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', alt: 'Retro Striped Vintage Tee - Cream', isPrimary: true, sortOrder: 1 }
            ]
          }
        }
      }),

      // Premium & Designer T-Shirts
      prisma.product.create({
        data: {
          name: 'Luxury Silk Blend Tee',
          slug: 'luxury-silk-blend-tee',
          description: 'Premium t-shirt crafted from a luxurious silk-cotton blend. Sophisticated design with exceptional comfort and drape.',
          shortDescription: 'Premium silk-cotton blend luxury tee',
          price: 89.99,
          comparePrice: 119.99,
          sku: 'PREMIUM-001',
          categoryId: categories[3].id, // Premium & Designer T-Shirts
          isActive: true,
          isFeatured: true,
          tags: ['premium', 'luxury', 'silk', 'designer'],
          metaTitle: 'Luxury Silk Blend T-Shirt - Premium Comfort',
          metaDescription: 'Premium t-shirt crafted from a luxurious silk-cotton blend. Sophisticated design with exceptional comfort.',
          variants: {
            create: [
              { size: 'S', color: 'Charcoal', colorCode: '#36454F', stock: 25, sku: 'PREMIUM-001-S-CHARCOAL' },
              { size: 'M', color: 'Charcoal', colorCode: '#36454F', stock: 35, sku: 'PREMIUM-001-M-CHARCOAL' },
              { size: 'L', color: 'Charcoal', colorCode: '#36454F', stock: 30, sku: 'PREMIUM-001-L-CHARCOAL' },
              { size: 'XL', color: 'Charcoal', colorCode: '#36454F', stock: 20, sku: 'PREMIUM-001-XL-CHARCOAL' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', alt: 'Luxury Silk Blend Tee - Charcoal', isPrimary: true, sortOrder: 1 }
            ]
          }
        }
      }),

      // Sports & Athletic T-Shirts
      prisma.product.create({
        data: {
          name: 'Performance Training Tee',
          slug: 'performance-training-tee',
          description: 'High-performance training t-shirt with moisture-wicking technology. Designed for intense workouts with maximum comfort and breathability.',
          shortDescription: 'High-performance moisture-wicking training tee',
          price: 39.99,
          comparePrice: 49.99,
          sku: 'SPORTS-001',
          categoryId: categories[4].id, // Sports & Athletic T-Shirts
          isActive: true,
          isFeatured: true,
          tags: ['sports', 'performance', 'moisture-wicking', 'training'],
          metaTitle: 'Performance Training T-Shirt - Moisture-Wicking Technology',
          metaDescription: 'High-performance training t-shirt with moisture-wicking technology. Designed for intense workouts.',
          variants: {
            create: [
              { size: 'S', color: 'Electric Blue', colorCode: '#00BFFF', stock: 60, sku: 'SPORTS-001-S-BLUE' },
              { size: 'M', color: 'Electric Blue', colorCode: '#00BFFF', stock: 80, sku: 'SPORTS-001-M-BLUE' },
              { size: 'L', color: 'Electric Blue', colorCode: '#00BFFF', stock: 65, sku: 'SPORTS-001-L-BLUE' },
              { size: 'XL', color: 'Electric Blue', colorCode: '#00BFFF', stock: 45, sku: 'SPORTS-001-XL-BLUE' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop', alt: 'Performance Training Tee - Electric Blue', isPrimary: true, sortOrder: 1 }
            ]
          }
        }
      }),

      // Fashion & Trendy T-Shirts
      prisma.product.create({
        data: {
          name: 'Oversized Fashion Tee',
          slug: 'oversized-fashion-tee',
          description: 'Trendy oversized t-shirt with contemporary styling. Perfect for the latest fashion trends with a relaxed, street-ready fit.',
          shortDescription: 'Trendy oversized fashion-forward design',
          price: 44.99,
          comparePrice: 54.99,
          sku: 'FASHION-001',
          categoryId: categories[5].id, // Fashion & Trendy T-Shirts
          isActive: true,
          isFeatured: true,
          tags: ['fashion', 'trendy', 'oversized', 'street-style'],
          metaTitle: 'Oversized Fashion T-Shirt - Trendy Street Style',
          metaDescription: 'Trendy oversized t-shirt with contemporary styling. Perfect for the latest fashion trends.',
          variants: {
            create: [
              { size: 'S', color: 'Sage Green', colorCode: '#9CAF88', stock: 35, sku: 'FASHION-001-S-SAGE' },
              { size: 'M', color: 'Sage Green', colorCode: '#9CAF88', stock: 50, sku: 'FASHION-001-M-SAGE' },
              { size: 'L', color: 'Sage Green', colorCode: '#9CAF88', stock: 40, sku: 'FASHION-001-L-SAGE' },
              { size: 'XL', color: 'Sage Green', colorCode: '#9CAF88', stock: 25, sku: 'FASHION-001-XL-SAGE' }
            ]
          },
          images: {
            create: [
              { url: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop', alt: 'Oversized Fashion Tee - Sage Green', isPrimary: true, sortOrder: 1 }
            ]
          }
        }
      })
    ]);

    console.log(`✅ Created ${products.length} sample T-shirt products`);

    // Display created products
    console.log('\n📋 Created Products:');
    products.forEach((product, index) => {
      const category = categories.find(c => c.id === product.categoryId);
      console.log(`${index + 1}. ${product.name} - ${category?.name} ($${product.price})`);
    });

    console.log('\n🎉 T-shirt product seeding completed successfully!');
    console.log(`📊 Total products created: ${products.length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
