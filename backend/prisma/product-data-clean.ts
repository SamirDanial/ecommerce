import { Size } from '@prisma/client';

export const productData = [
  {
    "name": "Premium Classic Cotton T-Shirt",
    "slug": "premium-classic-cotton-t-shirt",
    "description": "High-quality premium classic cotton t-shirt made from 100% organic cotton. Features a comfortable fit, reinforced stitching, and comes in multiple classic colors. Perfect for everyday wear with a premium feel.",
    "shortDescription": "Premium organic cotton t-shirt in classic colors",
    "price": 29.99,
    "comparePrice": 39.99,
    "costPrice": 15,
    "sku": "TSH-001",
    "barcode": "1234567890001",
    "categoryId": 1,
    "isActive": true,
    "isFeatured": true,
    "isOnSale": true,
    "salePrice": 24.99,
    "saleEndDate": "2025-12-31T23:59:59.000Z",
    "weight": 0.3,
    "dimensions": "30x20x2",
    "tags": ["premium", "organic", "cotton", "classic", "comfortable"],
    "metaTitle": "Premium Classic Cotton T-Shirt - Organic Cotton",
    "metaDescription": "High-quality premium classic cotton t-shirt made from organic cotton. Available in multiple colors and sizes.",
    "variants": [
      {
        "size": Size.S,
        "color": "Black",
        "colorCode": "#000000",
        "stock": 50,
        "sku": "TSH-001-BLK-S"
      },
      {
        "size": Size.M,
        "color": "Black",
        "colorCode": "#000000",
        "stock": 75,
        "sku": "TSH-001-BLK-M"
      },
      {
        "size": Size.L,
        "color": "Black",
        "colorCode": "#000000",
        "stock": 60,
        "sku": "TSH-001-BLK-L"
      },
      {
        "size": Size.XL,
        "color": "Black",
        "colorCode": "#000000",
        "stock": 40,
        "sku": "TSH-001-BLK-XL"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=800&fit=crop",
        "alt": "Premium Classic Cotton T-Shirt - Black",
        "color": "Black",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=800&h=800&fit=crop",
        "alt": "Premium Classic Cotton T-Shirt - Black Side View",
        "color": "Black",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  {
    "name": "Slim Fit Denim Jeans",
    "slug": "slim-fit-denim-jeans",
    "description": "Modern slim fit denim jeans with stretch technology for maximum comfort. Features a classic 5-pocket design, reinforced stitching, and comes in various washes. Perfect for both casual and smart casual occasions.",
    "shortDescription": "Slim fit stretch denim jeans in classic washes",
    "price": 79.99,
    "comparePrice": 99.99,
    "costPrice": 35,
    "sku": "JEA-001",
    "barcode": "1234567890002",
    "categoryId": 2,
    "isActive": true,
    "isFeatured": true,
    "isOnSale": false,
    "salePrice": null,
    "saleEndDate": null,
    "weight": 0.8,
    "dimensions": "32x34x1",
    "tags": ["denim", "slim-fit", "stretch", "jeans", "casual"],
    "metaTitle": "Slim Fit Denim Jeans - Stretch Comfort",
    "metaDescription": "Modern slim fit denim jeans with stretch technology. Available in multiple washes and sizes.",
    "variants": [
      {
        "size": Size.S,
        "color": "Blue",
        "colorCode": "#1E40AF",
        "stock": 30,
        "sku": "JEA-001-BLU-S"
      },
      {
        "size": Size.M,
        "color": "Blue",
        "colorCode": "#1E40AF",
        "stock": 45,
        "sku": "JEA-001-BLU-M"
      },
      {
        "size": Size.L,
        "color": "Blue",
        "colorCode": "#1E40AF",
        "stock": 40,
        "sku": "JEA-001-BLU-L"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&h=800&fit=crop",
        "alt": "Slim Fit Denim Jeans - Blue",
        "color": "Blue",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&h=800&fit=crop",
        "alt": "Slim Fit Denim Jeans - Blue Detail",
        "color": "Blue",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  {
    "name": "Premium Cotton Hoodie",
    "slug": "premium-cotton-hoodie",
    "description": "Ultra-soft premium cotton hoodie with a comfortable fit and stylish design. Features a kangaroo pocket, adjustable drawstring hood, and ribbed cuffs and hem. Perfect for layering in cooler weather.",
    "shortDescription": "Premium cotton hoodie with kangaroo pocket",
    "price": 59.99,
    "comparePrice": 79.99,
    "costPrice": 25,
    "sku": "HOO-001",
    "barcode": "1234567890003",
    "categoryId": 3,
    "isActive": true,
    "isFeatured": false,
    "isOnSale": true,
    "salePrice": 49.99,
    "saleEndDate": "2025-12-31T23:59:59.000Z",
    "weight": 0.6,
    "dimensions": "35x25x3",
    "tags": ["hoodie", "cotton", "premium", "casual", "warm"],
    "metaTitle": "Premium Cotton Hoodie - Comfortable & Warm",
    "metaDescription": "Ultra-soft premium cotton hoodie with kangaroo pocket. Perfect for cooler weather.",
    "variants": [
      {
        "size": Size.S,
        "color": "Gray",
        "colorCode": "#6B7280",
        "stock": 35,
        "sku": "HOO-001-GRY-S"
      },
      {
        "size": Size.M,
        "color": "Gray",
        "colorCode": "#6B7280",
        "stock": 50,
        "sku": "HOO-001-GRY-M"
      },
      {
        "size": Size.L,
        "color": "Gray",
        "colorCode": "#6B7280",
        "stock": 45,
        "sku": "HOO-001-GRY-L"
      },
      {
        "size": Size.XL,
        "color": "Gray",
        "colorCode": "#6B7280",
        "stock": 30,
        "sku": "HOO-001-GRY-XL"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=800&h=800&fit=crop",
        "alt": "Premium Cotton Hoodie - Gray",
        "color": "Gray",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        "alt": "Premium Cotton Hoodie - Gray Detail",
        "color": "Gray",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  {
    "name": "Classic Oxford Shirt",
    "slug": "classic-oxford-shirt",
    "description": "Timeless classic Oxford shirt made from premium cotton Oxford fabric. Features a button-down collar, chest pocket, and classic fit. Perfect for both casual and business casual occasions. Available in multiple classic colors.",
    "shortDescription": "Classic Oxford cotton shirt with button-down collar",
    "price": 49.99,
    "comparePrice": 69.99,
    "costPrice": 20,
    "sku": "SHI-001",
    "barcode": "1234567890004",
    "categoryId": 4,
    "isActive": true,
    "isFeatured": false,
    "isOnSale": false,
    "salePrice": null,
    "saleEndDate": null,
    "weight": 0.4,
    "dimensions": "32x24x2",
    "tags": ["oxford", "shirt", "classic", "button-down", "business-casual"],
    "metaTitle": "Classic Oxford Shirt - Button-Down Collar",
    "metaDescription": "Timeless classic Oxford shirt made from premium cotton. Perfect for casual and business casual occasions.",
    "variants": [
      {
        "size": Size.S,
        "color": "White",
        "colorCode": "#FFFFFF",
        "stock": 40,
        "sku": "SHI-001-WHT-S"
      },
      {
        "size": Size.M,
        "color": "White",
        "colorCode": "#FFFFFF",
        "stock": 55,
        "sku": "SHI-001-WHT-M"
      },
      {
        "size": Size.L,
        "color": "White",
        "colorCode": "#FFFFFF",
        "stock": 45,
        "sku": "SHI-001-WHT-L"
      },
      {
        "size": Size.XL,
        "color": "White",
        "colorCode": "#FFFFFF",
        "stock": 35,
        "sku": "SHI-001-WHT-XL"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800&h=800&fit=crop",
        "alt": "Classic Oxford Shirt - White",
        "color": "White",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&h=800&fit=crop",
        "alt": "Classic Oxford Shirt - White Detail",
        "color": "White",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  {
    "name": "Leather Bomber Jacket",
    "slug": "leather-bomber-jacket",
    "description": "Premium leather bomber jacket with a classic aviator design. Features a ribbed collar, cuffs, and hem, along with multiple pockets for functionality. Made from genuine leather with a comfortable lining. Perfect for adding style to any outfit.",
    "shortDescription": "Premium leather bomber jacket with classic design",
    "price": 199.99,
    "comparePrice": 299.99,
    "costPrice": 80,
    "sku": "JAC-001",
    "barcode": "1234567890005",
    "categoryId": 5,
    "isActive": true,
    "isFeatured": true,
    "isOnSale": true,
    "salePrice": 179.99,
    "saleEndDate": "2025-12-31T23:59:59.000Z",
    "weight": 1.2,
    "dimensions": "40x30x5",
    "tags": ["leather", "bomber", "jacket", "premium", "classic"],
    "metaTitle": "Leather Bomber Jacket - Classic Aviator Style",
    "metaDescription": "Premium leather bomber jacket with classic aviator design. Made from genuine leather with comfortable lining.",
    "variants": [
      {
        "size": Size.S,
        "color": "Brown",
        "colorCode": "#92400E",
        "stock": 25,
        "sku": "JAC-001-BRN-S"
      },
      {
        "size": Size.M,
        "color": "Brown",
        "colorCode": "#92400E",
        "stock": 35,
        "sku": "JAC-001-BRN-M"
      },
      {
        "size": Size.L,
        "color": "Brown",
        "colorCode": "#92400E",
        "stock": 30,
        "sku": "JAC-001-BRN-L"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=800&fit=crop",
        "alt": "Leather Bomber Jacket - Brown",
        "color": "Brown",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=800&h=800&fit=crop",
        "alt": "Leather Bomber Jacket - Brown Detail",
        "color": "Brown",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  },
  {
    "name": "Graphic Print T-Shirt",
    "slug": "graphic-print-t-shirt",
    "description": "Stylish graphic print t-shirt featuring unique artwork and designs. Made from soft cotton blend fabric with a comfortable fit. Each design is carefully crafted and printed using high-quality techniques. Perfect for expressing personal style.",
    "shortDescription": "Stylish graphic print t-shirt with unique designs",
    "price": 34.99,
    "comparePrice": 44.99,
    "costPrice": 18,
    "sku": "TSH-002",
    "barcode": "1234567890006",
    "categoryId": 1,
    "isActive": true,
    "isFeatured": false,
    "isOnSale": false,
    "salePrice": null,
    "saleEndDate": null,
    "weight": 0.35,
    "dimensions": "31x21x2",
    "tags": ["graphic", "print", "t-shirt", "stylish", "unique"],
    "metaTitle": "Graphic Print T-Shirt - Unique Designs",
    "metaDescription": "Stylish graphic print t-shirt featuring unique artwork. Made from soft cotton blend fabric.",
    "variants": [
      {
        "size": Size.S,
        "color": "Navy",
        "colorCode": "#1E3A8A",
        "stock": 30,
        "sku": "TSH-002-NAV-S"
      },
      {
        "size": Size.M,
        "color": "Navy",
        "colorCode": "#1E3A8A",
        "stock": 45,
        "sku": "TSH-002-NAV-M"
      },
      {
        "size": Size.L,
        "color": "Navy",
        "colorCode": "#1E3A8A",
        "stock": 40,
        "sku": "TSH-002-NAV-L"
      },
      {
        "size": Size.XL,
        "color": "Navy",
        "colorCode": "#1E3A8A",
        "stock": 25,
        "sku": "TSH-002-NAV-XL"
      }
    ],
    "images": [
      {
        "url": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=800&fit=crop",
        "alt": "Graphic Print T-Shirt - Navy",
        "color": "Navy",
        "sortOrder": 0,
        "isPrimary": true
      },
      {
        "url": "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=800&fit=crop",
        "alt": "Graphic Print T-Shirt - Navy Detail",
        "color": "Navy",
        "sortOrder": 1,
        "isPrimary": false
      }
    ]
  }
];

export const categories = [
  { name: "T-Shirts", slug: "t-shirts", description: "Premium quality t-shirts in various styles and colors", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop", isActive: true, sortOrder: 1 },
  { name: "Jeans & Pants", slug: "jeans-pants", description: "Comfortable jeans and pants for everyday wear", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=300&fit=crop", isActive: true, sortOrder: 2 },
  { name: "Hoodies & Sweatshirts", slug: "hoodies-sweatshirts", description: "Warm and comfortable hoodies for casual style", image: "https://images.unsplash.com/photo-1556821840-3a63f95609f7?w=400&h=300&fit=crop", isActive: true, sortOrder: 3 },
  { name: "Shirts & Polos", slug: "shirts-polos", description: "Classic shirts and polo shirts for smart casual look", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=300&fit=crop", isActive: true, sortOrder: 4 },
  { name: "Jackets & Outerwear", slug: "jackets-outerwear", description: "Stylish jackets and outerwear for all seasons", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=300&fit=crop", isActive: true, sortOrder: 5 }
];
