import React from "react";

interface ContactServerProps {
  // Add any props if needed for dynamic content
}

export default function ContactServer({}: ContactServerProps) {
  const metaTitle = "Contact Us - E-commerce Store";
  const metaDescription =
    "Get in touch with our customer service team. We're here to help with any questions about our products, orders, or general inquiries. Contact us today for excellent support.";
  const keywords =
    "contact us, customer service, support, help, inquiry, e-commerce, online store";

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Us - E-commerce Store",
    description:
      "Get in touch with our customer service team for support and inquiries.",
    url: "https://yourdomain.com/contact",
    mainEntity: {
      "@type": "Organization",
      name: "E-commerce Store",
      contactPoint: [
        {
          "@type": "ContactPoint",
          telephone: "+1-555-123-4567",
          contactType: "customer service",
          email: "support@yourdomain.com",
          availableLanguage: "English",
        },
        {
          "@type": "ContactPoint",
          telephone: "+1-555-123-4568",
          contactType: "sales",
          email: "sales@yourdomain.com",
          availableLanguage: "English",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "123 Commerce St",
        addressLocality: "Business City",
        addressRegion: "BC",
        postalCode: "12345",
        addressCountry: "US",
      },
    },
  };

  const absoluteUrl = "https://yourdomain.com/contact";
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
        <meta property="og:image:alt" content="E-commerce Store Contact Us" />
        <meta property="og:locale" content="en_US" />

        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={absoluteImageUrl} />
        <meta name="twitter:image:alt" content="E-commerce Store Contact Us" />
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
                <li className="text-gray-900 font-medium">Contact</li>
              </ol>
            </div>
          </nav>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Contact Us
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We're here to help! Get in touch with our customer service team
                for any questions or support you need.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">
                  Get In Touch
                </h2>
                <p className="text-gray-700 leading-relaxed mb-8">
                  Have a question about our products, need help with an order,
                  or want to provide feedback? Our dedicated customer service
                  team is here to assist you with any inquiries.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                        <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Email Support
                      </h3>
                      <p className="text-gray-600 mb-2">
                        support@yourdomain.com
                      </p>
                      <p className="text-sm text-gray-500">
                        We typically respond within 24 hours
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Phone Support
                      </h3>
                      <p className="text-gray-600 mb-2">+1 (555) 123-4567</p>
                      <p className="text-sm text-gray-500">
                        Monday - Friday, 9 AM - 6 PM EST
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mr-4">
                      <svg
                        className="w-6 h-6 text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        Office Address
                      </h3>
                      <p className="text-gray-600 mb-2">
                        123 Commerce Street
                        <br />
                        Business City, BC 12345
                      </p>
                      <p className="text-sm text-gray-500">
                        Visit us during business hours
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Contact Form
                </h3>
                <form className="space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="subject"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Subject
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="order">Order Support</option>
                      <option value="product">Product Question</option>
                      <option value="technical">Technical Support</option>
                      <option value="feedback">Feedback</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Tell us how we can help you..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Send Message
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-8 mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
                Frequently Asked Questions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    How can I track my order?
                  </h3>
                  <p className="text-gray-600">
                    You can track your order by logging into your account and
                    visiting the "My Orders" section. You'll also receive email
                    updates with tracking information.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    What is your return policy?
                  </h3>
                  <p className="text-gray-600">
                    We offer a 30-day return policy for most items. Products
                    must be unused and in original packaging. Contact our
                    support team to initiate a return.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Do you ship internationally?
                  </h3>
                  <p className="text-gray-600">
                    Yes, we ship to most countries worldwide. Shipping costs and
                    delivery times vary by location. Check our shipping page for
                    detailed information.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    How secure is my payment?
                  </h3>
                  <p className="text-gray-600">
                    We use industry-standard SSL encryption to protect your
                    payment information. All transactions are processed securely
                    through trusted payment gateways.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Still Need Help?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Can't find what you're looking for? Our customer service team is
                always ready to assist you with any questions or concerns you
                may have.
              </p>
              <div className="flex justify-center space-x-4">
                <a
                  href="/faq"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                >
                  View FAQ
                </a>
                <a
                  href="/products"
                  className="border-2 border-blue-600 text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-colors"
                >
                  Browse Products
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
