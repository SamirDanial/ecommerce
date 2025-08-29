import express from "express";
import { authenticateClerkToken } from "../middleware/clerkAuth";
import { CustomerService } from "../services/customerService";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateClerkToken);

// Get customers with filters and pagination
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      emailVerified,
      hasOrders,
      hasWishlist,
      orderStatus,
      paymentStatus,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    } = req.query;

    // Parse and validate parameters
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(
      100,
      Math.max(1, parseInt(limit as string) || 20)
    );

    // Build filters object
    const filters: any = {};

    if (search) filters.search = search as string;
    if (emailVerified !== undefined)
      filters.emailVerified = emailVerified === "true";
    if (hasOrders !== undefined) filters.hasOrders = hasOrders === "true";
    if (hasWishlist !== undefined) filters.hasWishlist = hasWishlist === "true";
    if (orderStatus) filters.orderStatus = orderStatus as string;
    if (paymentStatus) filters.paymentStatus = paymentStatus as string;
    if (dateFrom) filters.dateFrom = new Date(dateFrom as string);
    if (dateTo) filters.dateTo = new Date(dateTo as string);
    if (sortBy) filters.sortBy = sortBy as string;
    if (sortOrder) filters.sortOrder = sortOrder as string;

    const result = await CustomerService.getCustomers(
      filters,
      pageNum,
      limitNum
    );

    res.json({
      success: true,
      data: result.customers,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customers",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get customer statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await CustomerService.getCustomerStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching customer stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer statistics",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

// Get individual customer by ID
router.get("/:id", async (req, res) => {
  try {
    const customerId = parseInt(req.params.id);

    if (isNaN(customerId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid customer ID",
      });
    }

    const customer = await CustomerService.getCustomerById(customerId);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error("Error fetching customer:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
