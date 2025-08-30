import React from "react";

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
  sortOrder: number;
}

interface ProductVariant {
  id: number;
  size: string;
  color: string;
  colorCode: string | null;
  stock: number;
  price: any;
  isActive: boolean;
  stockStatus: string;
}

interface Review {
  id: number;
  rating: number;
  title: string | null;
  comment: string | null;
  isVerified: boolean;
  createdAt: Date;
  user: {
    name: string;
  };
}

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  shortDescription: string | null;
  price: any;
  comparePrice: any;
  salePrice: any;
  isOnSale: boolean;
  saleEndDate: Date | null;
  metaTitle: string | null;
  metaDescription: string | null;
  slug: string;
  sku: string | null;
  weight: any;
  dimensions: string | null;
  tags: string[];
  isActive: boolean;
  category: Category;
  images: ProductImage[];
  variants: ProductVariant[];
  reviews: Review[];
  _count?: {
    reviews: number;
  };
}

interface ProductDetailServerProps {
  product: Product;
  relatedProducts?: Product[];
}

export default function ProductDetailServer({
  product,
  relatedProducts = [],
}: ProductDetailServerProps) {
  // Calculate review statistics
  const reviewCount = product.reviews.length;
  const averageRating =
    reviewCount > 0
      ? product.reviews.reduce((sum, review) => sum + review.rating, 0) /
        reviewCount
      : 0;

  // Determine the best price for display
  const displayPrice =
    product.isOnSale && product.salePrice
      ? Number(product.salePrice)
      : Number(product.price);

  const originalPrice =
    product.isOnSale && product.comparePrice
      ? Number(product.comparePrice)
      : Number(product.price);

  // Get primary image or first image
  const primaryImage =
    product.images.find((img) => img.isPrimary) || product.images[0];

  // Generate absolute URLs for social media
  const absoluteImageUrl = primaryImage?.url
    ? `https://yourdomain.com${primaryImage.url.startsWith("/") ? "" : "/"}${
        primaryImage.url
      }`
    : "https://yourdomain.com/placeholder-product.jpg";

  const absoluteUrl = `https://yourdomain.com/products/${product.slug}`;

  // Enhanced structured data with BreadcrumbList
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.metaDescription ||
      product.shortDescription ||
      product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "E-commerce Store",
    },
    category: product.category.name,
    image: primaryImage ? primaryImage.url : "",
    offers: {
      "@type": "Offer",
      price: displayPrice,
      priceCurrency: "USD",
      availability: product.isActive
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url: absoluteUrl,
      seller: {
        "@type": "Organization",
        name: "E-commerce Store",
      },
      ...(product.isOnSale && {
        priceSpecification: {
          "@type": "PriceSpecification",
          price: displayPrice,
          priceCurrency: "USD",
          valueAddedTaxIncluded: false,
        },
      }),
    },
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
      review: product.reviews.slice(0, 3).map((review) => ({
        "@type": "Review",
        author: {
          "@type": "Person",
          name: review.user.name,
        },
        reviewRating: {
          "@type": "Rating",
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1,
        },
        reviewBody: review.comment || "",
        datePublished: review.createdAt.toISOString(),
      })),
    }),
    ...(product.weight && {
      weight: {
        "@type": "QuantitativeValue",
        value: Number(product.weight),
        unitCode: "LBR", // pounds
      },
    }),
    ...(product.dimensions && {
      additionalProperty: {
        "@type": "PropertyValue",
        name: "dimensions",
        value: product.dimensions,
      },
    }),
  };

  // Breadcrumb structured data
  const breadcrumbData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://yourdomain.com",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Products",
        item: "https://yourdomain.com/products",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.category.name,
        item: `https://yourdomain.com/categories/${product.category.slug}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: product.name,
        item: absoluteUrl,
      },
    ],
  };

  // FAQ Schema for Voice Search and Featured Snippets
  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `What is the price of ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `The ${product.name} is priced at $${displayPrice}. ${
            product.isOnSale
              ? `It's currently on sale from $${originalPrice}.`
              : ""
          }`,
        },
      },
      {
        "@type": "Question",
        name: `Is ${product.name} available in stock?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: product.isActive
            ? `Yes, ${product.name} is currently in stock and available for immediate purchase.`
            : `Currently, ${product.name} is out of stock. Please check back later or contact us for availability updates.`,
        },
      },
      {
        "@type": "Question",
        name: `What are the shipping options for ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We offer free standard shipping on orders over $50. Express shipping is available for $9.99 and delivers within 2-3 business days. International shipping is also available.`,
        },
      },
      {
        "@type": "Question",
        name: `What is the return policy for ${product.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `We offer a 30-day return policy for ${product.name}. Products must be unused and in original packaging. Contact our customer service team to initiate a return.`,
        },
      },
    ],
  };

  // How-to Schema for product usage
  const howToData = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to Care for Your ${product.name}`,
    description: `Learn how to properly care for and maintain your ${product.name} to ensure it lasts for years to come.`,
    step: [
      {
        "@type": "HowToStep",
        name: "Washing Instructions",
        text: "Follow the care label instructions. Generally, wash in cold water and tumble dry on low heat.",
      },
      {
        "@type": "HowToStep",
        name: "Storage",
        text: "Store in a cool, dry place away from direct sunlight to prevent fading.",
      },
      {
        "@type": "HowToStep",
        name: "Maintenance",
        text: "Regular maintenance will help preserve the quality and appearance of your product.",
      },
    ],
  };

  // Generate meta title and description with better optimization
  const metaTitle =
    product.metaTitle ||
    `${product.name} - ${product.category.name} | E-commerce Store`;
  const metaDescription =
    product.metaDescription ||
    (product.shortDescription || product.description).substring(0, 155) + "...";

  // Generate keywords from tags and category
  const keywords = [
    product.name,
    product.category.name,
    ...product.tags,
    "online shopping",
    "e-commerce",
    "buy online",
    "free shipping",
    "best price",
  ].join(", ");

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Primary Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />

        {/* Language and Region */}
        <meta name="language" content="English" />
        <meta name="geo.region" content="US" />
        <meta name="geo.placename" content="United States" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta
          property="og:image:alt"
          content={primaryImage?.alt || product.name}
        />
        <meta property="og:url" content={absoluteUrl} />
        <meta property="og:site_name" content="E-commerce Store" />
        <meta property="og:locale" content="en_US" />

        {/* Product-specific Open Graph tags */}
        <meta
          property="product:price:amount"
          content={displayPrice.toString()}
        />
        <meta property="product:price:currency" content="USD" />
        {product.isOnSale && (
          <>
            <meta
              property="product:original_price:amount"
              content={originalPrice.toString()}
            />
            <meta property="product:original_price:currency" content="USD" />
          </>
        )}
        <meta
          property="product:availability"
          content={product.isActive ? "in stock" : "out of stock"}
        />
        {product.sku && <meta property="product:sku" content={product.sku} />}

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta
          name="twitter:image:alt"
          content={primaryImage?.alt || product.name}
        />
        <meta name="twitter:site" content="@yourstore" />
        <meta name="twitter:creator" content="@yourstore" />

        {/* WhatsApp specific meta tags */}
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:type" content="image/jpeg" />

        {/* Additional SEO Meta Tags */}
        <meta
          name="robots"
          content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1"
        />
        <meta name="author" content="E-commerce Store" />
        <meta name="copyright" content="E-commerce Store" />
        <meta name="distribution" content="global" />
        <meta name="rating" content="general" />
        <meta name="revisit-after" content="7 days" />
        <meta name="coverage" content="Worldwide" />
        <meta name="target" content="all" />
        <meta name="HandheldFriendly" content="true" />
        <meta name="format-detection" content="telephone=no" />

        {/* Canonical and Alternate URLs */}
        <link rel="canonical" href={absoluteUrl} />
        <link rel="alternate" hrefLang="en" href={absoluteUrl} />
        <link rel="alternate" hrefLang="x-default" href={absoluteUrl} />

        {/* Product-specific meta tags */}
        <meta name="product:price:amount" content={displayPrice.toString()} />
        <meta name="product:price:currency" content="USD" />
        <meta
          name="product:availability"
          content={product.isActive ? "in stock" : "out of stock"}
        />
        {product.sku && <meta name="product:sku" content={product.sku} />}

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData),
          }}
        />

        {/* Breadcrumb Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbData),
          }}
        />

        {/* FAQ Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(faqData),
          }}
        />

        {/* How-to Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(howToData),
          }}
        />

        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/static/css/main.css" />

        {/* Preload critical resources */}
        <link rel="preload" href="/static/css/main.css" as="style" />
        <link rel="preload" href="/static/js/main.js" as="script" />
        {primaryImage && (
          <link rel="preload" href={primaryImage.url} as="image" />
        )}

        {/* Service Worker for offline functionality */}
        <script>
          {`
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js');
              });
            }
          `}
        </script>
      </head>
      <body>
        <div id="root">
          {/* Header */}
          <header className="bg-white shadow-sm border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between items-center h-16">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-gray-900">
                    <a href="/" className="hover:text-blue-600">
                      E-commerce Store
                    </a>
                  </h1>
                </div>
                <nav className="hidden md:flex space-x-8">
                  <a href="/" className="text-gray-900 hover:text-gray-600">
                    Home
                  </a>
                  <a
                    href="/products"
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Products
                  </a>
                  <a
                    href="/categories"
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Categories
                  </a>
                  <a
                    href="/about"
                    className="text-gray-900 hover:text-gray-600"
                  >
                    About
                  </a>
                  <a
                    href="/contact"
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Contact
                  </a>
                </nav>
                <div className="flex items-center space-x-4">
                  <a href="/cart" className="text-gray-900 hover:text-gray-600">
                    Cart
                  </a>
                  <a
                    href="/wishlist"
                    className="text-gray-900 hover:text-gray-600"
                  >
                    Wishlist
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Breadcrumb Navigation */}
          <nav className="bg-gray-50 border-b" aria-label="Breadcrumb">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-blue-600">
                    Home
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <a href="/products" className="hover:text-blue-600">
                    Products
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <a
                    href={`/categories/${product.category.slug}`}
                    className="hover:text-blue-600"
                  >
                    {product.category.name}
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">{product.name}</li>
              </ol>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <article itemScope itemType="https://schema.org/Product">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Product Images */}
                <div className="space-y-4">
                  <div className="aspect-w-1 aspect-h-1 w-full">
                    <img
                      src={primaryImage?.url || "/placeholder-product.jpg"}
                      alt={primaryImage?.alt || product.name}
                      className="w-full h-full object-cover rounded-lg"
                      itemProp="image"
                      loading="lazy"
                    />
                  </div>
                  {product.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {product.images.slice(0, 4).map((image) => (
                        <img
                          key={image.id}
                          src={image.url}
                          alt={image.alt || product.name}
                          className="w-full h-24 object-cover rounded-lg cursor-pointer"
                          loading="lazy"
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Product Details */}
                <div className="space-y-6">
                  <div>
                    <h1
                      className="text-3xl font-bold text-gray-900 mb-2"
                      itemProp="name"
                    >
                      {product.name}
                    </h1>
                    <p className="text-gray-600 mb-4" itemProp="category">
                      Category: {product.category.name}
                    </p>

                    {/* Price Information */}
                    <div className="flex items-center space-x-4 mb-4">
                      <span
                        className="text-3xl font-bold text-gray-900"
                        itemProp="offers"
                        itemScope
                        itemType="https://schema.org/Offer"
                      >
                        <meta itemProp="priceCurrency" content="USD" />
                        <meta
                          itemProp="price"
                          content={displayPrice.toString()}
                        />
                        ${displayPrice}
                      </span>
                      {product.isOnSale && (
                        <span className="text-xl text-gray-500 line-through">
                          ${originalPrice}
                        </span>
                      )}
                    </div>

                    {/* SKU */}
                    {product.sku && (
                      <p className="text-sm text-gray-600 mb-4">
                        SKU: <span itemProp="sku">{product.sku}</span>
                      </p>
                    )}

                    {/* Description */}
                    <div className="prose max-w-none mb-6">
                      <p itemProp="description">{product.description}</p>
                    </div>

                    {/* Tags */}
                    {product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {product.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Add to Cart Button */}
                    <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                  </div>

                  {/* Reviews */}
                  {reviewCount > 0 && (
                    <div className="border-t pt-6">
                      <div className="flex items-center space-x-2 mb-4">
                        <div
                          itemProp="aggregateRating"
                          itemScope
                          itemType="https://schema.org/AggregateRating"
                        >
                          <meta
                            itemProp="ratingValue"
                            content={averageRating.toString()}
                          />
                          <meta
                            itemProp="reviewCount"
                            content={reviewCount.toString()}
                          />
                          <meta itemProp="bestRating" content="5" />
                          <meta itemProp="worstRating" content="1" />
                          <span className="text-lg font-semibold text-gray-900">
                            {averageRating.toFixed(1)}/5
                          </span>
                        </div>
                        <span className="text-gray-600">
                          ({reviewCount} reviews)
                        </span>
                      </div>

                      {/* Review List */}
                      <div className="space-y-4">
                        {product.reviews.slice(0, 3).map((review) => (
                          <div
                            key={review.id}
                            itemProp="review"
                            itemScope
                            itemType="https://schema.org/Review"
                          >
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < review.rating
                                        ? "text-yellow-400"
                                        : "text-gray-300"
                                    }`}
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                ))}
                              </div>
                              <span
                                itemProp="author"
                                itemScope
                                itemType="https://schema.org/Person"
                              >
                                <span itemProp="name" className="font-semibold">
                                  {review.user.name}
                                </span>
                              </span>
                            </div>
                            {review.comment && (
                              <p
                                itemProp="reviewBody"
                                className="text-gray-700"
                              >
                                {review.comment}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* FAQ Section for Voice Search */}
              <section className="mt-16 border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-semibold text-gray-900 cursor-pointer">
                      What is the price of {product.name}?
                    </summary>
                    <p className="mt-2 text-gray-700">
                      The {product.name} is priced at ${displayPrice}.{" "}
                      {product.isOnSale
                        ? `It's currently on sale from $${originalPrice}.`
                        : ""}
                    </p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-semibold text-gray-900 cursor-pointer">
                      Is {product.name} available in stock?
                    </summary>
                    <p className="mt-2 text-gray-700">
                      {product.isActive
                        ? `Yes, ${product.name} is currently in stock and available for immediate purchase.`
                        : `Currently, ${product.name} is out of stock. Please check back later or contact us for availability updates.`}
                    </p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-semibold text-gray-900 cursor-pointer">
                      What are the shipping options?
                    </summary>
                    <p className="mt-2 text-gray-700">
                      We offer free standard shipping on orders over $50.
                      Express shipping is available for $9.99 and delivers
                      within 2-3 business days. International shipping is also
                      available.
                    </p>
                  </details>
                  <details className="bg-gray-50 rounded-lg p-4">
                    <summary className="font-semibold text-gray-900 cursor-pointer">
                      What is the return policy?
                    </summary>
                    <p className="mt-2 text-gray-700">
                      We offer a 30-day return policy. Products must be unused
                      and in original packaging. Contact our customer service
                      team to initiate a return.
                    </p>
                  </details>
                </div>
              </section>

              {/* Related Products */}
              {relatedProducts.length > 0 && (
                <section className="mt-16 border-t pt-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">
                    Related Products
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {relatedProducts.slice(0, 4).map((relatedProduct) => (
                      <div
                        key={relatedProduct.id}
                        className="bg-white rounded-lg shadow-sm border"
                      >
                        <img
                          src={
                            relatedProduct.images[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={
                            relatedProduct.images[0]?.alt || relatedProduct.name
                          }
                          className="w-full h-48 object-cover rounded-t-lg"
                          loading="lazy"
                        />
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-2">
                            <a
                              href={`/products/${relatedProduct.slug}`}
                              className="hover:text-blue-600"
                            >
                              {relatedProduct.name}
                            </a>
                          </h3>
                          <p className="text-lg font-bold text-gray-900">
                            ${Number(relatedProduct.price)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Product Care Instructions */}
              <section className="mt-16 border-t pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  How to Care for Your {product.name}
                </h2>
                <div className="bg-blue-50 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Washing Instructions
                      </h3>
                      <p className="text-gray-700">
                        Follow the care label instructions. Generally, wash in
                        cold water and tumble dry on low heat.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Storage
                      </h3>
                      <p className="text-gray-700">
                        Store in a cool, dry place away from direct sunlight to
                        prevent fading.
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Maintenance
                      </h3>
                      <p className="text-gray-700">
                        Regular maintenance will help preserve the quality and
                        appearance of your product.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </article>
          </main>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12 mt-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">About Us</h3>
                  <p className="text-gray-400">
                    We provide high-quality products with excellent customer
                    service and fast shipping.
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/products"
                        className="text-gray-400 hover:text-white"
                      >
                        Products
                      </a>
                    </li>
                    <li>
                      <a
                        href="/categories"
                        className="text-gray-400 hover:text-white"
                      >
                        Categories
                      </a>
                    </li>
                    <li>
                      <a
                        href="/about"
                        className="text-gray-400 hover:text-white"
                      >
                        About
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact"
                        className="text-gray-400 hover:text-white"
                      >
                        Contact
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Customer Service
                  </h3>
                  <ul className="space-y-2">
                    <li>
                      <a
                        href="/shipping"
                        className="text-gray-400 hover:text-white"
                      >
                        Shipping Info
                      </a>
                    </li>
                    <li>
                      <a
                        href="/returns"
                        className="text-gray-400 hover:text-white"
                      >
                        Returns
                      </a>
                    </li>
                    <li>
                      <a href="/faq" className="text-gray-400 hover:text-white">
                        FAQ
                      </a>
                    </li>
                    <li>
                      <a
                        href="/support"
                        className="text-gray-400 hover:text-white"
                      >
                        Support
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Connect With Us
                  </h3>
                  <div className="flex space-x-4">
                    <a href="#" className="text-gray-400 hover:text-white">
                      Facebook
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Twitter
                    </a>
                    <a href="#" className="text-gray-400 hover:text-white">
                      Instagram
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                <p className="text-gray-400">
                  © 2024 E-commerce Store. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
        <script src="/static/js/main.js" defer></script>
      </body>
    </html>
  );
}
