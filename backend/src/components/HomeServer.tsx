import React from "react";

interface Product {
  id: number;
  name: string;
  price: any; // Decimal from Prisma
  description: string;
  images: Array<{ url: string; alt: string | null }>;
  category?: { name: string };
}

interface HomeServerProps {
  featuredProducts: Product[];
  categories: Array<{ id: number; name: string; image: string | null }>;
}

export default function HomeServer({
  featuredProducts,
  categories,
}: HomeServerProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Primary Meta Tags */}
        <title>
          E-commerce Store - Your One-Stop Shop for Quality Products
        </title>
        <meta
          name="description"
          content="Discover amazing products at our e-commerce store. Shop the latest trends with fast shipping and excellent customer service."
        />
        <meta
          name="keywords"
          content="e-commerce, online shopping, products, fashion, electronics"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="E-commerce Store - Your One-Stop Shop for Quality Products"
        />
        <meta
          property="og:description"
          content="Discover amazing products at our e-commerce store. Shop the latest trends with fast shipping and excellent customer service."
        />
        <meta property="og:url" content="https://yourdomain.com" />
        <meta property="og:site_name" content="E-commerce Store" />
        <meta property="og:image" content="https://yourdomain.com/logo.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="E-commerce Store Logo" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Cards */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="E-commerce Store - Your One-Stop Shop for Quality Products"
        />
        <meta
          name="twitter:description"
          content="Discover amazing products at our e-commerce store. Shop the latest trends with fast shipping and excellent customer service."
        />
        <meta name="twitter:image" content="https://yourdomain.com/logo.png" />
        <meta name="twitter:image:alt" content="E-commerce Store Logo" />
        <meta name="twitter:site" content="@yourstore" />
        <meta name="twitter:creator" content="@yourstore" />

        {/* WhatsApp specific meta tags */}
        <meta
          property="og:image:secure_url"
          content="https://yourdomain.com/logo.png"
        />
        <meta property="og:image:type" content="image/png" />

        {/* Additional SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="E-commerce Store" />
        <link rel="canonical" href="https://yourdomain.com" />
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
                    E-commerce Store
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

          {/* Hero Section */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-4xl md:text-6xl font-bold mb-6">
                Welcome to Our Store
              </h2>
              <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
                Discover amazing products with exceptional quality and
                unbeatable prices
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/products"
                  className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Shop Now
                </a>
                <a
                  href="/categories"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
                >
                  Browse Categories
                </a>
              </div>
            </div>
          </section>

          {/* Featured Products */}
          <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Featured Products
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {featuredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <div className="aspect-w-1 aspect-h-1 w-full">
                      <img
                        src={
                          product.images[0]?.url || "/placeholder-product.jpg"
                        }
                        alt={product.images[0]?.alt || product.name}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        <a
                          href={`/products/${product.id}`}
                          className="hover:text-blue-600"
                        >
                          {product.name}
                        </a>
                      </h3>
                      {product.category && (
                        <p className="text-sm text-gray-600 mb-2">
                          {product.category.name}
                        </p>
                      )}
                      <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">
                          ${Number(product.price).toFixed(2)}
                        </span>
                        <a
                          href={`/products/${product.id}`}
                          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                        >
                          View Details
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-12">
                <a
                  href="/products"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View All Products
                </a>
              </div>
            </div>
          </section>

          {/* Categories */}
          <section className="py-16">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
                Shop by Category
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((category) => (
                  <a
                    key={category.id}
                    href={`/categories/${category.id}`}
                    className="group block"
                  >
                    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="aspect-w-1 aspect-h-1 w-full">
                        <img
                          src={category.image || "/placeholder-category.jpg"}
                          alt={category.name}
                          className="w-full h-32 object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-4 text-center">
                        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {category.name}
                        </h3>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>

          {/* Footer */}
          <footer className="bg-gray-900 text-white py-12">
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
