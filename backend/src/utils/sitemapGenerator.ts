import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function generateSitemap() {
  try {
    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        category: {
          select: { slug: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
    });

    // Static pages
    const staticPages = [
      { url: "/", priority: "1.0", changefreq: "daily" },
      { url: "/products", priority: "0.9", changefreq: "daily" },
      { url: "/categories", priority: "0.8", changefreq: "weekly" },
      { url: "/about", priority: "0.6", changefreq: "monthly" },
      { url: "/contact", priority: "0.6", changefreq: "monthly" },
    ];

    // Generate XML sitemap
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add static pages
    staticPages.forEach((page) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://yourdomain.com${page.url}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add category pages
    categories.forEach((category) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://yourdomain.com/categories/${category.slug}</loc>\n`;
      sitemap += `    <lastmod>${category.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;
      sitemap += `  </url>\n`;
    });

    // Add product pages
    products.forEach((product) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://yourdomain.com/products/${product.slug}</loc>\n`;
      sitemap += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;
      sitemap += `  </url>\n`;
    });

    sitemap += "</urlset>";

    return sitemap;
  } catch (error) {
    console.error("Error generating sitemap:", error);
    throw error;
  }
}

export async function generateProductSitemap() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: {
        slug: true,
        updatedAt: true,
        images: {
          select: { url: true, alt: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap +=
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    products.forEach((product) => {
      sitemap += `  <url>\n`;
      sitemap += `    <loc>https://yourdomain.com/products/${product.slug}</loc>\n`;
      sitemap += `    <lastmod>${product.updatedAt.toISOString()}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;

      // Add images to sitemap
      product.images.forEach((image) => {
        sitemap += `    <image:image>\n`;
        sitemap += `      <image:loc>https://yourdomain.com${image.url}</image:loc>\n`;
        if (image.alt) {
          sitemap += `      <image:title>${image.alt}</image:title>\n`;
          sitemap += `      <image:caption>${image.alt}</image:caption>\n`;
        }
        sitemap += `    </image:image>\n`;
      });

      sitemap += `  </url>\n`;
    });

    sitemap += "</urlset>";

    return sitemap;
  } catch (error) {
    console.error("Error generating product sitemap:", error);
    throw error;
  }
}
