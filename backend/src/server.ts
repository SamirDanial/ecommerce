import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { prisma } from "./lib/prisma";
import { SocketServer } from "./socket/socketServer";
import React from "react";
import { renderToStream } from "./render/renderToHTML";
import HomeServer from "./components/HomeServer";
import ProductDetailServer from "./components/ProductDetailServer";
import ProductsServer from "./components/ProductsServer";
import CategoriesServer from "./components/CategoriesServer";
import CategoryServer from "./components/CategoryServer";
import AboutServer from "./components/AboutServer";
import ContactServer from "./components/ContactServer";
import {
  generateSitemap,
  generateProductSitemap,
} from "./utils/sitemapGenerator";

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import userRoutes from "./routes/userRoutes";
import profileRoutes from "./routes/profileRoutes";
import clerkWebhookRoutes from "./routes/clerkWebhookRoutes";
import productRoutes from "./routes/productRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import searchRoutes from "./routes/searchRoutes";
import wishlistRoutes from "./routes/wishlistRoutes";
import contactRoutes from "./routes/contactRoutes";
import stripeRoutes from "./routes/stripeRoutes";
import discountRoutes from "./routes/discountRoutes";
import trackingRoutes from "./routes/trackingRoutes";
import adminRoutes from "./routes/adminRoutes";
import adminLocalizationRoutes from "./routes/adminLocalizationRoutes";
import adminProductRoutes from "./routes/adminProductRoutes";
import adminCategoryRoutes from "./routes/adminCategoryRoutes";
import adminOrderRoutes from "./routes/adminOrderRoutes";
import adminTaxShippingRoutes from "./routes/adminTaxShippingRoutes";
import adminDeliveryScopeRoutes from "./routes/adminDeliveryScopeRoutes";
import adminCurrencyRoutes from "./routes/adminCurrencyRoutes";
import adminReviewRoutes from "./routes/adminReviewRoutes";
import reviewRoutes from "./routes/reviewRoutes";
import currencyRoutes from "./routes/currencyRoutes";
import languageRoutes from "./routes/languageRoutes";
import countryRoutes from "./routes/countryRoutes";
import notificationRoutes from "./routes/notificationRoutes";
import chatRoutes from "./routes/chatRoutes";
import adminChatRoutes from "./routes/adminChatRoutes";
import adminCustomerRoutes from "./routes/adminCustomerRoutes";
import adminDashboardRoutes from "./routes/adminDashboardRoutes";

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 5000;

// Initialize Socket.IO server
const socketServer = new SocketServer(server);

// Make socket server globally available for notifications
(global as any).socketServer = socketServer;

// Middleware
app.use(
  cors({
    origin: true, // Allow all origins since we're serving everything from the same server
    credentials: true,
  })
);

// Stripe webhook route MUST come before express.json() middleware
// because it needs raw body data for signature verification
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeRoutes
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Static file serving for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Static file serving for frontend assets (production build)
app.use("/static", express.static(path.join(__dirname, "../public/static")));
app.use(
  "/favicon.ico",
  express.static(path.join(__dirname, "../public/favicon.ico"))
);
app.use(
  "/manifest.json",
  express.static(path.join(__dirname, "../public/manifest.json"))
);
app.use(
  "/robots.txt",
  express.static(path.join(__dirname, "../public/robots.txt"))
);
app.use(
  "/logo192.png",
  express.static(path.join(__dirname, "../public/logo192.png"))
);
app.use(
  "/logo512.png",
  express.static(path.join(__dirname, "../public/logo512.png"))
);
app.use("/assets", express.static(path.join(__dirname, "../public/assets")));

// Home page - serve React app (not RSC)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// SEO route for search engines (RSC version)
app.get("/seo", async (req, res) => {
  try {
    // Fetch featured products
    const featuredProducts = await prisma.product.findMany({
      where: {
        isFeatured: true,
        isActive: true,
      },
      include: {
        images: true,
        category: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    // Fetch categories for the home page
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        image: true,
      },
      take: 8,
      orderBy: { createdAt: "desc" },
    });

    // Render the home page with RSC
    renderToStream(
      React.createElement(HomeServer, { featuredProducts, categories }),
      res,
      {
        bootstrapScripts: ["/static/js/main.js"],
        onShellReady: () => {
          console.log("✅ SEO Home page RSC rendered successfully");
        },
        onError: (error) => {
          console.error("❌ SEO Home page RSC rendering error:", error);
        },
      }
    );
  } catch (error) {
    console.error("❌ Error rendering SEO home page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// SEO routes for search engines (RSC versions)
app.get("/seo/products", async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const categorySlug = req.query.category as string;
    const searchQuery = req.query.search as string;
    const sortBy = req.query.sort as string;

    // Build where clause
    let whereClause: any = { isActive: true };

    if (categorySlug) {
      const category = await prisma.category.findUnique({
        where: { slug: categorySlug, isActive: true },
      });
      if (category) {
        whereClause.categoryId = category.id;
      }
    }

    if (searchQuery) {
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
        { shortDescription: { contains: searchQuery, mode: "insensitive" } },
      ];
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (sortBy === "price-low") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    // Get products with pagination
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // Get all categories for filter sidebar
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { sortOrder: "asc" },
    });

    const totalPages = Math.ceil(totalProducts / limit);
    const selectedCategory = categorySlug
      ? categories.find((c) => c.slug === categorySlug)?.name
      : undefined;

    // Render the products listing page with RSC
    renderToStream(
      React.createElement(ProductsServer, {
        products,
        categories,
        totalProducts,
        currentPage: page,
        totalPages,
        selectedCategory,
        searchQuery,
        sortBy,
      }),
      res,
      {
        bootstrapScripts: ["/static/js/main.js"],
        onShellReady: () => {
          console.log(
            `✅ SEO Products listing page RSC rendered successfully (page ${page})`
          );
        },
        onError: (error) => {
          console.error(
            `❌ SEO Products listing page RSC rendering error:`,
            error
          );
        },
      }
    );
  } catch (error) {
    console.error("❌ Error rendering SEO products listing page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seo/products/:slug", async (req, res) => {
  try {
    const { slug } = req.params;

    // Fetch product with all related data
    const product = await prisma.product.findUnique({
      where: {
        slug: slug,
        isActive: true,
      },
      include: {
        category: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
        variants: {
          where: { isActive: true },
        },
        reviews: {
          where: { isActive: true },
          include: {
            user: {
              select: { name: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    });

    if (!product) {
      return res.status(404).send("Product not found");
    }

    // Render the product detail page with RSC
    renderToStream(React.createElement(ProductDetailServer, { product }), res, {
      bootstrapScripts: ["/static/js/main.js"],
      onShellReady: () => {
        console.log(
          `✅ SEO Product detail page RSC rendered successfully for: ${product.name}`
        );
      },
      onError: (error) => {
        console.error(
          `❌ SEO Product detail page RSC rendering error for ${slug}:`,
          error
        );
      },
    });
  } catch (error) {
    console.error(
      `❌ Error rendering SEO product detail page for ${req.params.slug}:`,
      error
    );
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seo/categories", async (req, res) => {
  try {
    // Get all active categories with product count
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Render the categories page with RSC
    renderToStream(React.createElement(CategoriesServer, { categories }), res, {
      bootstrapScripts: ["/static/js/main.js"],
      onShellReady: () => {
        console.log(`✅ SEO Categories page RSC rendered successfully`);
      },
      onError: (error) => {
        console.error(`❌ SEO Categories page RSC rendering error:`, error);
      },
    });
  } catch (error) {
    console.error("❌ Error rendering SEO categories page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seo/categories/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = 12;
    const offset = (page - 1) * limit;
    const sortBy = req.query.sort as string;

    // Get category with product count
    const category = await prisma.category.findUnique({
      where: { slug: slug, isActive: true },
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    if (!category) {
      return res.status(404).send("Category not found");
    }

    // Build order by clause
    let orderBy: any = { createdAt: "desc" };
    if (sortBy === "name") {
      orderBy = { name: "asc" };
    } else if (sortBy === "price-low") {
      orderBy = { price: "asc" };
    } else if (sortBy === "price-high") {
      orderBy = { price: "desc" };
    } else if (sortBy === "newest") {
      orderBy = { createdAt: "desc" };
    }

    // Get products for this category with pagination
    const [products, totalProducts] = await Promise.all([
      prisma.product.findMany({
        where: { categoryId: category.id, isActive: true },
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: orderBy,
        skip: offset,
        take: limit,
      }),
      prisma.product.count({
        where: { categoryId: category.id, isActive: true },
      }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    // Render the category page with RSC
    renderToStream(
      React.createElement(CategoryServer, {
        category,
        products,
        totalProducts,
        currentPage: page,
        totalPages,
        sortBy,
      }),
      res,
      {
        bootstrapScripts: ["/static/js/main.js"],
        onShellReady: () => {
          console.log(
            `✅ SEO Category page RSC rendered successfully for: ${category.name}`
          );
        },
        onError: (error) => {
          console.error(
            `❌ SEO Category page RSC rendering error for ${slug}:`,
            error
          );
        },
      }
    );
  } catch (error) {
    console.error("❌ Error rendering SEO category page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seo/about", async (req, res) => {
  try {
    // Render the about page with RSC
    renderToStream(React.createElement(AboutServer, {}), res, {
      bootstrapScripts: ["/static/js/main.js"],
      onShellReady: () => {
        console.log("✅ SEO About page RSC rendered successfully");
      },
      onError: (error) => {
        console.error("❌ SEO About page RSC rendering error:", error);
      },
    });
  } catch (error) {
    console.error("❌ Error rendering SEO about page:", error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/seo/contact", async (req, res) => {
  try {
    // Render the contact page with RSC
    renderToStream(React.createElement(ContactServer, {}), res, {
      bootstrapScripts: ["/static/js/main.js"],
      onShellReady: () => {
        console.log("✅ SEO Contact page RSC rendered successfully");
      },
      onError: (error) => {
        console.error("❌ SEO Contact page RSC rendering error:", error);
      },
    });
  } catch (error) {
    console.error("❌ Error rendering SEO contact page:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Sitemap routes
app.get("/sitemap.xml", async (req, res) => {
  try {
    const sitemap = await generateSitemap();
    res.setHeader("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating sitemap:", error);
    res.status(500).send("Error generating sitemap");
  }
});

app.get("/sitemap-products.xml", async (req, res) => {
  try {
    const sitemap = await generateProductSitemap();
    res.setHeader("Content-Type", "application/xml");
    res.send(sitemap);
  } catch (error) {
    console.error("Error generating product sitemap:", error);
    res.status(500).send("Error generating product sitemap");
  }
});

// Robots.txt
app.get("/robots.txt", (req, res) => {
  const robotsTxt = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /seo/

# Sitemaps
Sitemap: https://yourdomain.com/sitemap.xml
Sitemap: https://yourdomain.com/sitemap-products.xml

# Crawl-delay
Crawl-delay: 1`;

  res.setHeader("Content-Type", "text/plain");
  res.send(robotsTxt);
});

// Service Worker
app.get("/sw.js", (req, res) => {
  res.setHeader("Content-Type", "application/javascript");
  res.sendFile(path.join(__dirname, "../public/sw.js"));
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    socketConnections: socketServer.getConnectedAdminCount(),
  });
});

// Socket.IO connection test endpoint
app.get("/socket-test", (req, res) => {
  res.json({
    status: "Socket.IO server is running",
    connectedAdmins: socketServer.getConnectedAdminCount(),
    connectedUsers: socketServer.getConnectedUsers(),
    timestamp: new Date().toISOString(),
  });
});

// Test notification endpoint
app.post("/test-notification", async (req, res) => {
  try {
    console.log("🧪 Test notification endpoint called");
    const { notificationService } = await import(
      "./services/notificationService"
    );

    // Create a test notification
    console.log("📝 Creating test notification in database...");
    const notification = await notificationService.createSystemNotification(
      "Test Notification",
      "This is a test notification to verify the system is working correctly.",
      "MEDIUM",
      { test: true, timestamp: new Date().toISOString() }
    );

    console.log("✅ Test notification created in database:", notification?.id);

    // Send real-time notification to admins
    console.log("📡 Sending real-time notification to admins...");
    await socketServer.sendAdminNotification({
      type: "SYSTEM_ALERT",
      title: "Test Notification",
      message:
        "This is a test notification to verify the system is working correctly.",
      category: "SYSTEM",
      priority: "MEDIUM",
      targetType: "SYSTEM",
      isGlobal: true,
      data: { test: true, timestamp: new Date().toISOString() },
    });

    console.log("✅ Real-time notification sent to admins");

    res.json({
      success: true,
      message: "Test notification sent successfully",
      notificationId: notification?.id,
      connectedAdmins: socketServer.getConnectedAdminCount(),
    });
  } catch (error) {
    console.error("❌ Error sending test notification:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send test notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Debug endpoint to check notification counts
app.get("/debug-notifications", async (req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");

    // Get all notifications
    const allNotifications = await prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Get unread count for admin user (assuming user ID 1 is admin)
    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ recipientId: 1 }, { isGlobal: true }],
        status: "UNREAD",
      },
    });

    // Get total count for admin user
    const totalCount = await prisma.notification.count({
      where: {
        OR: [{ recipientId: 1 }, { isGlobal: true }],
      },
    });

    res.json({
      success: true,
      data: {
        allNotifications: allNotifications.map((n) => ({
          id: n.id,
          title: n.title,
          status: n.status,
          isGlobal: n.isGlobal,
          recipientId: n.recipientId,
          createdAt: n.createdAt,
        })),
        unreadCount,
        totalCount,
        connectedAdmins: socketServer.getConnectedAdminCount(),
      },
    });
  } catch (error) {
    console.error("❌ Error checking notifications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check notifications",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Debug endpoint to check webhook events
app.get("/debug-webhook-events", async (req, res) => {
  try {
    const { prisma } = await import("./lib/prisma");

    const webhookEvents = await prisma.webhookEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    res.json({
      success: true,
      data: {
        webhookEvents: webhookEvents.map((e) => ({
          id: e.id,
          type: e.type,
          processed: e.processed,
          processedAt: e.processedAt,
          createdAt: e.createdAt,
        })),
        totalEvents: webhookEvents.length,
      },
    });
  } catch (error) {
    console.error("❌ Error checking webhook events:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check webhook events",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Product detail page - serve React app
app.get("/products/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Products listing page - serve React app
app.get("/products", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Categories page - serve React app
app.get("/categories", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Individual category page - serve React app
app.get("/categories/:slug", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/clerk", clerkWebhookRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/contact", contactRoutes);
// Stripe routes (except webhook which is handled above)
app.use("/api/stripe", stripeRoutes);
app.use("/api/discounts", discountRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/localization", adminLocalizationRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin/tax-shipping", adminTaxShippingRoutes);
app.use("/api/admin/delivery-scope", adminDeliveryScopeRoutes);
app.use("/api/admin/currency", adminCurrencyRoutes);
app.use("/api/admin/reviews", adminReviewRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/currencies", currencyRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin/chat", adminChatRoutes);
app.use("/api/admin/customers", adminCustomerRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

// Error handling middleware
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Global error handler:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// Serve React app for all other routes (SPA fallback)
app.get("*", (req, res) => {
  // Skip API routes
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ error: "API route not found" });
  }

  // Skip static files
  if (req.path.startsWith("/static") || req.path.startsWith("/uploads")) {
    return res.status(404).send("Static file not found");
  }

  // Serve the React app's index.html for client-side routing
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, shutting down gracefully...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🔌 Socket.IO server initialized`);
  console.log(`📡 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check at http://localhost:${PORT}/health`);
});

// Export for testing
export { app, server, socketServer };
