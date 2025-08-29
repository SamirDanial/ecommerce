import express from "express";
import { ChatService } from "../services/chatService";
import { CustomerInquiryService } from "../services/customerInquiryService";
import { authenticateClerkToken } from "../middleware/clerkAuth";

const router = express.Router();

// Apply authentication middleware to all admin routes
router.use(authenticateClerkToken);

// Get all active chat sessions
router.get("/sessions", async (req, res) => {
  try {
    const sessions = await ChatService.getActiveSessions();

    res.json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Error getting active sessions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get active sessions",
    });
  }
});

// Get chat session by ID with full message history
router.get("/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const session = await ChatService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error getting chat session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get chat session",
    });
  }
});

// Add admin message to chat session
router.post("/sessions/:sessionId/message", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        error: "Message content is required",
      });
    }

    const session = await ChatService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    const message = await ChatService.addMessage(
      session.id,
      "ASSISTANT",
      content
    );

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error adding admin message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add admin message",
    });
  }
});

// Close chat session
router.post("/sessions/:sessionId/close", async (req, res) => {
  try {
    const { sessionId } = req.params;

    await ChatService.closeSession(sessionId);

    res.json({
      success: true,
      message: "Session closed successfully",
    });
  } catch (error) {
    console.error("Error closing chat session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to close session",
    });
  }
});

// Get chat statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await ChatService.getChatStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting chat stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get chat statistics",
    });
  }
});

// Get all customer inquiries
router.get("/inquiries", async (req, res) => {
  try {
    const { status, priority, category, assignedTo, search } = req.query;

    const filters: any = {};
    if (status) filters.status = status;
    if (priority) filters.priority = priority;
    if (category) filters.category = category;
    if (assignedTo) filters.assignedTo = parseInt(assignedTo as string);
    if (search) filters.search = search;

    const inquiries = await CustomerInquiryService.getInquiries(filters);

    res.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error getting inquiries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get inquiries",
    });
  }
});

// Get inquiry by ID
router.get("/inquiries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const inquiry = await CustomerInquiryService.getInquiryById(parseInt(id));

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        error: "Inquiry not found",
      });
    }

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error getting inquiry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get inquiry",
    });
  }
});

// Update inquiry status
router.patch("/inquiries/:id/status", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const adminId = (req as any).user?.id;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: "Status is required",
      });
    }

    const inquiry = await CustomerInquiryService.updateInquiryStatus(
      parseInt(id),
      status,
      adminId
    );

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error updating inquiry status:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update inquiry status",
    });
  }
});

// Assign inquiry to admin
router.patch("/inquiries/:id/assign", async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        error: "Admin ID is required",
      });
    }

    const inquiry = await CustomerInquiryService.assignInquiry(
      parseInt(id),
      adminId
    );

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error assigning inquiry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to assign inquiry",
    });
  }
});

// Add response to inquiry
router.post("/inquiries/:id/response", async (req, res) => {
  try {
    const { id } = req.params;
    const { response } = req.body;
    const adminId = (req as any).user?.id;

    if (!response) {
      return res.status(400).json({
        success: false,
        error: "Response is required",
      });
    }

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required",
      });
    }

    const inquiry = await CustomerInquiryService.addResponse(
      parseInt(id),
      response,
      adminId
    );

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error adding response to inquiry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add response",
    });
  }
});

// Get inquiry statistics
router.get("/inquiries/stats", async (req, res) => {
  try {
    const stats = await CustomerInquiryService.getInquiryStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error getting inquiry stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get inquiry statistics",
    });
  }
});

// Get inquiries assigned to current admin
router.get("/inquiries/assigned", async (req, res) => {
  try {
    const adminId = (req as any).user?.id;

    if (!adminId) {
      return res.status(401).json({
        success: false,
        error: "Admin authentication required",
      });
    }

    const inquiries = await CustomerInquiryService.getInquiriesByAdmin(adminId);

    res.json({
      success: true,
      data: inquiries,
    });
  } catch (error) {
    console.error("Error getting assigned inquiries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get assigned inquiries",
    });
  }
});

export default router;
