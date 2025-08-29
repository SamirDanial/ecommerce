import {
  PrismaClient,
  InquiryStatus,
  InquiryPriority,
  InquiryCategory,
} from "@prisma/client";

const prisma = new PrismaClient();

export interface CustomerInquiry {
  id: number;
  sessionId: number | null;
  userId: number | null;
  userEmail: string;
  userName: string;
  subject: string;
  message: string;
  category: InquiryCategory;
  priority: InquiryPriority;
  status: InquiryStatus;
  assignedTo: number | null;
  response: string | null;
  respondedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface InquiryWithDetails extends CustomerInquiry {
  session: {
    id: number;
    sessionId: string;
    messages: Array<{
      id: number;
      content: string;
      type: string;
      createdAt: Date;
    }>;
  } | null;
  user: {
    id: number;
    name: string;
    email: string;
  } | null;
  assignedAdmin: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export class CustomerInquiryService {
  /**
   * Create a new customer inquiry
   */
  static async createInquiry(data: {
    sessionId?: number;
    userId?: number;
    userEmail: string;
    userName: string;
    subject: string;
    message: string;
    category?: InquiryCategory;
  }): Promise<CustomerInquiry> {
    try {
      const inquiry = await prisma.customerInquiry.create({
        data: {
          sessionId: data.sessionId,
          userId: data.userId,
          userEmail: data.userEmail,
          userName: data.userName,
          subject: data.subject,
          message: data.message,
          category: data.category || "GENERAL",
          priority: this.calculatePriority(data.category || "GENERAL"),
          status: "PENDING",
        },
      });

      return inquiry;
    } catch (error) {
      console.error("Error creating customer inquiry:", error);
      throw new Error("Failed to create customer inquiry");
    }
  }

  /**
   * Get all inquiries with optional filtering
   */
  static async getInquiries(filters?: {
    status?: InquiryStatus;
    priority?: InquiryPriority;
    category?: InquiryCategory;
    assignedTo?: number;
    search?: string;
  }): Promise<InquiryWithDetails[]> {
    try {
      const where: any = {};

      if (filters?.status) where.status = filters.status;
      if (filters?.priority) where.priority = filters.priority;
      if (filters?.category) where.category = filters.category;
      if (filters?.assignedTo) where.assignedTo = filters.assignedTo;

      if (filters?.search) {
        where.OR = [
          { subject: { contains: filters.search, mode: "insensitive" } },
          { message: { contains: filters.search, mode: "insensitive" } },
          { userName: { contains: filters.search, mode: "insensitive" } },
          { userEmail: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      const inquiries = await prisma.customerInquiry.findMany({
        where,
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              messages: {
                select: {
                  id: true,
                  content: true,
                  type: true,
                  createdAt: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });

      return inquiries;
    } catch (error) {
      console.error("Error getting inquiries:", error);
      throw new Error("Failed to get inquiries");
    }
  }

  /**
   * Get inquiry by ID
   */
  static async getInquiryById(id: number): Promise<InquiryWithDetails | null> {
    try {
      const inquiry = await prisma.customerInquiry.findUnique({
        where: { id },
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              messages: {
                select: {
                  id: true,
                  content: true,
                  type: true,
                  createdAt: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      return inquiry;
    } catch (error) {
      console.error("Error getting inquiry by ID:", error);
      throw new Error("Failed to get inquiry");
    }
  }

  /**
   * Update inquiry status
   */
  static async updateInquiryStatus(
    id: number,
    status: InquiryStatus,
    adminId?: number
  ): Promise<CustomerInquiry> {
    try {
      const updateData: any = { status };

      if (status === "RESOLVED" && adminId) {
        updateData.assignedTo = adminId;
        updateData.respondedAt = new Date();
      }

      const inquiry = await prisma.customerInquiry.update({
        where: { id },
        data: updateData,
      });

      return inquiry;
    } catch (error) {
      console.error("Error updating inquiry status:", error);
      throw new Error("Failed to update inquiry status");
    }
  }

  /**
   * Assign inquiry to admin
   */
  static async assignInquiry(
    inquiryId: number,
    adminId: number
  ): Promise<CustomerInquiry> {
    try {
      const inquiry = await prisma.customerInquiry.update({
        where: { id: inquiryId },
        data: { assignedTo: adminId },
      });

      return inquiry;
    } catch (error) {
      console.error("Error assigning inquiry:", error);
      throw new Error("Failed to assign inquiry");
    }
  }

  /**
   * Add response to inquiry
   */
  static async addResponse(
    inquiryId: number,
    response: string,
    adminId: number
  ): Promise<CustomerInquiry> {
    try {
      const inquiry = await prisma.customerInquiry.update({
        where: { id: inquiryId },
        data: {
          response,
          respondedAt: new Date(),
          assignedTo: adminId,
          status: "RESOLVED",
        },
      });

      return inquiry;
    } catch (error) {
      console.error("Error adding response to inquiry:", error);
      throw new Error("Failed to add response");
    }
  }

  /**
   * Get inquiry statistics
   */
  static async getInquiryStats() {
    try {
      const [
        totalInquiries,
        pendingInquiries,
        resolvedInquiries,
        inquiriesByCategory,
        inquiriesByPriority,
      ] = await Promise.all([
        prisma.customerInquiry.count(),
        prisma.customerInquiry.count({ where: { status: "PENDING" } }),
        prisma.customerInquiry.count({ where: { status: "RESOLVED" } }),
        prisma.customerInquiry.groupBy({
          by: ["category"],
          _count: { id: true },
        }),
        prisma.customerInquiry.groupBy({
          by: ["priority"],
          _count: { id: true },
        }),
      ]);

      const avgResponseTime = await this.calculateAverageResponseTime();

      return {
        totalInquiries,
        pendingInquiries,
        resolvedInquiries,
        resolutionRate:
          totalInquiries > 0 ? (resolvedInquiries / totalInquiries) * 100 : 0,
        inquiriesByCategory: inquiriesByCategory.map((item) => ({
          category: item.category,
          count: item._count.id,
        })),
        inquiriesByPriority: inquiriesByPriority.map((item) => ({
          priority: item.priority,
          count: item._count.id,
        })),
        avgResponseTime,
      };
    } catch (error) {
      console.error("Error getting inquiry stats:", error);
      throw new Error("Failed to get inquiry statistics");
    }
  }

  /**
   * Calculate average response time
   */
  private static async calculateAverageResponseTime(): Promise<number> {
    try {
      const resolvedInquiries = await prisma.customerInquiry.findMany({
        where: {
          status: "RESOLVED",
          respondedAt: { not: null },
        },
        select: {
          createdAt: true,
          respondedAt: true,
        },
      });

      if (resolvedInquiries.length === 0) return 0;

      const totalResponseTime = resolvedInquiries.reduce((sum, inquiry) => {
        const responseTime =
          inquiry.respondedAt!.getTime() - inquiry.createdAt.getTime();
        return sum + responseTime;
      }, 0);

      return Math.round(
        totalResponseTime / resolvedInquiries.length / (1000 * 60 * 60)
      ); // Hours
    } catch (error) {
      console.error("Error calculating average response time:", error);
      return 0;
    }
  }

  /**
   * Calculate priority based on category
   */
  private static calculatePriority(category: InquiryCategory): InquiryPriority {
    switch (category) {
      case "PAYMENT":
        return "HIGH";
      case "TECHNICAL":
        return "MEDIUM";
      case "SHIPPING":
        return "MEDIUM";
      case "RETURNS":
        return "MEDIUM";
      case "PRODUCT_INFORMATION":
        return "LOW";
      case "GENERAL":
      default:
        return "LOW";
    }
  }

  /**
   * Get inquiries assigned to specific admin
   */
  static async getInquiriesByAdmin(
    adminId: number
  ): Promise<InquiryWithDetails[]> {
    try {
      const inquiries = await prisma.customerInquiry.findMany({
        where: { assignedTo: adminId },
        include: {
          session: {
            select: {
              id: true,
              sessionId: true,
              messages: {
                select: {
                  id: true,
                  content: true,
                  type: true,
                  createdAt: true,
                },
                orderBy: { createdAt: "asc" },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          assignedAdmin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
      });

      return inquiries;
    } catch (error) {
      console.error("Error getting inquiries by admin:", error);
      throw new Error("Failed to get inquiries by admin");
    }
  }
}
