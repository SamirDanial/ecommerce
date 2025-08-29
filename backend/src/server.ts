import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { prisma } from "./lib/prisma";
import { SocketServer } from "./socket/socketServer";

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
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
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

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
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
