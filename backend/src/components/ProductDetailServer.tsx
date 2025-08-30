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
}

export default function ProductDetailServer({
  product,
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

  // Generate structured data for rich snippets
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
      url: `https://yourdomain.com/products/${product.slug}`,
    },
    ...(product.isOnSale && {
      priceSpecification: {
        "@type": "PriceSpecification",
        price: displayPrice,
        priceCurrency: "USD",
        valueAddedTaxIncluded: false,
      },
    }),
    ...(reviewCount > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: averageRating,
        reviewCount: reviewCount,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // Generate meta title and description
  const metaTitle =
    product.metaTitle ||
    `${product.name} - ${product.category.name} | E-commerce Store`;
  const metaDescription =
    product.metaDescription ||
    (product.shortDescription || product.description).substring(0, 160);

  // Generate absolute URLs for social media
  const absoluteImageUrl = primaryImage?.url
    ? `https://yourdomain.com${primaryImage.url.startsWith("/") ? "" : "/"}${
        primaryImage.url
      }`
    : "https://yourdomain.com/placeholder-product.jpg";

  const absoluteUrl = `https://yourdomain.com/products/${product.slug}`;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Primary Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={product.tags.join(", ")} />

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
        <meta name="robots" content="index, follow" />
        <meta name="author" content="E-commerce Store" />
        <link
          rel="canonical"
          href={`https://yourdomain.com/products/${product.slug}`}
        />

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

        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="/static/css/main.css" />
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

          {/* Breadcrumb */}
          <nav className="bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-blue-600">
                    Home
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                  <a href="/categories" className="hover:text-blue-600">
                    Categories
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

          {/* Product Detail Section */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Product Images */}
              <div className="space-y-4">
                <div className="aspect-w-1 aspect-h-1 w-full">
                  <img
                    src={primaryImage?.url || "/placeholder-product.jpg"}
                    alt={primaryImage?.alt || product.name}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                </div>
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((image) => (
                      <img
                        key={image.id}
                        src={image.url}
                        alt={image.alt || product.name}
                        className="w-full h-24 object-cover rounded-md cursor-pointer hover:opacity-75"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {product.name}
                  </h1>
                  <p className="text-sm text-gray-600 mb-4">
                    {product.category.name}
                  </p>

                  {/* Price */}
                  <div className="flex items-center space-x-3 mb-4">
                    <span className="text-3xl font-bold text-gray-900">
                      ${displayPrice.toFixed(2)}
                    </span>
                    {product.isOnSale && originalPrice > displayPrice && (
                      <span className="text-xl text-gray-500 line-through">
                        ${originalPrice.toFixed(2)}
                      </span>
                    )}
                    {product.isOnSale && (
                      <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm font-medium">
                        Sale
                      </span>
                    )}
                  </div>

                  {/* Rating */}
                  {reviewCount > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-5 h-5 ${
                              star <= averageRating
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
                      <span className="text-sm text-gray-600">
                        {averageRating.toFixed(1)} ({reviewCount} reviews)
                      </span>
                    </div>
                  )}

                  {/* Description */}
                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700 leading-relaxed">
                      {product.shortDescription || product.description}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="border-t border-gray-200 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Product Details
                    </h3>
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                      {product.sku && (
                        <>
                          <dt className="text-sm font-medium text-gray-500">
                            SKU
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {product.sku}
                          </dd>
                        </>
                      )}
                      {product.weight && (
                        <>
                          <dt className="text-sm font-medium text-gray-500">
                            Weight
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {Number(product.weight).toFixed(2)} lbs
                          </dd>
                        </>
                      )}
                      {product.dimensions && (
                        <>
                          <dt className="text-sm font-medium text-gray-500">
                            Dimensions
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {product.dimensions}
                          </dd>
                        </>
                      )}
                      {product.tags.length > 0 && (
                        <>
                          <dt className="text-sm font-medium text-gray-500">
                            Tags
                          </dt>
                          <dd className="text-sm text-gray-900">
                            <div className="flex flex-wrap gap-2">
                              {product.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </dd>
                        </>
                      )}
                    </dl>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-4 mt-8">
                    <button className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Add to Cart
                    </button>
                    <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
                      Add to Wishlist
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            {reviewCount > 0 && (
              <section className="mt-16 border-t border-gray-200 pt-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-8">
                  Customer Reviews
                </h2>
                <div className="space-y-6">
                  {product.reviews.slice(0, 3).map((review) => (
                    <div
                      key={review.id}
                      className="border border-gray-200 rounded-lg p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= review.rating
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
                          <span className="text-sm text-gray-600">
                            {review.user.name}
                          </span>
                          {review.isVerified && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {review.title && (
                        <h3 className="font-semibold text-gray-900 mb-2">
                          {review.title}
                        </h3>
                      )}
                      <p className="text-gray-700">{review.comment}</p>
                    </div>
                  ))}
                  {reviewCount > 3 && (
                    <div className="text-center">
                      <a
                        href={`/products/${product.slug}#reviews`}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all {reviewCount} reviews
                      </a>
                    </div>
                  )}
                </div>
              </section>
            )}
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

        {/* Client-side hydration script */}
        <script src="/static/js/main.js" defer></script>
      </body>
    </html>
  );
}
