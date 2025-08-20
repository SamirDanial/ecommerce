import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateClerkToken } from '../middleware/clerkAuth';

const router = express.Router();
const prisma = new PrismaClient();

// Export categories with optional products
router.post('/export', authenticateClerkToken, async (req, res) => {
  try {
    const { categoryIds, includeProducts } = req.body;
    
    if (!Array.isArray(categoryIds) || categoryIds.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'categoryIds array is required and must not be empty' 
      });
    }

    if (includeProducts) {
      // Fetch categories with products
      const categories = await prisma.category.findMany({
        where: { 
          id: { in: categoryIds },
          isActive: true 
        },
        include: {
          products: {
            where: { isActive: true },
            include: {
              variants: true,
              images: true,
              _count: {
                select: {
                  variants: true,
                  images: true,
                  reviews: true
                }
              }
            }
          },
          _count: {
            select: { products: true }
          }
        }
      });

      res.json({
        success: true,
        categories,
        totalCategories: categories.length,
        includesProducts: true
      });
    } else {
      // Fetch categories without products
      const categories = await prisma.category.findMany({
        where: { 
          id: { in: categoryIds },
          isActive: true 
        },
        include: {
          _count: {
            select: { products: true }
          }
        }
      });

      res.json({
        success: true,
        categories,
        totalCategories: categories.length,
        includesProducts: false
      });
    }
  } catch (error) {
    console.error('Error exporting categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to export categories' 
    });
  }
});

// Category Import Routes
router.post('/import/validate', authenticateClerkToken, async (req, res) => {
  try {
    const { categories } = req.body;
    
    if (!Array.isArray(categories)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categories must be an array' 
      });
    }

    const validationResults: Array<{
      index: number;
      valid: boolean;
      errors: string[];
      warnings: string[];
      data: any;
    }> = [];
    const allSlugs = new Set<string>();
    const allNames = new Set<string>();

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const result = {
        index: i,
        valid: true,
        errors: [] as string[],
        warnings: [] as string[],
        data: category
      };

      // Required field validation
      if (!category.name || typeof category.name !== 'string' || category.name.trim().length === 0) {
        result.valid = false;
        result.errors.push('Name is required and must be a non-empty string');
      } else if (category.name.length > 100) {
        result.valid = false;
        result.errors.push('Name must be 100 characters or less');
      }

      // Slug validation and generation
      if (category.slug) {
        if (typeof category.slug !== 'string' || category.slug.length === 0) {
          result.valid = false;
          result.errors.push('Slug must be a non-empty string');
        } else if (category.slug.length > 100) {
          result.valid = false;
          result.errors.push('Slug must be 100 characters or less');
        } else if (!/^[a-z0-9-]+$/.test(category.slug)) {
          result.valid = false;
          result.errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
        }
      }

      // Description validation
      if (category.description && (typeof category.description !== 'string' || category.description.length > 500)) {
        result.valid = false;
        result.errors.push('Description must be a string with 500 characters or less');
      }

      // Image URL validation
      if (category.image && typeof category.image === 'string') {
        if (category.image.length > 255) {
          result.valid = false;
          result.errors.push('Image URL must be 255 characters or less');
        } else if (!category.image.startsWith('http') && !category.image.startsWith('/')) {
          result.valid = false;
          result.errors.push('Image URL must be a valid HTTP URL or relative path');
        }
      }

      // Boolean field validation
      if (category.isActive !== undefined && typeof category.isActive !== 'boolean') {
        result.valid = false;
        result.errors.push('isActive must be a boolean value');
      }

      // Sort order validation
      if (category.sortOrder !== undefined) {
        if (typeof category.sortOrder !== 'number' || !Number.isInteger(category.sortOrder)) {
          result.valid = false;
          result.errors.push('sortOrder must be an integer');
        } else if (category.sortOrder < 0 || category.sortOrder > 9999) {
          result.valid = false;
          result.errors.push('sortOrder must be between 0 and 9999');
        }
      }

      // Duplicate detection within import data
      if (category.name && allNames.has(category.name.toLowerCase())) {
        result.warnings.push('Duplicate name detected within import data');
      }
      if (category.slug && allSlugs.has(category.slug)) {
        result.warnings.push('Duplicate slug detected within import data');
      }

      // Add to tracking sets
      if (category.name) allNames.add(category.name.toLowerCase());
      if (category.slug) allSlugs.add(category.slug);

      validationResults.push(result);
    }

    // Check for duplicates in database
    const existingCategories = await prisma.category.findMany({
      select: { id: true, name: true, slug: true }
    });

    for (const result of validationResults) {
      const category = result.data;
      
      if (category.name) {
        const existingByName = existingCategories.find(c => 
          c.name.toLowerCase() === category.name.toLowerCase()
        );
        if (existingByName) {
          result.warnings.push(`Category with name "${category.name}" already exists (ID: ${existingByName.id})`);
        }
      }

      if (category.slug) {
        const existingBySlug = existingCategories.find(c => c.slug === category.slug);
        if (existingBySlug) {
          result.warnings.push(`Category with slug "${category.slug}" already exists (ID: ${existingBySlug.id})`);
        }
      }
    }

    const totalCategories = categories.length;
    const validCategories = validationResults.filter(r => r.valid).length;
    const invalidCategories = totalCategories - validCategories;
    const warningsCount = validationResults.reduce((sum, r) => sum + r.warnings.length, 0);

    res.json({
      success: true,
      validationResults,
      summary: {
        total: totalCategories,
        valid: validCategories,
        invalid: invalidCategories,
        warnings: warningsCount
      }
    });

  } catch (error) {
    console.error('Error validating categories:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to validate categories' 
    });
  }
});

router.post('/import/execute', authenticateClerkToken, async (req, res) => {
  try {
    const { categories, options = {} } = req.body;
    const { 
      skipDuplicates = false, 
      updateExisting = false, 
      generateSlugs = true,
      generateSortOrder = true,
      importProducts = true // Enable product import by default
    } = options;

    if (!Array.isArray(categories)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Categories must be an array' 
      });
    }

    const results: Array<{
      index: number;
      success: boolean;
      action: 'created' | 'updated' | 'skipped' | 'error' | 'unknown';
      categoryId: number | null;
      message: string;
      data: any;
      productsImported?: number;
      productsErrors?: number;
    }> = [];
    let imported = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;
    let totalProductsImported = 0;
    let totalProductsErrors = 0;

    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
              const result: {
          index: number;
          success: boolean;
          action: 'created' | 'updated' | 'skipped' | 'error' | 'unknown';
          categoryId: number | null;
          message: string;
          data: any;
          productsImported: number;
          productsErrors: number;
        } = {
          index: i,
          success: false,
          action: 'unknown',
          categoryId: null,
          message: '',
          data: category,
          productsImported: 0,
          productsErrors: 0
        };

      try {
        // Generate slug if needed
        let finalSlug = category.slug;
        if (!finalSlug && generateSlugs) {
          finalSlug = await generateUniqueSlug(category.name);
        }

        // Generate sort order if needed
        let finalSortOrder = category.sortOrder;
        if (finalSortOrder === undefined && generateSortOrder) {
          const maxSortOrder = await prisma.category.aggregate({
            _max: { sortOrder: true }
          });
          finalSortOrder = (maxSortOrder._max.sortOrder || 0) + 1;
        }

        // Check if category already exists
        const existingCategory = await prisma.category.findFirst({
          where: {
            OR: [
              { slug: finalSlug },
              { name: category.name }
            ]
          }
        });

        let categoryId: number = 0;
        let productsImported = 0;
        let productsErrors = 0;

        if (existingCategory) {
          if (skipDuplicates) {
            result.action = 'skipped';
            result.message = `Category already exists (ID: ${existingCategory.id})`;
            result.categoryId = existingCategory.id;
            skipped++;
          } else if (updateExisting) {
            // Update existing category
            const updatedCategory = await prisma.category.update({
              where: { id: existingCategory.id },
              data: {
                name: category.name,
                slug: finalSlug,
                description: category.description || null,
                image: category.image || null,
                isActive: category.isActive !== undefined ? category.isActive : true,
                sortOrder: finalSortOrder
              }
            });

            categoryId = updatedCategory.id;
            result.success = true;
            result.action = 'updated';
            result.categoryId = categoryId;
            result.message = 'Category updated successfully';
            updated++;
          } else {
            // Generate unique name and slug for new category
            const uniqueName = await generateUniqueName(category.name);
            const uniqueSlug = await generateUniqueSlug(uniqueName);
            const newCategory = await prisma.category.create({
              data: {
                name: uniqueName,
                slug: uniqueSlug,
                description: category.description || null,
                image: category.image || null,
                isActive: category.isActive !== undefined ? category.isActive : true,
                sortOrder: finalSortOrder
              }
            });

            categoryId = newCategory.id;
            result.success = true;
            result.action = 'created';
            result.categoryId = categoryId;
            result.message = `Category created with unique name: ${uniqueName}`;
            imported++;
          }
        } else {
          // Create new category
          const newCategory = await prisma.category.create({
            data: {
              name: category.name,
              slug: finalSlug,
              description: category.description || null,
              image: category.image || null,
              isActive: category.isActive !== undefined ? category.isActive : true,
              sortOrder: finalSortOrder
            }
          });

          categoryId = newCategory.id;
          result.success = true;
          result.action = 'created';
          result.categoryId = categoryId;
          result.message = 'Category created successfully';
          imported++;
        }

        // Handle products if they exist and importProducts is enabled
        if (category.products && Array.isArray(category.products) && importProducts) {
          try {
            console.log(`Importing products for category ${category.name} (ID: ${categoryId})`);
            const productResults = await importProductsForCategory(category.products, categoryId);
            productsImported = productResults.imported;
            productsErrors = productResults.errors;
            totalProductsImported += productsImported;
            totalProductsErrors += productsErrors;
          } catch (error) {
            console.error(`Error importing products for category ${categoryId}:`, error);
            productsErrors += category.products.length;
            totalProductsErrors += category.products.length;
          }
        }

        result.productsImported = productsImported;
        result.productsErrors = productsErrors;

      } catch (error) {
        console.error(`Error processing category ${i}:`, error);
        result.success = false;
        result.action = 'error';
        result.message = error instanceof Error ? error.message : 'Unknown error occurred';
        errors++;
      }

      results.push(result);
    }

    const summary = {
      total: categories.length,
      imported,
      updated,
      skipped,
      errors,
      totalProductsImported,
      totalProductsErrors
    };

    // Determine overall success
    const overallSuccess = errors === 0 || (imported + updated) > 0;
    const statusCode = overallSuccess ? (errors > 0 ? 207 : 200) : 400;

    res.status(statusCode).json({
      success: overallSuccess,
      results,
      summary,
      message: overallSuccess 
        ? `Import completed successfully. ${imported} created, ${updated} updated, ${skipped} skipped. ${totalProductsImported} products imported.`
        : `Import failed with ${errors} errors.`
    });

  } catch (error) {
    console.error('Error executing category import:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to execute category import' 
    });
  }
});

router.get('/import/template', authenticateClerkToken, async (req, res) => {
  try {
    const template = {
      categories: [
        {
          name: "Electronics",
          slug: "electronics",
          description: "All electronic devices and accessories",
          image: "https://example.com/images/electronics.jpg",
          isActive: true,
          sortOrder: 1
        },
        {
          name: "Smartphones",
          slug: "smartphones",
          description: "Mobile phones and smartphones",
          image: "/uploads/categories/smartphones.jpg",
          isActive: true,
          sortOrder: 2
        },
        {
          name: "Laptops",
          slug: "laptops",
          description: "Portable computers and laptops",
          image: null,
          isActive: true,
          sortOrder: 3
        }
      ]
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="category-import-template.json"');
    res.json(template);

  } catch (error) {
    console.error('Error generating template:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to generate template' 
    });
  }
});

// Helper function to generate unique names
async function generateUniqueName(baseName: string): Promise<string> {
  let name = baseName;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: { name }
    });

    if (!existing) {
      return name;
    }

    name = `${baseName} (${counter})`;
    counter++;
  }
}

// Helper function to generate unique slugs for categories
async function generateUniqueSlug(name: string, excludeId?: number): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.category.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Helper function to generate unique slugs for products
async function generateUniqueProductSlug(name: string, excludeId?: number): Promise<string> {
  const baseSlug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findFirst({
      where: {
        slug,
        ...(excludeId && { id: { not: excludeId } })
      }
    });

    if (!existing) {
      return slug;
    }

    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// Helper function to import products for a category
// IMPORTANT: categoryId parameter is the NEW category ID that was just created/updated
// We completely ignore the old categoryId from the product JSON data
async function importProductsForCategory(products: any[], categoryId: number) {
  let imported = 0;
  let errors = 0;

  console.log(`Starting import of ${products.length} products for NEW category ID: ${categoryId}`);

  for (const productData of products) {
    try {
      console.log(`Processing product: ${productData.name} for category ${categoryId}`);
      
      // Completely ignore the old categoryId from JSON and use the new one
      const productWithCategory = {
        ...productData,
        categoryId: categoryId // Always use the newly created category ID
      };
      
      console.log(`Product data:`, {
        name: productData.name,
        sku: productData.sku,
        oldCategoryId: productData.categoryId, // Show the old ID from JSON (for debugging)
        newCategoryId: categoryId, // Show the new ID we're actually using
        hasVariants: !!productData.variants,
        hasImages: !!productData.images
      });
      
      console.log(`Using categoryId: ${categoryId} for product: ${productData.name}`);

      // Check for existing product by SKU
      let existingProduct = null;
      let finalSku = productData.sku;
      
      if (productData.sku) {
        existingProduct = await prisma.product.findUnique({
          where: { sku: productData.sku }
        });
        
        if (existingProduct) {
          // Generate unique SKU
          finalSku = await generateUniqueSku(productData.sku);
        }
      } else {
        // Generate SKU from name if not provided
        finalSku = await generateUniqueSku(productData.name);
      }

      // Create or update product
      let product;
      if (existingProduct) {
        // Update existing product
        product = await prisma.product.update({
          where: { id: existingProduct.id },
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            comparePrice: productData.comparePrice,
            costPrice: productData.costPrice,
            shortDescription: productData.shortDescription,
            weight: productData.weight,
            dimensions: productData.dimensions,
            tags: productData.tags || [],
            metaTitle: productData.metaTitle,
            metaDescription: productData.metaDescription,
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            isOnSale: productData.isOnSale,
            salePrice: productData.salePrice,
            saleEndDate: productData.saleEndDate,
            sku: finalSku,
            slug: await generateUniqueProductSlug(productData.name), // Generate slug
            categoryId: productWithCategory.categoryId
          }
        });
      } else {
        // Create new product
        product = await prisma.product.create({
          data: {
            name: productData.name,
            description: productData.description,
            price: productData.price,
            comparePrice: productData.comparePrice,
            costPrice: productData.costPrice,
            shortDescription: productData.shortDescription,
            weight: productData.weight,
            dimensions: productData.dimensions,
            tags: productData.tags || [],
            metaTitle: productData.metaTitle,
            metaDescription: productData.metaDescription,
            isActive: productData.isActive,
            isFeatured: productData.isFeatured,
            isOnSale: productData.isOnSale,
            salePrice: productData.salePrice,
            saleEndDate: productData.saleEndDate,
            sku: finalSku,
            slug: await generateUniqueProductSlug(productData.name), // Generate slug
            categoryId: productWithCategory.categoryId
          }
        });
      }

      // Handle variants
      if (productData.variants && Array.isArray(productData.variants)) {
        console.log(`Creating ${productData.variants.length} variants for product ${product.id}`);
        
        // Delete existing variants if updating
        if (existingProduct) {
          await prisma.productVariant.deleteMany({
            where: { productId: product.id }
          });
        }

        // Create new variants
        for (const variantData of productData.variants) {
          console.log(`Creating variant: ${variantData.size} ${variantData.color}`);
          console.log(`  Old productId from JSON: ${variantData.productId}, New productId: ${product.id}`);
          await prisma.productVariant.create({
            data: {
              productId: product.id, // ✅ Using NEW product ID, ignoring old one from JSON
              size: variantData.size,
              color: variantData.color,
              colorCode: variantData.colorCode,
              stock: variantData.stock,
              sku: variantData.sku,
              price: variantData.price,
              comparePrice: variantData.comparePrice,
              isActive: variantData.isActive
            }
          });
        }
      }

      // Handle images
      if (productData.images && Array.isArray(productData.images)) {
        console.log(`Creating ${productData.images.length} images for product ${product.id}`);
        
        // Delete existing images if updating
        if (existingProduct) {
          await prisma.productImage.deleteMany({
            where: { productId: product.id }
          });
        }

        // Create new images
        for (const imageData of productData.images) {
          console.log(`Creating image: ${imageData.url}`);
          console.log(`  Old productId from JSON: ${imageData.productId}, New productId: ${product.id}`);
          await prisma.productImage.create({
            data: {
              productId: product.id, // ✅ Using NEW product ID, ignoring old one from JSON
              color: imageData.color,
              url: imageData.url,
              alt: imageData.alt,
              sortOrder: imageData.sortOrder,
              isPrimary: imageData.isPrimary
            }
          });
        }
      }

      console.log(`Successfully imported product: ${productData.name} (ID: ${product.id})`);
      imported++;
    } catch (error) {
      console.error(`Error importing product ${productData.name}:`, error);
      errors++;
    }
  }
  
  console.log(`Product import completed: ${imported} imported, ${errors} errors`);

  return { imported, errors };
}

// Helper function to generate unique SKUs (reuse from product routes)
async function generateUniqueSku(baseSku: string): Promise<string> {
  let sku = baseSku;
  let counter = 1;

  while (true) {
    const existing = await prisma.product.findUnique({
      where: { sku }
    });

    if (!existing) {
      return sku;
    }

    sku = `${baseSku}-${counter}`;
    counter++;
  }
}

export default router;
