import {
  PrismaClient,
  ChatMessageType,
  ChatSessionStatus,
} from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

const prisma = new PrismaClient();

export interface ChatMessage {
  id: number;
  type: ChatMessageType;
  content: string;
  metadata?: any;
  createdAt: Date;
}

export interface ChatSession {
  id: number;
  sessionId: string;
  userId: number | null;
  userEmail: string | null;
  userName: string | null;
  status: ChatSessionStatus;
  lastActivity: Date;
  messages: ChatMessage[];
}

export interface FAQEntry {
  id: number;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export class ChatService {
  /**
   * Create or get existing chat session
   */
  static async createOrGetSession(
    userId?: number,
    userEmail?: string,
    userName?: string
  ): Promise<ChatSession> {
    try {
      // Check if user already has an active session
      let session = await prisma.chatSession.findFirst({
        where: {
          OR: [
            { userId: userId || undefined },
            { userEmail: userEmail || undefined },
          ],
          status: "ACTIVE",
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      if (!session) {
        // Create new session
        const sessionId = uuidv4();
        session = await prisma.chatSession.create({
          data: {
            sessionId,
            userId,
            userEmail,
            userName,
            status: "ACTIVE",
          },
          include: {
            messages: {
              orderBy: { createdAt: "asc" },
            },
          },
        });

        // Add welcome message
        await this.addMessage(
          session.id,
          "ASSISTANT",
          "Hello! How can I help you today? Feel free to ask any questions about our products, shipping, returns, or anything else."
        );
      }

      return session;
    } catch (error) {
      console.error("Error creating/getting chat session:", error);
      throw new Error("Failed to create or get chat session");
    }
  }

  /**
   * Add a message to a chat session
   */
  static async addMessage(
    sessionId: number,
    type: ChatMessageType,
    content: string,
    metadata?: any
  ): Promise<ChatMessage> {
    try {
      const message = await prisma.chatMessage.create({
        data: {
          sessionId,
          type,
          content,
          metadata,
        },
      });

      // Update session last activity
      await prisma.chatSession.update({
        where: { id: sessionId },
        data: { lastActivity: new Date() },
      });

      return message;
    } catch (error) {
      console.error("Error adding message:", error);
      throw new Error("Failed to add message");
    }
  }

  /**
   * Get chat session with messages
   */
  static async getSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const session = await prisma.chatSession.findUnique({
        where: { sessionId },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      });

      return session;
    } catch (error) {
      console.error("Error getting chat session:", error);
      throw new Error("Failed to get chat session");
    }
  }

  /**
   * Get FAQ entries by category
   */
  static async getFAQByCategory(category?: string): Promise<FAQEntry[]> {
    try {
      const where = category
        ? { category, isActive: true }
        : { isActive: true };

      const faqEntries = await prisma.fAQEntry.findMany({
        where,
        orderBy: { sortOrder: "asc" },
      });

      return faqEntries;
    } catch (error) {
      console.error("Error getting FAQ entries:", error);
      throw new Error("Failed to get FAQ entries");
    }
  }

  /**
   * Search FAQ entries
   */
  static async searchFAQ(query: string): Promise<FAQEntry[]> {
    try {
      const faqEntries = await prisma.fAQEntry.findMany({
        where: {
          AND: [
            { isActive: true },
            {
              OR: [
                { question: { contains: query, mode: "insensitive" } },
                { answer: { contains: query, mode: "insensitive" } },
                { tags: { hasSome: [query] } },
              ],
            },
          ],
        },
        orderBy: [{ helpfulCount: "desc" }, { viewCount: "desc" }],
      });

      return faqEntries;
    } catch (error) {
      console.error("Error searching FAQ:", error);
      throw new Error("Failed to search FAQ");
    }
  }

  /**
   * Get suggested questions based on common categories
   */
  static async getSuggestedQuestions(): Promise<FAQEntry[]> {
    try {
      const suggestedQuestions = await prisma.fAQEntry.findMany({
        where: { isActive: true },
        orderBy: [{ helpfulCount: "desc" }, { viewCount: "desc" }],
        take: 8,
      });

      return suggestedQuestions;
    } catch (error) {
      console.error("Error getting suggested questions:", error);
      throw new Error("Failed to get suggested questions");
    }
  }

  /**
   * Increment FAQ view count
   */
  static async incrementFAQViewCount(faqId: number): Promise<void> {
    try {
      await prisma.fAQEntry.update({
        where: { id: faqId },
        data: {
          viewCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Error incrementing FAQ view count:", error);
    }
  }

  /**
   * Increment FAQ helpful count
   */
  static async incrementFAQHelpfulCount(faqId: number): Promise<void> {
    try {
      await prisma.fAQEntry.update({
        where: { id: faqId },
        data: {
          helpfulCount: { increment: 1 },
        },
      });
    } catch (error) {
      console.error("Error incrementing FAQ helpful count:", error);
    }
  }

  /**
   * Close chat session
   */
  static async closeSession(sessionId: string): Promise<void> {
    try {
      await prisma.chatSession.update({
        where: { sessionId },
        data: { status: "CLOSED" },
      });
    } catch (error) {
      console.error("Error closing chat session:", error);
      throw new Error("Failed to close chat session");
    }
  }

  /**
   * Get active chat sessions for admin
   */
  static async getActiveSessions(): Promise<ChatSession[]> {
    try {
      const sessions = await prisma.chatSession.findMany({
        where: { status: "ACTIVE" },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: { lastActivity: "desc" },
      });

      return sessions;
    } catch (error) {
      console.error("Error getting active sessions:", error);
      throw new Error("Failed to get active sessions");
    }
  }

  /**
   * Get chat session statistics
   */
  static async getChatStats() {
    try {
      const [
        totalSessions,
        activeSessions,
        totalMessages,
        avgMessagesPerSession,
      ] = await Promise.all([
        prisma.chatSession.count(),
        prisma.chatSession.count({ where: { status: "ACTIVE" } }),
        prisma.chatMessage.count(),
        prisma.chatMessage.groupBy({
          by: ["sessionId"],
          _count: { id: true },
        }),
      ]);

      const avgMessages =
        avgMessagesPerSession.length > 0
          ? avgMessagesPerSession.reduce(
              (sum, item) => sum + item._count.id,
              0
            ) / avgMessagesPerSession.length
          : 0;

      return {
        totalSessions,
        activeSessions,
        totalMessages,
        avgMessagesPerSession: Math.round(avgMessages * 100) / 100,
      };
    } catch (error) {
      console.error("Error getting chat stats:", error);
      throw new Error("Failed to get chat statistics");
    }
  }
}
