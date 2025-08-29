import { prisma } from "../lib/prisma";

export interface CustomerWithDetails {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
  avatar?: string | null;
  isEmailVerified: boolean;
  phone?: string | null;
  clerkId?: string | null;
  stripeCustomerId?: string | null;
  _count: {
    orders: number;
    wishlist: number;
    reviews: number;
  };
  orders: Array<{
    id: number;
    orderNumber: string;
    orderStatus: string;
    total: number;
    currency: string;
    createdAt: Date;
    paymentStatus: string;
    deliveryStatus: string;
    payments: Array<{
      id: number;
      amount: number;
      currency: string;
      status: string;
      method: string;
      createdAt: Date;
      transactionId?: string | null;
    }>;
  }>;
  wishlist: Array<{
    id: number;
    product: {
      id: number;
      name: string;
      price: number;
      image?: string | null;
    };
    createdAt: Date;
  }>;
}

export interface CustomerFilters {
  search?: string;
  emailVerified?: boolean;
  hasOrders?: boolean;
  hasWishlist?: boolean;
  orderStatus?: string;
  paymentStatus?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: "name" | "email" | "createdAt" | "ordersCount" | "totalSpent";
  sortOrder?: "asc" | "desc";
}

export interface CustomerPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export class CustomerService {
  static async getCustomers(
    filters: CustomerFilters = {},
    page: number = 1,
    limit: number = 20
  ): Promise<{
    customers: CustomerWithDetails[];
    pagination: CustomerPagination;
  }> {
    try {
      const skip = (page - 1) * limit;

      // Build where conditions
      const where: any = {
        role: "USER",
      };

      // Search filter
      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: "insensitive" } },
          { email: { contains: filters.search, mode: "insensitive" } },
        ];
      }

      // Email verification filter
      if (filters.emailVerified !== undefined) {
        where.isEmailVerified = filters.emailVerified;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        where.createdAt = {};
        if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
        if (filters.dateTo) where.createdAt.lte = filters.dateTo;
      }

      // Build order by
      let orderBy: any = { createdAt: "desc" };

      if (filters.sortBy) {
        if (filters.sortBy === "ordersCount") {
          orderBy = { orders: { _count: filters.sortOrder || "desc" } };
        } else if (filters.sortBy === "totalSpent") {
          orderBy = {
            orders: { _sum: { total: filters.sortOrder || "desc" } },
          };
        } else {
          orderBy = { [filters.sortBy]: filters.sortOrder || "desc" };
        }
      }

      // Get total count for pagination
      const total = await prisma.user.count({ where });

      // Get customers with related data
      const customers = await prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        include: {
          _count: {
            select: {
              orders: true,
              wishlist: true,
              reviews: true,
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              orderStatus: true,
              total: true,
              currency: true,
              createdAt: true,
              paymentStatus: true,
              deliveryStatus: true,
              payments: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  status: true,
                  method: true,
                  createdAt: true,
                  transactionId: true,
                },
                orderBy: { createdAt: "desc" },
                take: 5, // Limit to last 5 payments
              },
            },
            orderBy: { createdAt: "desc" },
            take: 5, // Limit to last 5 orders
          },
          wishlist: {
            select: {
              id: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  images: {
                    where: { isPrimary: true },
                    select: { url: true },
                    take: 1,
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
            take: 10, // Limit to last 10 wishlist items
          },
        },
      });

      // Transform the data to match our interface
      const transformedCustomers: CustomerWithDetails[] = customers.map(
        (customer) => ({
          ...customer,
          orders: customer.orders.map((order) => ({
            ...order,
            total: Number(order.total),
            payments: order.payments.map((payment) => ({
              ...payment,
              amount: Number(payment.amount),
            })),
          })),
          wishlist: customer.wishlist.map((item) => ({
            ...item,
            product: {
              ...item.product,
              price: Number(item.product.price),
              image: item.product.images[0]?.url || null,
            },
          })),
        })
      );

      // Apply additional filters that require post-processing
      let filteredCustomers = transformedCustomers;

      if (filters.hasOrders !== undefined) {
        filteredCustomers = filteredCustomers.filter((customer) =>
          filters.hasOrders
            ? customer._count.orders > 0
            : customer._count.orders === 0
        );
      }

      if (filters.hasWishlist !== undefined) {
        filteredCustomers = filteredCustomers.filter((customer) =>
          filters.hasWishlist
            ? customer._count.wishlist > 0
            : customer._count.wishlist === 0
        );
      }

      if (filters.orderStatus) {
        filteredCustomers = filteredCustomers.filter((customer) =>
          customer.orders.some(
            (order) => order.orderStatus === filters.orderStatus
          )
        );
      }

      if (filters.paymentStatus) {
        filteredCustomers = filteredCustomers.filter((customer) =>
          customer.orders.some((order) =>
            order.payments.some(
              (payment) => payment.status === filters.paymentStatus
            )
          )
        );
      }

      const totalPages = Math.ceil(total / limit);

      return {
        customers: filteredCustomers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error fetching customers:", error);
      throw new Error("Failed to fetch customers");
    }
  }

  static async getCustomerById(
    id: number
  ): Promise<CustomerWithDetails | null> {
    try {
      const customer = await prisma.user.findUnique({
        where: { id, role: "USER" },
        include: {
          _count: {
            select: {
              orders: true,
              wishlist: true,
              reviews: true,
            },
          },
          orders: {
            select: {
              id: true,
              orderNumber: true,
              orderStatus: true,
              total: true,
              currency: true,
              createdAt: true,
              paymentStatus: true,
              deliveryStatus: true,
              items: {
                select: {
                  id: true,
                  productName: true,
                  quantity: true,
                  price: true,
                  total: true,
                  size: true,
                  color: true,
                },
              },
              payments: {
                select: {
                  id: true,
                  amount: true,
                  currency: true,
                  status: true,
                  method: true,
                  createdAt: true,
                  transactionId: true,
                },
                orderBy: { createdAt: "desc" },
              },
            },
            orderBy: { createdAt: "desc" },
          },
          wishlist: {
            select: {
              id: true,
              createdAt: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  description: true,
                  images: {
                    select: { url: true, alt: true },
                    orderBy: { sortOrder: "asc" },
                  },
                },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });

      if (!customer) return null;

      // Transform the data
      return {
        ...customer,
        orders: customer.orders.map((order) => ({
          ...order,
          total: Number(order.total),
          payments: order.payments.map((payment) => ({
            ...payment,
            amount: Number(payment.amount),
          })),
        })),
        wishlist: customer.wishlist.map((item) => ({
          ...item,
          product: {
            ...item.product,
            price: Number(item.product.price),
          },
        })),
      };
    } catch (error) {
      console.error("Error fetching customer:", error);
      throw new Error("Failed to fetch customer");
    }
  }

  static async getCustomerStats(): Promise<{
    totalCustomers: number;
    verifiedCustomers: number;
    customersWithOrders: number;
    customersWithWishlist: number;
    averageOrdersPerCustomer: number;
    totalRevenue: number;
  }> {
    try {
      const [
        totalCustomers,
        verifiedCustomers,
        customersWithOrders,
        customersWithWishlist,
        totalOrders,
        totalRevenue,
      ] = await Promise.all([
        prisma.user.count({ where: { role: "USER" } }),
        prisma.user.count({
          where: { role: "USER", isEmailVerified: true },
        }),
        prisma.user.count({
          where: {
            role: "USER",
            orders: { some: {} },
          },
        }),
        prisma.user.count({
          where: {
            role: "USER",
            wishlist: { some: {} },
          },
        }),
        prisma.order.count({ where: { user: { role: "USER" } } }),
        prisma.order.aggregate({
          where: { user: { role: "USER" } },
          _sum: { total: true },
        }),
      ]);

      return {
        totalCustomers,
        verifiedCustomers,
        customersWithOrders,
        customersWithWishlist,
        averageOrdersPerCustomer:
          totalCustomers > 0 ? totalOrders / totalCustomers : 0,
        totalRevenue: Number(totalRevenue._sum.total || 0),
      };
    } catch (error) {
      console.error("Error fetching customer stats:", error);
      throw new Error("Failed to fetch customer statistics");
    }
  }
}
