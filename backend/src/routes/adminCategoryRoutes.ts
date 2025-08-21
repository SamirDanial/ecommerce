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
      importProducts = true, // Enable product import by default
      existingCategories = 'error' // 'error' | 'skip' | 'replace'
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
      action: 'created' | 'updated' | 'skipped' | 'error' | 'replaced' | 'unknown';
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
          action: 'created' | 'updated' | 'skipped' | 'error' | 'replaced' | 'unknown';
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
          if (existingCategories === 'error') {
            // Error and stop - don't allow import
            result.success = false;
            result.action = 'error';
            result.message = `Category "${category.name}" already exists. Cannot proceed with import.`;
            errors++;
            break; // Stop processing more categories
          } else if (existingCategories === 'skip') {
            // Skip this category but continue with others
            result.success = true;
            result.action = 'skipped';
            result.message = `Category already exists (ID: ${existingCategory.id}), skipping`;
            result.categoryId = existingCategory.id;
            categoryId = existingCategory.id; // Set categoryId for product import
            skipped++;
            // Don't continue - we want to process products for existing categories
          } else if (existingCategories === 'replace') {
            // Remove existing category and all its products
            console.log(`Replacing existing category: ${existingCategory.name} (ID: ${existingCategory.id})`);
            
            // Delete all products in this category first (cascade will handle variants/images)
            const productsToDelete = await prisma.product.findMany({
              where: { categoryId: existingCategory.id }
            });
            
            if (productsToDelete.length > 0) {
              console.log(`Deleting ${productsToDelete.length} products from category ${existingCategory.name}`);
              await prisma.product.deleteMany({
                where: { categoryId: existingCategory.id }
              });
            }
            
            // Delete the category
            await prisma.category.delete({
              where: { id: existingCategory.id }
            });
            
            console.log(`Category ${existingCategory.name} and all its products deleted`);
            
            // Now create the new category
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
            result.action = 'replaced';
            result.categoryId = categoryId;
            result.message = `Category replaced successfully (${productsToDelete.length} products removed)`;
            imported++;
          } else if (skipDuplicates) {
            // Legacy behavior - skip this category
            result.action = 'skipped';
            result.message = `Category already exists (ID: ${existingCategory.id})`;
            result.categoryId = existingCategory.id;
            categoryId = existingCategory.id; // Set categoryId for product import
            skipped++;
          } else if (updateExisting) {
            // Legacy behavior - update existing category
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
            // Legacy behavior - generate unique name and slug
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
    // If we have the "Error & Stop" option and any errors occurred, it's a failure
    // Otherwise, success if we have any successful imports or no errors
    const hasErrorAndStop = options.existingCategories === 'error' && errors > 0;
    const overallSuccess = !hasErrorAndStop && (errors === 0 || (imported + updated + skipped) > 0);
    const statusCode = overallSuccess ? (errors > 0 ? 207 : 200) : 400;

    res.status(statusCode).json({
      success: overallSuccess,
      results,
      summary,
      message: overallSuccess 
        ? `Import completed successfully. ${imported} created, ${updated} updated, ${skipped} skipped. ${totalProductsImported} products imported.`
        : hasErrorAndStop
        ? `Import stopped due to existing categories. ${errors} categories found that cannot be imported.`
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
      description: "Comprehensive Category Import Template - Shows all possible structures",
      notes: [
        "This template demonstrates all possible category import scenarios:",
        "1. Categories WITH products (including variants, images, etc.)",
        "2. Categories WITHOUT products (empty products array)",
        "3. Categories with NULL/empty fields (showing optional fields)",
        "4. All nested product structures (variants, images, tags, etc.)",
        "5. Different data types (strings, numbers, booleans, arrays, nulls)"
      ],
      categories: [
        {
          // Example 1: Category WITH products (full structure)
          name: "Electronics",
          slug: "electronics",
          description: "All electronic devices and accessories",
          image: "https://example.com/images/electronics.jpg",
          isActive: true,
          sortOrder: 1,
          products: [
            {
              name: "Smartphone X",
              description: "Latest smartphone with advanced features",
              shortDescription: "Advanced smartphone",
              price: 599.99,
              comparePrice: 699.99,
              costPrice: 300.00,
              sku: "SMART-X-001",
              barcode: "1234567890123",
              weight: 0.18,
              dimensions: "15.5 x 7.5 x 0.8 cm",
              tags: ["smartphone", "mobile", "5G"],
              metaTitle: "Smartphone X - Latest Technology",
              metaDescription: "Get the latest smartphone with cutting-edge features",
              isActive: true,
              isFeatured: true,
              isOnSale: false,
              salePrice: null,
              saleEndDate: null,
              lowStockThreshold: 5,
              allowBackorder: false,
              variants: [
                {
                  size: "Standard",
                  color: "Black",
                  colorCode: "#000000",
                  stock: 50,
                  sku: "SMART-X-001-BLACK",
                  price: 599.99,
                  comparePrice: 699.99,
                  isActive: true,
                  lowStockThreshold: 3,
                  allowBackorder: false
                },
                {
                  size: "Standard",
                  color: "White",
                  colorCode: "#FFFFFF",
                  stock: 30,
                  sku: "SMART-X-001-WHITE",
                  price: 599.99,
                  comparePrice: 699.99,
                  isActive: true,
                  lowStockThreshold: 3,
                  allowBackorder: false
                }
              ],
              images: [
                {
                  url: "https://example.com/smartphone-black.jpg",
                  alt: "Smartphone X in Black",
                  isPrimary: true,
                  sortOrder: 1
                },
                {
                  url: "https://example.com/smartphone-white.jpg",
                  alt: "Smartphone X in White",
                  isPrimary: false,
                  sortOrder: 2
                }
              ]
            },
            {
              name: "Laptop Pro",
              description: "Professional laptop for work and gaming",
              shortDescription: "Professional laptop",
              price: 1299.99,
              comparePrice: 1499.99,
              costPrice: 800.00,
              sku: "LAPTOP-PRO-001",
              barcode: "9876543210987",
              weight: 2.1,
              dimensions: "35 x 24 x 2 cm",
              tags: ["laptop", "professional", "gaming"],
              metaTitle: "Laptop Pro - Professional Performance",
              metaDescription: "High-performance laptop for professionals and gamers",
              isActive: true,
              isFeatured: true,
              isOnSale: true,
              salePrice: 1199.99,
              saleEndDate: "2025-12-31T00:00:00.000Z",
              lowStockThreshold: 3,
              allowBackorder: true,
              variants: [
                {
                  size: "15.6 inch",
                  color: "Silver",
                  colorCode: "#C0C0C0",
                  stock: 25,
                  sku: "LAPTOP-PRO-001-SILVER",
                  price: 1299.99,
                  comparePrice: 1499.99,
                  isActive: true,
                  lowStockThreshold: 2,
                  allowBackorder: true
                }
              ],
              images: [
                {
                  url: "https://example.com/laptop-silver.jpg",
                  alt: "Laptop Pro in Silver",
                  isPrimary: true,
                  sortOrder: 1
                }
              ]
            }
          ]
        },
        {
          // Example 2: Category WITHOUT products (empty array)
          name: "Clothing",
          slug: "clothing",
          description: "Fashion and apparel items",
          image: "/uploads/categories/clothing.jpg",
          isActive: true,
          sortOrder: 2,
          products: [] // Empty products array
        },
        {
          // Example 3: Category with minimal fields (showing optional fields)
          name: "Books",
          slug: "books",
          description: "Books and publications",
          image: null, // NULL image
          isActive: true,
          sortOrder: 3,
          products: [
            {
              name: "Programming Guide",
              description: "Complete guide to programming",
              price: 29.99,
              // Minimal product - only required fields + a few optional ones
              isActive: true,
              tags: ["programming", "guide", "education"]
            }
          ]
        },
        {
          // Example 4: Category with NULL/empty values (showing field flexibility)
          name: "Home & Garden",
          slug: "home-garden",
          description: "Home improvement and garden supplies",
          image: null,
          isActive: true,
          sortOrder: 4,
          products: [
            {
              name: "Garden Tool Set",
              description: "Essential tools for gardening",
              price: 89.99,
              comparePrice: null, // NULL value
              costPrice: null, // NULL value
              sku: null, // NULL value
              barcode: null, // NULL value
              weight: 0, // Zero value
              dimensions: "", // Empty string
              tags: [], // Empty array
              metaTitle: null, // NULL value
              metaDescription: null, // NULL value
              isActive: true,
              isFeatured: false,
              isOnSale: false,
              salePrice: null,
              saleEndDate: null,
              lowStockThreshold: 0, // Zero value
              allowBackorder: false,
              variants: [], // Empty variants array
              images: [] // Empty images array
            }
          ]
        },
        {
          // Example 5: Category with string numbers (common in exports)
          name: "Sports Equipment",
          slug: "sports-equipment",
          description: "Sports and fitness equipment",
          image: "/uploads/categories/sports.jpg",
          isActive: true,
          sortOrder: 5,
          products: [
            {
              name: "Yoga Mat",
              description: "Premium yoga mat for practice",
              price: "24.99", // String number (common in exports)
              comparePrice: "29.99", // String number
              costPrice: "12.00", // String number
              sku: "YOGA-MAT-001",
              weight: "0.5", // String number
              isActive: true,
              tags: ["yoga", "fitness", "exercise"],
              variants: [
                {
                  size: "Standard",
                  color: "Purple",
                  colorCode: "#800080",
                  stock: "100", // String number
                  price: "24.99", // String number
                  isActive: true,
                  lowStockThreshold: "5" // String number
                }
              ]
            }
          ]
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
