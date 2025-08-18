import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

// Function to create a T-shirt SVG placeholder
function createTShirtSVG(width: number, height: number, productName: string): string {
  const shortName = productName.length > 20 ? productName.substring(0, 20) + '...' : productName;
  
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#F3F4F6;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#E5E7EB;stop-opacity:1" />
      </linearGradient>
    </defs>
    
    <!-- Background -->
    <rect width="${width}" height="${height}" fill="url(#bg)"/>
    
    <!-- T-shirt outline -->
    <g stroke="#9CA3AF" stroke-width="2" fill="none">
      <!-- Main body -->
      <rect x="${width*0.2}" y="${height*0.3}" width="${width*0.6}" height="${height*0.5}" rx="5"/>
      <!-- Sleeves -->
      <rect x="${width*0.1}" y="${height*0.25}" width="${width*0.2}" height="${height*0.15}" rx="3"/>
      <rect x="${width*0.7}" y="${height*0.25}" width="${width*0.2}" height="${height*0.15}" rx="3"/>
      <!-- Neck -->
      <rect x="${width*0.35}" y="${height*0.3}" width="${width*0.3}" height="${height*0.1}" rx="2"/>
    </g>
    
    <!-- Product name -->
    <text x="${width/2}" y="${height*0.85}" font-family="Arial, sans-serif" font-size="10" text-anchor="middle" fill="#6B7280">${shortName}</text>
  </svg>`;
}

async function main() {
  console.log('🔄 Starting product image update...');

  try {
    // Ensure uploads directory exists
    const uploadsDir = path.join(__dirname, '../../uploads/products');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Get all existing products
    const products = await prisma.product.findMany({
      include: {
        images: true
      }
    });

    console.log(`📊 Found ${products.length} existing products`);

    for (const product of products) {
      console.log(`\n🔄 Updating images for: ${product.name}`);
      
      // Delete existing text-based images
      for (const image of product.images) {
        await prisma.productImage.delete({
          where: { id: image.id }
        });
      }

      // Create new SVG images
      const imageCount = Math.floor(Math.random() * 4) + 2; // 2-5 images per product
      const images = [];
      
      for (let i = 0; i < imageCount; i++) {
        // Create SVG placeholder image
        const svgContent = createTShirtSVG(400, 400, product.name);
        const imagePath = path.join(uploadsDir, `product-${product.id}-${i + 1}.svg`);
        
        // Write SVG file
        fs.writeFileSync(imagePath, svgContent);
        
        const image = await prisma.productImage.create({
          data: {
            productId: product.id,
            color: null, // General image
            url: `/uploads/products/product-${product.id}-${i + 1}.svg`,
            alt: `${product.name} - View ${i + 1}`,
            sortOrder: i,
            isPrimary: i === 0 // First image is primary
          }
        });
        
        images.push(image);
      }

      console.log(`✅ Updated ${images.length} SVG images for ${product.name}`);
    }

    console.log('\n🎉 Product image update completed successfully!');
    
    // Print summary
    const totalProducts = await prisma.product.count();
    const totalImages = await prisma.productImage.count();
    
    console.log('\n📈 Database Summary:');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Images: ${totalImages}`);
    
    console.log('\n💡 Note: SVG placeholder images have been created. In production, replace these with actual product photos.');

  } catch (error) {
    console.error('❌ Error during image update:', error);
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
