import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('👕 Starting T-shirt category database seeding...');

  try {
    // Clear existing categories first
    console.log('🧹 Clearing existing categories...');
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();

    console.log('✅ Existing data cleared');

    // Create comprehensive T-shirt categories
    const categories = await Promise.all([
      // Main T-Shirt Categories
      prisma.category.create({
        data: {
          name: 'Basic T-Shirts',
          slug: 'basic-t-shirts',
          description: 'Essential, comfortable t-shirts perfect for everyday wear. Made from high-quality cotton with classic fits.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 1
        }
      }),

      prisma.category.create({
        data: {
          name: 'Graphic T-Shirts',
          slug: 'graphic-t-shirts',
          description: 'Expressive t-shirts featuring unique designs, artwork, and creative graphics. Stand out with bold prints and artistic expressions.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 2
        }
      }),

      prisma.category.create({
        data: {
          name: 'Vintage & Retro T-Shirts',
          slug: 'vintage-retro-t-shirts',
          description: 'Nostalgic t-shirts with retro designs, vintage aesthetics, and throwback styles. Perfect for those who love classic vibes.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 3
        }
      }),

      prisma.category.create({
        data: {
          name: 'Premium & Designer T-Shirts',
          slug: 'premium-designer-t-shirts',
          description: 'High-end t-shirts crafted from premium materials with sophisticated designs. Luxury comfort meets contemporary style.',
          image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 4
        }
      }),

      prisma.category.create({
        data: {
          name: 'Sports & Athletic T-Shirts',
          slug: 'sports-athletic-t-shirts',
          description: 'Performance-focused t-shirts designed for active lifestyles. Moisture-wicking, breathable, and comfortable for workouts and sports.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 5
        }
      }),

      prisma.category.create({
        data: {
          name: 'Fashion & Trendy T-Shirts',
          slug: 'fashion-trendy-t-shirts',
          description: 'Contemporary t-shirts featuring the latest fashion trends, seasonal styles, and runway-inspired designs.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 6
        }
      }),

      prisma.category.create({
        data: {
          name: 'Band & Music T-Shirts',
          slug: 'band-music-t-shirts',
          description: 'Rock your favorite bands and music artists with authentic merchandise t-shirts. Show your musical taste and support.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 7
        }
      }),

      prisma.category.create({
        data: {
          name: 'Holiday & Seasonal T-Shirts',
          slug: 'holiday-seasonal-t-shirts',
          description: 'Celebrate special occasions with themed t-shirts for holidays, seasons, and special events throughout the year.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 8
        }
      }),

      prisma.category.create({
        data: {
          name: 'Custom & Personalized T-Shirts',
          slug: 'custom-personalized-t-shirts',
          description: 'Make it personal with customizable t-shirts. Add your own text, designs, or choose from our personalization options.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 9
        }
      }),

      prisma.category.create({
        data: {
          name: 'Eco-Friendly T-Shirts',
          slug: 'eco-friendly-t-shirts',
          description: 'Sustainable t-shirts made from organic cotton, recycled materials, and eco-conscious manufacturing processes.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 10
        }
      }),

      prisma.category.create({
        data: {
          name: 'Plus Size T-Shirts',
          slug: 'plus-size-t-shirts',
          description: 'Comfortable and stylish t-shirts designed specifically for plus-size individuals. Perfect fit and flattering styles.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 11
        }
      }),

      prisma.category.create({
        data: {
          name: 'Kids & Youth T-Shirts',
          slug: 'kids-youth-t-shirts',
          description: 'Fun and colorful t-shirts designed for children and teenagers. Durable, comfortable, and age-appropriate styles.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 12
        }
      }),

      prisma.category.create({
        data: {
          name: 'Limited Edition T-Shirts',
          slug: 'limited-edition-t-shirts',
          description: 'Exclusive t-shirts with limited availability. Unique designs, special collaborations, and collector\'s items.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 13
        }
      }),

      prisma.category.create({
        data: {
          name: 'Workout & Gym T-Shirts',
          slug: 'workout-gym-t-shirts',
          description: 'Performance t-shirts optimized for gym workouts, training sessions, and athletic activities. Comfort and functionality combined.',
          image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 14
        }
      }),

      prisma.category.create({
        data: {
          name: 'Casual & Streetwear T-Shirts',
          slug: 'casual-streetwear-t-shirts',
          description: 'Urban-inspired t-shirts perfect for street style and casual fashion. Comfortable, trendy, and street-ready.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 15
        }
      }),

      prisma.category.create({
        data: {
          name: 'Business & Professional T-Shirts',
          slug: 'business-professional-t-shirts',
          description: 'Smart casual t-shirts suitable for business casual environments. Professional appearance with comfortable fit.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 16
        }
      }),

      prisma.category.create({
        data: {
          name: 'Travel & Adventure T-Shirts',
          slug: 'travel-adventure-t-shirts',
          description: 'Durable t-shirts designed for travelers and adventure seekers. Lightweight, quick-drying, and perfect for any journey.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 17
        }
      }),

      prisma.category.create({
        data: {
          name: 'Artistic & Creative T-Shirts',
          slug: 'artistic-creative-t-shirts',
          description: 'T-shirts featuring original artwork, creative designs, and artistic expressions. Support independent artists and unique creativity.',
          image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 18
        }
      }),

      prisma.category.create({
        data: {
          name: 'Comfort & Lounge T-Shirts',
          slug: 'comfort-lounge-t-shirts',
          description: 'Ultra-soft t-shirts perfect for lounging at home, relaxing, and ultimate comfort. Made from premium, soft materials.',
          image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 19
        }
      }),

      prisma.category.create({
        data: {
          name: 'Statement & Message T-Shirts',
          slug: 'statement-message-t-shirts',
          description: 'T-shirts that make a statement with powerful messages, quotes, and meaningful expressions. Wear your values.',
          image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
          isActive: true,
          sortOrder: 20
        }
      })
    ]);

    console.log(`✅ Created ${categories.length} T-shirt categories`);

    // Display created categories
    console.log('\n📋 Created Categories:');
    categories.forEach((category, index) => {
      console.log(`${index + 1}. ${category.name} (${category.slug})`);
    });

    console.log('\n🎉 T-shirt category seeding completed successfully!');
    console.log(`📊 Total categories created: ${categories.length}`);

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
