import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
const colors = [
  { name: 'Black', code: '#000000' },
  { name: 'White', code: '#FFFFFF' },
  { name: 'Navy Blue', code: '#000080' },
  { name: 'Red', code: '#FF0000' },
  { name: 'Green', code: '#008000' },
  { name: 'Gray', code: '#808080' },
  { name: 'Yellow', code: '#FFFF00' },
  { name: 'Pink', code: '#FFC0CB' },
  { name: 'Purple', code: '#800080' },
  { name: 'Orange', code: '#FFA500' }
];

const categories = [
  'Basic Tees',
  'Graphic Tees', 
  'Sports Tees',
  'Fashion Tees',
  'Vintage Tees',
  'Premium Tees',
  'Limited Edition',
  'Seasonal Collection'
];

const productData = [
  {
    name: 'Classic Cotton Crew Neck T-Shirt',
    description: 'Premium 100% cotton crew neck t-shirt with a comfortable fit. Perfect for everyday wear, this classic t-shirt features a traditional crew neck design and is available in multiple colors and sizes.',
    shortDescription: 'Premium cotton crew neck t-shirt for everyday comfort',
    price: 24.99,
    comparePrice: 29.99,
    costPrice: 12.50,
    sku: 'CT-CREW-001',
    barcode: '1234567890123',
    weight: 0.25,
    dimensions: '28" x 20" x 2"',
    tags: ['cotton', 'crew-neck', 'basic', 'comfortable', 'everyday'],
    metaTitle: 'Classic Cotton Crew Neck T-Shirt - Premium Comfort',
    metaDescription: 'Shop our premium cotton crew neck t-shirt. Available in multiple colors and sizes. Perfect for everyday wear with superior comfort and quality.',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    categoryName: 'Basic Tees'
  },
  {
    name: 'Vintage Rock Band Graphic Tee',
    description: 'Show off your music taste with this vintage-inspired rock band graphic t-shirt. Features a distressed print design that gives it an authentic retro look. Made from soft, breathable cotton blend.',
    shortDescription: 'Vintage rock band graphic t-shirt with distressed print',
    price: 34.99,
    comparePrice: 39.99,
    costPrice: 18.00,
    sku: 'VT-ROCK-001',
    barcode: '1234567890124',
    weight: 0.28,
    dimensions: '28" x 20" x 2"',
    tags: ['vintage', 'graphic', 'rock', 'music', 'distressed'],
    metaTitle: 'Vintage Rock Band Graphic Tee - Music Lover Style',
    metaDescription: 'Express your music passion with our vintage rock band graphic t-shirt. Features distressed print design and premium cotton blend fabric.',
    isActive: true,
    isFeatured: true,
    isOnSale: true,
    salePrice: 29.99,
    categoryName: 'Graphic Tees'
  },
  {
    name: 'Athletic Performance T-Shirt',
    description: 'High-performance athletic t-shirt designed for active lifestyles. Features moisture-wicking technology, breathable mesh panels, and a comfortable fit that moves with you during workouts and sports activities.',
    shortDescription: 'High-performance athletic t-shirt with moisture-wicking technology',
    price: 39.99,
    comparePrice: 49.99,
    costPrice: 22.00,
    sku: 'AT-PERF-001',
    barcode: '1234567890125',
    weight: 0.22,
    dimensions: '28" x 20" x 2"',
    tags: ['athletic', 'performance', 'moisture-wicking', 'sports', 'workout'],
    metaTitle: 'Athletic Performance T-Shirt - Workout Ready',
    metaDescription: 'Stay dry and comfortable during workouts with our athletic performance t-shirt. Features moisture-wicking technology and breathable mesh panels.',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    categoryName: 'Sports Tees'
  },
  {
    name: 'Fashion Forward Crop Top',
    description: 'Trendy crop top t-shirt perfect for fashion-forward individuals. Features a modern cropped length, stylish cutouts, and premium fabric that drapes beautifully. Ideal for pairing with high-waisted bottoms.',
    shortDescription: 'Trendy crop top t-shirt with modern styling and cutouts',
    price: 44.99,
    comparePrice: 54.99,
    costPrice: 25.00,
    sku: 'FT-CROP-001',
    barcode: '1234567890126',
    weight: 0.20,
    dimensions: '24" x 18" x 2"',
    tags: ['fashion', 'crop-top', 'trendy', 'stylish', 'modern'],
    metaTitle: 'Fashion Forward Crop Top - Trendy Style',
    metaDescription: 'Make a fashion statement with our trendy crop top t-shirt. Features modern styling, stylish cutouts, and premium fabric for a beautiful drape.',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    categoryName: 'Fashion Tees'
  },
  {
    name: 'Retro 90s Style T-Shirt',
    description: 'Take a trip back to the 90s with this retro-style t-shirt. Features bold colors, vintage graphics, and a relaxed fit that captures the essence of 90s fashion. Made from soft, comfortable cotton.',
    shortDescription: 'Retro 90s style t-shirt with bold colors and vintage graphics',
    price: 29.99,
    comparePrice: 34.99,
    costPrice: 16.00,
    sku: 'RT-90S-001',
    barcode: '1234567890127',
    weight: 0.26,
    dimensions: '28" x 20" x 2"',
    tags: ['retro', '90s', 'vintage', 'bold', 'relaxed'],
    metaTitle: 'Retro 90s Style T-Shirt - Vintage Vibes',
    metaDescription: 'Channel 90s nostalgia with our retro-style t-shirt. Features bold colors, vintage graphics, and a relaxed fit for authentic 90s fashion.',
    isActive: true,
    isFeatured: false,
    isOnSale: true,
    salePrice: 24.99,
    categoryName: 'Vintage Tees'
  },
  {
    name: 'Premium Organic Cotton T-Shirt',
    description: 'Luxury organic cotton t-shirt made from the finest materials. Features a premium feel, superior comfort, and sustainable production methods. Perfect for those who appreciate quality and environmental responsibility.',
    shortDescription: 'Luxury organic cotton t-shirt with premium feel and sustainability',
    price: 59.99,
    comparePrice: 69.99,
    costPrice: 35.00,
    sku: 'PT-ORG-001',
    barcode: '1234567890128',
    weight: 0.30,
    dimensions: '28" x 20" x 2"',
    tags: ['premium', 'organic', 'luxury', 'sustainable', 'quality'],
    metaTitle: 'Premium Organic Cotton T-Shirt - Luxury Comfort',
    metaDescription: 'Experience luxury comfort with our premium organic cotton t-shirt. Made from the finest materials with sustainable production methods.',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    categoryName: 'Premium Tees'
  },
  {
    name: 'Limited Edition Artist Collaboration Tee',
    description: 'Exclusive limited edition t-shirt featuring a collaboration with renowned artists. Each piece is numbered and includes a certificate of authenticity. Made from premium materials with unique artwork that makes a statement.',
    shortDescription: 'Limited edition artist collaboration t-shirt with numbered authenticity',
    price: 89.99,
    comparePrice: 99.99,
    costPrice: 45.00,
    sku: 'LE-ART-001',
    barcode: '1234567890129',
    weight: 0.32,
    dimensions: '28" x 20" x 2"',
    tags: ['limited-edition', 'artist', 'collaboration', 'exclusive', 'numbered'],
    metaTitle: 'Limited Edition Artist Collaboration Tee - Exclusive Art',
    metaDescription: 'Own a piece of exclusive art with our limited edition artist collaboration t-shirt. Each piece is numbered with certificate of authenticity.',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    categoryName: 'Limited Edition'
  },
  {
    name: 'Summer Collection Floral Print Tee',
    description: 'Beautiful summer collection t-shirt featuring vibrant floral prints. Perfect for warm weather, this lightweight t-shirt combines style with comfort. The floral pattern adds a touch of elegance to any summer outfit.',
    shortDescription: 'Summer collection t-shirt with vibrant floral prints for warm weather',
    price: 36.99,
    comparePrice: 41.99,
    costPrice: 20.00,
    sku: 'SC-FLOR-001',
    barcode: '1234567890130',
    weight: 0.24,
    dimensions: '28" x 20" x 2"',
    tags: ['summer', 'floral', 'print', 'seasonal', 'vibrant'],
    metaTitle: 'Summer Collection Floral Print Tee - Seasonal Style',
    metaDescription: 'Embrace summer with our floral print t-shirt. Features vibrant patterns perfect for warm weather and elegant summer styling.',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    categoryName: 'Seasonal Collection'
  },
  {
    name: 'Comfort Fit V-Neck T-Shirt',
    description: 'Ultra-comfortable v-neck t-shirt designed for maximum comfort. Features a flattering v-neck design, soft fabric, and a relaxed fit that feels great all day long. Perfect for casual wear and layering.',
    shortDescription: 'Ultra-comfortable v-neck t-shirt with flattering design and soft fabric',
    price: 27.99,
    comparePrice: 32.99,
    costPrice: 15.00,
    sku: 'CF-VNECK-001',
    barcode: '1234567890131',
    weight: 0.25,
    dimensions: '28" x 20" x 2"',
    tags: ['comfort', 'v-neck', 'casual', 'layering', 'soft'],
    metaTitle: 'Comfort Fit V-Neck T-Shirt - Maximum Comfort',
    metaDescription: 'Experience maximum comfort with our v-neck t-shirt. Features a flattering design, soft fabric, and relaxed fit perfect for casual wear.',
    isActive: true,
    isFeatured: false,
    isOnSale: false,
    categoryName: 'Basic Tees'
  },
  {
    name: 'Street Style Oversized T-Shirt',
    description: 'Trendy oversized t-shirt perfect for street style fashion. Features a relaxed, oversized fit, dropped shoulders, and modern styling that creates a contemporary look. Great for pairing with skinny jeans or leggings.',
    shortDescription: 'Trendy oversized t-shirt with relaxed fit and dropped shoulders for street style',
    price: 49.99,
    comparePrice: 59.99,
    costPrice: 28.00,
    sku: 'SS-OVER-001',
    barcode: '1234567890132',
    weight: 0.35,
    dimensions: '32" x 24" x 2"',
    tags: ['street-style', 'oversized', 'trendy', 'relaxed', 'contemporary'],
    metaTitle: 'Street Style Oversized T-Shirt - Contemporary Fashion',
    metaDescription: 'Embrace street style with our oversized t-shirt. Features a relaxed fit, dropped shoulders, and modern styling for contemporary fashion.',
    isActive: true,
    isFeatured: true,
    isOnSale: false,
    categoryName: 'Fashion Tees'
  }
];

async function main() {
  console.log('🌱 Starting product seeding...');

  try {
    // First, let's get or create categories
    const categoryMap = new Map();
    
    for (const categoryName of categories) {
      let category = await prisma.category.findFirst({
        where: { name: categoryName }
      });
      
      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryName,
            slug: categoryName.toLowerCase().replace(/\s+/g, '-'),
            description: `${categoryName} collection featuring high-quality t-shirts`,
            isActive: true,
            sortOrder: categories.indexOf(categoryName)
          }
        });
        console.log(`✅ Created category: ${categoryName}`);
      }
      
      categoryMap.set(categoryName, category);
    }

    // Create products with variants and images
    for (const productInfo of productData) {
      console.log(`\n🔄 Creating product: ${productInfo.name}`);
      
      // Generate slug from name
      const slug = productInfo.name.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

      // Create the product
      const product = await prisma.product.create({
        data: {
          name: productInfo.name,
          description: productInfo.description,
          shortDescription: productInfo.shortDescription,
          price: productInfo.price,
          comparePrice: productInfo.comparePrice,
          costPrice: productInfo.costPrice,
          categoryId: categoryMap.get(productInfo.categoryName)!.id,
          sku: productInfo.sku,
          barcode: productInfo.barcode,
          weight: productInfo.weight,
          dimensions: productInfo.dimensions,
          tags: productInfo.tags,
          metaTitle: productInfo.metaTitle,
          metaDescription: productInfo.metaDescription,
          isActive: productInfo.isActive,
          isFeatured: productInfo.isFeatured,
          isOnSale: productInfo.isOnSale,
          salePrice: productInfo.salePrice,
          slug
        }
      });

      console.log(`✅ Created product: ${product.name} (ID: ${product.id})`);

      // Create variants for this product
      const variants = [];
      for (const size of sizes) {
        for (const color of colors) {
          // Skip some combinations to make it realistic
          if (Math.random() > 0.7) continue;
          
          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              size,
              color: color.name,
              colorCode: color.code,
              stock: Math.floor(Math.random() * 50) + 5, // 5-55 stock
              sku: `${productInfo.sku}-${size}-${color.name.replace(/\s+/g, '')}`,
              price: null, // Use product base price
              comparePrice: null,
              isActive: true
            }
          });
          
          variants.push(variant);
        }
      }

      console.log(`✅ Created ${variants.length} variants for ${product.name}`);

      // Create images for this product
      const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5 images per product
      const images = [];
      
      for (let i = 0; i < imageCount; i++) {
        // Randomly assign some images to specific colors
        const color = Math.random() > 0.6 ? colors[Math.floor(Math.random() * colors.length)].name : null;
        
        const image = await prisma.productImage.create({
          data: {
            productId: product.id,
            color,
            url: `/uploads/products/product-${product.id}-${i + 1}.jpg`,
            alt: `${product.name} - ${color || 'General'} view ${i + 1}`,
            sortOrder: i,
            isPrimary: i === 0 // First image is primary
          }
        });
        
        images.push(image);
      }

      console.log(`✅ Created ${images.length} images for ${product.name}`);
    }

    console.log('\n🎉 Product seeding completed successfully!');
    console.log(`📊 Created ${productData.length} products with variants and images`);
    
    // Print summary
    const totalProducts = await prisma.product.count();
    const totalVariants = await prisma.productVariant.count();
    const totalImages = await prisma.productImage.count();
    
    console.log('\n📈 Database Summary:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Variants: ${totalVariants}`);
    console.log(`   Images: ${totalImages}`);
    console.log(`   Categories: ${categories.length}`);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
