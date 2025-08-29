import express from "express";
import { ChatService } from "../services/chatService";
import { CustomerInquiryService } from "../services/customerInquiryService";
import { authenticateClerkToken } from "../middleware/clerkAuth";

const router = express.Router();

// Create or get chat session
router.post("/session", async (req, res) => {
  try {
    const { userId, userEmail, userName } = req.body;

    const session = await ChatService.createOrGetSession(
      userId,
      userEmail,
      userName
    );

    res.json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Error creating/getting chat session:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create or get chat session",
    });
  }
});

// Get chat session
router.get("/session/:sessionId", async (req, res) => {
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

// Add message to chat session
router.post("/session/:sessionId/message", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { content, type = "USER" } = req.body;

    const session = await ChatService.getSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: "Session not found",
      });
    }

    const message = await ChatService.addMessage(session.id, type, content);

    res.json({
      success: true,
      data: message,
    });
  } catch (error) {
    console.error("Error adding message:", error);
    res.status(500).json({
      success: false,
      error: "Failed to add message",
    });
  }
});

// Get FAQ entries by category
router.get("/faq", async (req, res) => {
  try {
    const { category } = req.query;

    const faqEntries = await ChatService.getFAQByCategory(category as string);

    res.json({
      success: true,
      data: faqEntries,
    });
  } catch (error) {
    console.error("Error getting FAQ entries:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get FAQ entries",
    });
  }
});

// Search FAQ entries
router.get("/faq/search", async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== "string") {
      return res.status(400).json({
        success: false,
        error: "Search query is required",
      });
    }

    const faqEntries = await ChatService.searchFAQ(q);

    res.json({
      success: true,
      data: faqEntries,
    });
  } catch (error) {
    console.error("Error searching FAQ:", error);
    res.status(500).json({
      success: false,
      error: "Failed to search FAQ",
    });
  }
});

// Get suggested questions
router.get("/faq/suggested", async (req, res) => {
  try {
    const suggestedQuestions = await ChatService.getSuggestedQuestions();

    res.json({
      success: true,
      data: suggestedQuestions,
    });
  } catch (error) {
    console.error("Error getting suggested questions:", error);
    res.status(500).json({
      success: false,
      error: "Failed to get suggested questions",
    });
  }
});

// Increment FAQ view count
router.post("/faq/:id/view", async (req, res) => {
  try {
    const { id } = req.params;

    await ChatService.incrementFAQViewCount(parseInt(id));

    res.json({
      success: true,
      message: "View count incremented",
    });
  } catch (error) {
    console.error("Error incrementing FAQ view count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to increment view count",
    });
  }
});

// Increment FAQ helpful count
router.post("/faq/:id/helpful", async (req, res) => {
  try {
    const { id } = req.params;

    await ChatService.incrementFAQHelpfulCount(parseInt(id));

    res.json({
      success: true,
      message: "Helpful count incremented",
    });
  } catch (error) {
    console.error("Error incrementing FAQ helpful count:", error);
    res.status(500).json({
      success: false,
      error: "Failed to increment helpful count",
    });
  }
});

// Create customer inquiry
router.post("/inquiry", async (req, res) => {
  try {
    const {
      sessionId,
      userId,
      userEmail,
      userName,
      subject,
      message,
      category,
    } = req.body;

    if (!userEmail || !userName || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    const inquiry = await CustomerInquiryService.createInquiry({
      sessionId,
      userId,
      userEmail,
      userName,
      subject,
      message,
      category,
    });

    res.json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    console.error("Error creating customer inquiry:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create customer inquiry",
    });
  }
});

// Close chat session
router.post("/session/:sessionId/close", async (req, res) => {
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

export default router;
