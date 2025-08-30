import React from "react";

interface AboutServerProps {
  // Add any props if needed for dynamic content
}

export default function AboutServer({}: AboutServerProps) {
  const metaTitle = "About Us - E-commerce Store";
  const metaDescription =
    "Learn about our e-commerce store's mission, values, and commitment to providing high-quality products with excellent customer service. Discover our story and what makes us different.";
  const keywords =
    "about us, e-commerce, online store, company, mission, values, customer service";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "E-commerce Store",
    description:
      "Your one-stop shop for quality products with exceptional customer service and fast shipping.",
    url: "https://yourdomain.com",
    logo: "https://yourdomain.com/logo.png",
    sameAs: [
      "https://facebook.com/yourstore",
      "https://twitter.com/yourstore",
      "https://instagram.com/yourstore",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+1-555-123-4567",
      contactType: "customer service",
      email: "support@yourdomain.com",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "123 Commerce St",
      addressLocality: "Business City",
      addressRegion: "BC",
      postalCode: "12345",
      addressCountry: "US",
    },
  };

  const absoluteUrl = "https://yourdomain.com/about";
  const absoluteImageUrl = "https://yourdomain.com/logo.png";

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={keywords} />

        {/* Open Graph Meta Tags */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={metaTitle} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={absoluteUrl} />
        <meta property="og:site_name" content="E-commerce Store" />
        <meta property="og:image" content={absoluteImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="E-commerce Store About Us" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content="E-commerce Store About Us" />
        <meta name="twitter:site" content="@yourstore" />
        <meta name="twitter:creator" content="@yourstore" />

        {/* WhatsApp-specific Meta Tags */}
        <meta property="og:image:secure_url" content={absoluteImageUrl} />
        <meta property="og:image:type" content="image/png" />

        {/* SEO Meta Tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="E-commerce Store" />
        <link rel="canonical" href={absoluteUrl} />

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

          <nav className="bg-gray-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
              <ol className="flex items-center space-x-2 text-sm text-gray-600">
                <li>
                  <a href="/" className="hover:text-blue-600">
                    Home
                  </a>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-gray-900 font-medium">About</li>
              </ol>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                About Us
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Learn about our mission, values, and commitment to providing you
                with the best shopping experience.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Our Story
                </h2>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Founded with a passion for quality and customer satisfaction,
                  our e-commerce store has been serving customers with
                  exceptional products and outstanding service since our
                  establishment. We believe that every customer deserves the
                  best shopping experience possible.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4">
                  Our journey began with a simple mission: to provide
                  high-quality products at competitive prices while maintaining
                  the highest standards of customer service. Today, we continue
                  to uphold these values as we grow and expand our product
                  offerings.
                </p>
                <p className="text-gray-700 leading-relaxed">
                  We take pride in our carefully curated selection of products,
                  our fast and reliable shipping, and our dedicated customer
                  support team that's always ready to help you find exactly what
                  you're looking for.
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Why Choose Us?
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Quality Products
                      </h4>
                      <p className="text-gray-600">
                        Carefully selected products that meet our high standards
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Fast Shipping
                      </h4>
                      <p className="text-gray-600">
                        Quick and reliable delivery to your doorstep
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Excellent Service
                      </h4>
                      <p className="text-gray-600">
                        Dedicated customer support team ready to help
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-3 mt-1">
                      <svg
                        className="w-4 h-4 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Secure Shopping
                      </h4>
                      <p className="text-gray-600">
                        Safe and secure payment processing
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-8 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Our Values
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Transparency
                  </h3>
                  <p className="text-gray-600">
                    We believe in being open and honest with our customers about
                    our products and services.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Quality
                  </h3>
                  <p className="text-gray-600">
                    We never compromise on quality and always strive to offer
                    the best products available.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Customer First
                  </h3>
                  <p className="text-gray-600">
                    Our customers are at the heart of everything we do, and
                    their satisfaction is our top priority.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Ready to Shop?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Experience the difference that quality products and exceptional
                service can make. Start shopping today and discover why
                customers choose us.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/products"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  Browse Products
                </a>
                <a
                  href="/contact"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Contact Us
                </a>
              </div>
            </div>
          </main>

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
