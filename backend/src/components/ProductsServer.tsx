import React from "react";

interface ProductImage {
  id: number;
  url: string;
  alt: string | null;
  isPrimary: boolean;
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
  isFeatured: boolean;
  slug: string;
  category: Category;
  images: ProductImage[];
  _count?: {
    reviews: number;
  };
}

interface ProductsServerProps {
  products: Product[];
  categories: Category[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  selectedCategory?: string;
  searchQuery?: string;
  sortBy?: string;
}

export default function ProductsServer({
  products,
  categories,
  totalProducts,
  currentPage,
  totalPages,
  selectedCategory,
  searchQuery,
  sortBy,
}: ProductsServerProps) {
  // Generate meta title and description
  const metaTitle = searchQuery
    ? `Search Results for "${searchQuery}" - Products | E-commerce Store`
    : selectedCategory
    ? `${selectedCategory} - Products | E-commerce Store`
    : "All Products - E-commerce Store";

  const metaDescription = searchQuery
    ? `Find the best products matching "${searchQuery}". Browse our collection of high-quality items with fast shipping and excellent customer service.`
    : selectedCategory
    ? `Discover amazing ${selectedCategory.toLowerCase()} products. Shop the latest trends with fast shipping and excellent customer service.`
    : "Discover amazing products at our e-commerce store. Shop the latest trends with fast shipping and excellent customer service.";

  // Generate absolute URLs for social media
  const absoluteUrl = searchQuery
    ? `https://yourdomain.com/products?search=${encodeURIComponent(
        searchQuery
      )}`
    : selectedCategory
    ? `https://yourdomain.com/products?category=${encodeURIComponent(
        selectedCategory
      )}`
    : "https://yourdomain.com/products";

  const absoluteImageUrl = "https://yourdomain.com/logo.png"; // Replace with your actual logo

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: metaTitle,
    description: metaDescription,
    numberOfItems: totalProducts,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: (currentPage - 1) * 12 + index + 1,
      item: {
        "@type": "Product",
        name: product.name,
        description: product.shortDescription || product.description,
        url: `https://yourdomain.com/products/${product.slug}`,
        image:
          product.images.find((img) => img.isPrimary)?.url ||
          product.images[0]?.url,
        category: product.category.name,
        offers: {
          "@type": "Offer",
          price: Number(
            product.isOnSale && product.salePrice
              ? product.salePrice
              : product.price
          ),
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
        },
      },
    })),
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />

        {/* Primary Meta Tags */}
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta
          name="keywords"
          content="e-commerce, online shopping, products, fashion, electronics"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={absoluteUrl} />
        <meta property="og:site_name" content="E-commerce Store" />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="E-commerce Store Products" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content="E-commerce Store Products" />
        <meta name="twitter:site" content="@yourstore" />
        <meta name="twitter:creator" content="@yourstore" />

        {/* WhatsApp specific meta tags */}
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:type" content="image/png" />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="E-commerce Store" />
        <link rel="canonical" href="https://yourdomain.com/products" />

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
                <li className="text-gray-900 font-medium">Products</li>
                {selectedCategory && (
                  <>
                    <li className="text-gray-400">/</li>
                    <li className="text-gray-900 font-medium">
                      {selectedCategory}
                    </li>
                  </>
                )}
                {searchQuery && (
                  <>
                    <li className="text-gray-400">/</li>
                    <li className="text-gray-900 font-medium">
                      Search: "{searchQuery}"
                    </li>
                  </>
                )}
              </ol>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {searchQuery
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory
                  ? selectedCategory
                  : "All Products"}
              </h1>
              <p className="text-gray-600">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
                {selectedCategory && ` in ${selectedCategory}`}
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Filters Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Categories
                  </h2>
                  <div className="space-y-2">
                    <a
                      href="/products"
                      className={`block text-sm ${
                        !selectedCategory
                          ? "text-blue-600 font-medium"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      All Products
                    </a>
                    {categories.map((category) => (
                      <a
                        key={category.id}
                        href={`/products?category=${category.slug}`}
                        className={`block text-sm ${
                          selectedCategory === category.name
                            ? "text-blue-600 font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        {category.name}
                      </a>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 mt-6 pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Sort By
                    </h3>
                    <div className="space-y-2">
                      <a
                        href="/products?sort=name"
                        className={`block text-sm ${
                          sortBy === "name"
                            ? "text-blue-600 font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Name A-Z
                      </a>
                      <a
                        href="/products?sort=price-low"
                        className={`block text-sm ${
                          sortBy === "price-low"
                            ? "text-blue-600 font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Price: Low to High
                      </a>
                      <a
                        href="/products?sort=price-high"
                        className={`block text-sm ${
                          sortBy === "price-high"
                            ? "text-blue-600 font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Price: High to Low
                      </a>
                      <a
                        href="/products?sort=newest"
                        className={`block text-sm ${
                          sortBy === "newest"
                            ? "text-blue-600 font-medium"
                            : "text-gray-600 hover:text-gray-900"
                        }`}
                      >
                        Newest First
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Products Grid */}
              <div className="lg:col-span-3">
                {products.length > 0 ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {products.map((product) => {
                        const displayPrice =
                          product.isOnSale && product.salePrice
                            ? Number(product.salePrice)
                            : Number(product.price);

                        const originalPrice =
                          product.isOnSale && product.comparePrice
                            ? Number(product.comparePrice)
                            : Number(product.price);

                        const primaryImage =
                          product.images.find((img) => img.isPrimary) ||
                          product.images[0];

                        return (
                          <div
                            key={product.id}
                            className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                          >
                            <div className="aspect-w-1 aspect-h-1 w-full">
                              <img
                                src={
                                  primaryImage?.url ||
                                  "/placeholder-product.jpg"
                                }
                                alt={primaryImage?.alt || product.name}
                                className="w-full h-48 object-cover"
                              />
                            </div>
                            <div className="p-4">
                              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                <a
                                  href={`/products/${product.slug}`}
                                  className="hover:text-blue-600"
                                >
                                  {product.name}
                                </a>
                              </h3>
                              <p className="text-sm text-gray-600 mb-2">
                                {product.category.name}
                              </p>
                              <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                                {product.shortDescription ||
                                  product.description}
                              </p>
                              <div className="flex justify-between items-center">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xl font-bold text-gray-900">
                                    ${displayPrice.toFixed(2)}
                                  </span>
                                  {product.isOnSale &&
                                    originalPrice > displayPrice && (
                                      <span className="text-sm text-gray-500 line-through">
                                        ${originalPrice.toFixed(2)}
                                      </span>
                                    )}
                                </div>
                                <a
                                  href={`/products/${product.slug}`}
                                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                                >
                                  View Details
                                </a>
                              </div>
                              {product.isOnSale && (
                                <div className="mt-2">
                                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium">
                                    Sale
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="mt-8 flex justify-center">
                        <nav className="flex items-center space-x-2">
                          {currentPage > 1 && (
                            <a
                              href={`/products?page=${currentPage - 1}${
                                selectedCategory
                                  ? `&category=${selectedCategory}`
                                  : ""
                              }${searchQuery ? `&search=${searchQuery}` : ""}${
                                sortBy ? `&sort=${sortBy}` : ""
                              }`}
                              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Previous
                            </a>
                          )}

                          {Array.from(
                            { length: totalPages },
                            (_, i) => i + 1
                          ).map((page) => (
                            <a
                              key={page}
                              href={`/products?page=${page}${
                                selectedCategory
                                  ? `&category=${selectedCategory}`
                                  : ""
                              }${searchQuery ? `&search=${searchQuery}` : ""}${
                                sortBy ? `&sort=${sortBy}` : ""
                              }`}
                              className={`px-3 py-2 text-sm font-medium rounded-md ${
                                page === currentPage
                                  ? "bg-blue-600 text-white"
                                  : "text-gray-500 bg-white border border-gray-300 hover:bg-gray-50"
                              }`}
                            >
                              {page}
                            </a>
                          ))}

                          {currentPage < totalPages && (
                            <a
                              href={`/products?page=${currentPage + 1}${
                                selectedCategory
                                  ? `&category=${selectedCategory}`
                                  : ""
                              }${searchQuery ? `&search=${searchQuery}` : ""}${
                                sortBy ? `&sort=${sortBy}` : ""
                              }`}
                              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            >
                              Next
                            </a>
                          )}
                        </nav>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No products found
                    </h3>
                    <p className="text-gray-600">
                      {searchQuery
                        ? `No products match your search for "${searchQuery}"`
                        : "Try adjusting your filters or browse our categories."}
                    </p>
                    <div className="mt-6">
                      <a
                        href="/products"
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      >
                        Browse All Products
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
