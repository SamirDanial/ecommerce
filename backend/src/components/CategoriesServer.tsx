import React from "react";

interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  sortOrder: number;
  _count: {
    products: number;
  };
}

interface CategoriesServerProps {
  categories: Category[];
}

export default function CategoriesServer({
  categories,
}: CategoriesServerProps) {
  // Generate meta title and description
  const metaTitle = "Product Categories - E-commerce Store";
  const metaDescription =
    "Browse our product categories to find exactly what you're looking for. From fashion to electronics, we have everything you need with fast shipping and excellent customer service.";

  // Generate absolute URLs for social media
  const absoluteUrl = "https://yourdomain.com/categories";
  const absoluteImageUrl = "https://yourdomain.com/logo.png"; // Replace with your actual logo

  // Generate structured data
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Product Categories",
    description: metaDescription,
    numberOfItems: categories.length,
    itemListElement: categories.map((category, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Category",
        name: category.name,
        description: category.description || `${category.name} products`,
        url: `https://yourdomain.com/categories/${category.slug}`,
        image: category.image,
        numberOfItems: category._count.products,
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
          content="product categories, e-commerce, online shopping, browse products"
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
        <meta property="og:image:alt" content="E-commerce Store Categories" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content="E-commerce Store Categories" />
        <meta name="twitter:site" content="@yourstore" />
        <meta name="twitter:creator" content="@yourstore" />

        {/* WhatsApp specific meta tags */}
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:type" content="image/png" />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="E-commerce Store" />
        <link rel="canonical" href="https://yourdomain.com/categories" />

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
                <li className="text-gray-900 font-medium">Categories</li>
              </ol>
            </div>
          </nav>

          {/* Main Content */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Page Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Product Categories
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Browse our product categories to find exactly what you're
                looking for. From fashion to electronics, we have everything you
                need.
              </p>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((category) => (
                <a
                  key={category.id}
                  href={`/categories/${category.slug}`}
                  className="group block"
                >
                  <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={category.image || "/placeholder-category.jpg"}
                        alt={category.name}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {category._count.products} product
                          {category._count.products !== 1 ? "s" : ""}
                        </span>
                        <span className="text-blue-600 font-medium group-hover:text-blue-700 transition-colors">
                          Browse →
                        </span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Call to Action */}
            <div className="text-center mt-16">
              <div className="bg-gray-50 rounded-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Can't find what you're looking for?
                </h2>
                <p className="text-gray-600 mb-6">
                  Browse all our products or use our search feature to find
                  exactly what you need.
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="/products"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Browse All Products
                  </a>
                  <a
                    href="/products"
                    className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                  >
                    Search Products
                  </a>
                </div>
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
