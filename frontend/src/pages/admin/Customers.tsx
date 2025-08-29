import React, { useState, useEffect } from "react";
import {
  Users,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Mail,
  Phone,
  CreditCard,
  Heart,
  Star,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
} from "lucide-react";
import { Card, CardContent } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../../components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "../../lib/utils";
import { useClerkAuth } from "../../hooks/useClerkAuth";
import { getApiBaseUrl } from "../../config/api";

interface Customer {
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
  }>;
  payments: Array<{
    id: number;
    amount: number;
    currency: string;
    status: string;
    method: string;
    createdAt: Date;
    transactionId?: string | null;
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

interface CustomerStats {
  totalCustomers: number;
  verifiedCustomers: number;
  customersWithOrders: number;
  customersWithWishlist: number;
  averageOrdersPerCustomer: number;
  totalRevenue: number;
}

interface CustomerFilters {
  search: string;
  emailVerified: boolean | null | "all";
  hasOrders: boolean | null | "all";
  hasWishlist: boolean | null | "all";
  orderStatus: string;
  paymentStatus: string;
  dateFrom: string;
  dateTo: string;
  sortBy: string;
  sortOrder: string;
}

const Customers: React.FC = () => {
  const { getToken } = useClerkAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [stats, setStats] = useState<CustomerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [filters, setFilters] = useState<CustomerFilters>({
    search: "",
    emailVerified: "all",
    hasOrders: "all",
    hasWishlist: "all",
    orderStatus: "",
    paymentStatus: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  useEffect(() => {
    loadData();
  }, [currentPage, filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      if (!token) {
        throw new Error("No authentication token found");
      }

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20",
      });

      if (filters.search) params.append("search", filters.search);
      if (filters.emailVerified !== null && filters.emailVerified !== "all")
        params.append("emailVerified", filters.emailVerified.toString());
      if (filters.hasOrders !== null && filters.hasOrders !== "all")
        params.append("hasOrders", filters.hasOrders.toString());
      if (filters.hasWishlist !== null && filters.hasWishlist !== "all")
        params.append("hasWishlist", filters.hasWishlist.toString());
      if (filters.orderStatus)
        params.append("orderStatus", filters.orderStatus);
      if (filters.paymentStatus)
        params.append("paymentStatus", filters.paymentStatus);
      if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
      if (filters.dateTo) params.append("dateTo", filters.dateTo);
      if (filters.sortBy) params.append("sortBy", filters.sortBy);
      if (filters.sortOrder) params.append("sortOrder", filters.sortOrder);

      const [customersResponse, statsResponse] = await Promise.all([
        fetch(`${getApiBaseUrl()}/admin/customers?${params}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch(`${getApiBaseUrl()}/admin/customers/stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ]);

      if (customersResponse.ok) {
        const customersData = await customersResponse.json();
        setCustomers(customersData.data);
        setTotalPages(customersData.pagination.totalPages);
        setTotalCustomers(customersData.pagination.total);
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof CustomerFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      emailVerified: "all",
      hasOrders: "all",
      hasWishlist: "all",
      orderStatus: "",
      paymentStatus: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setCurrentPage(1);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
      case "delivered":
        return "text-green-600 bg-green-100";
      case "pending":
      case "processing":
        return "text-yellow-600 bg-yellow-100";
      case "cancelled":
      case "failed":
      case "rejected":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
      case "paid":
      case "delivered":
        return <CheckCircle size={14} />;
      case "pending":
      case "processing":
        return <Clock size={14} />;
      case "cancelled":
      case "failed":
      case "rejected":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-2 sm:p-3 md:p-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-600/20 to-indigo-600/20 rounded-xl sm:rounded-2xl md:rounded-3xl blur-3xl group-hover:blur-2xl transition-all duration-700"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-xl sm:rounded-2xl md:rounded-3xl p-2 sm:p-4 md:p-8 border border-white/30 shadow-2xl hover:shadow-3xl transition-all duration-500">
            <div className="flex items-center justify-between">
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="p-3 bg-gradient-to-br from-purple-500 via-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                      <Users className="w-7 h-7 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      Customer Management
                    </h1>
                    <p className="text-slate-600 text-sm sm:text-base font-medium">
                      Manage and monitor your customer base with detailed
                      insights
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Customers
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-blue-600">
                    {stats.totalCustomers}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Verified</p>
                  <p className="text-xl sm:text-2xl font-bold text-green-600">
                    {stats.verifiedCustomers}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    With Orders
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-purple-600">
                    {stats.customersWithOrders}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-5 md:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Revenue
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-yellow-600">
                    {formatCurrency(stats.totalRevenue, "USD")}
                  </p>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Filter className="w-5 h-5 mr-2" />
              Filters
            </h2>
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Name or email..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Email Verified */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Status
              </label>
              <Select
                value={
                  filters.emailVerified === null
                    ? "all"
                    : filters.emailVerified.toString()
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "emailVerified",
                    value === "all" ? null : value === "true"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">Verified</SelectItem>
                  <SelectItem value="false">Not Verified</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Orders */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order Status
              </label>
              <Select
                value={
                  filters.hasOrders === null
                    ? "all"
                    : filters.hasOrders.toString()
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "hasOrders",
                    value === "all" ? null : value === "true"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">With Orders</SelectItem>
                  <SelectItem value="false">No Orders</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => handleFilterChange("sortBy", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt">Join Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="ordersCount">Orders Count</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateFrom
                      ? format(new Date(filters.dateFrom), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filters.dateFrom ? new Date(filters.dateFrom) : undefined
                    }
                    onSelect={(date) =>
                      handleFilterChange(
                        "dateFrom",
                        date ? format(date, "yyyy-MM-dd") : ""
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filters.dateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.dateTo
                      ? format(new Date(filters.dateTo), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={
                      filters.dateTo ? new Date(filters.dateTo) : undefined
                    }
                    onSelect={(date) =>
                      handleFilterChange(
                        "dateTo",
                        date ? format(date, "yyyy-MM-dd") : ""
                      )
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort Order
              </label>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) =>
                  handleFilterChange("sortOrder", value)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Sort order..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="desc">Descending</SelectItem>
                  <SelectItem value="asc">Ascending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Has Wishlist */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wishlist
              </label>
              <Select
                value={
                  filters.hasWishlist === null
                    ? "all"
                    : filters.hasWishlist.toString()
                }
                onValueChange={(value) =>
                  handleFilterChange(
                    "hasWishlist",
                    value === "all" ? null : value === "true"
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="true">With Wishlist</SelectItem>
                  <SelectItem value="false">No Wishlist</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Customers ({totalCustomers})
            </h2>
            {loading && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Loading...
              </div>
            )}
          </div>

          {customers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No customers found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="border border-gray-200 rounded-lg p-6 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {customer.name}
                          </h3>
                          {customer.isEmailVerified && (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {customer.role}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Mail className="w-4 h-4 mr-2" />
                          {customer.email}
                        </div>
                        {customer.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="w-4 h-4 mr-2" />
                            {customer.phone}
                          </div>
                        )}
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Joined{" "}
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {customer._count.orders} orders
                        </div>
                      </div>

                      {/* Quick Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                              Orders
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              {customer._count.orders}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                              Wishlist
                            </span>
                            <span className="text-lg font-bold text-purple-600">
                              {customer._count.wishlist}
                            </span>
                          </div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-600">
                              Reviews
                            </span>
                            <span className="text-lg font-bold text-yellow-600">
                              {customer._count.reviews}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Recent Wishlist Items */}
                      {customer.wishlist.length > 0 && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                            <Heart className="w-4 h-4 mr-2" />
                            Recent Wishlist Items ({customer.wishlist.length})
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {customer.wishlist.slice(0, 6).map((item) => {
                              console.log("Wishlist item:", item);
                              return (
                                <div
                                  key={item.id}
                                  className="bg-white p-2 rounded border text-sm"
                                >
                                  <div className="flex items-center space-x-2">
                                    {item.product.image ? (
                                      <img
                                        src={
                                          item.product.image.startsWith("http")
                                            ? item.product.image
                                            : `${window.location.origin}${item.product.image}`
                                        }
                                        alt={item.product.name}
                                        className="w-8 h-8 rounded object-cover"
                                        onError={(e) => {
                                          console.log(
                                            "Image failed to load:",
                                            item.product.image
                                          );
                                          e.currentTarget.style.display =
                                            "none";
                                        }}
                                      />
                                    ) : (
                                      <div className="w-8 h-8 rounded bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs text-gray-500">
                                          ?
                                        </span>
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-gray-900 truncate">
                                        {item.product.name}
                                      </p>
                                      <p className="text-gray-600">
                                        {formatCurrency(
                                          item.product.price,
                                          "USD"
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    <Button
                      onClick={() => setSelectedCustomer(customer)}
                      className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing page {currentPage} of {totalPages}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  variant="outline"
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <Button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  variant="outline"
                  size="sm"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border-0 w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-2xl rounded-lg bg-white">
            <div className="flex items-center justify-between mb-6 pb-4 border-t border-gray-200">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Customer Details
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {selectedCustomer.name} ({selectedCustomer.email})
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto mb-6 space-y-6">
              {/* Customer Info */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-3">
                  Customer Information
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedCustomer.name}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedCustomer.email}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <span className="ml-2 text-gray-900">
                      {selectedCustomer.phone || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Email Verified:
                    </span>
                    <span
                      className={`ml-2 ${
                        selectedCustomer.isEmailVerified
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {selectedCustomer.isEmailVerified ? "Yes" : "No"}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Joined:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(
                        selectedCustomer.createdAt
                      ).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">
                      Stripe Customer ID:
                    </span>
                    <span className="ml-2 text-gray-900">
                      {selectedCustomer.stripeCustomerId || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Orders */}
              {selectedCustomer.orders.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Orders ({selectedCustomer.orders.length})
                  </h4>
                  <div className="space-y-3">
                    {selectedCustomer.orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-gray-50 p-4 rounded-lg border"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-gray-900">
                            {order.orderNumber}
                          </span>
                          <span className="text-lg font-bold text-blue-600">
                            {formatCurrency(order.total, order.currency)}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-600">
                              Status:
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.orderStatus
                              )}`}
                            >
                              {getStatusIcon(order.orderStatus)}
                              <span className="ml-1">{order.orderStatus}</span>
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Payment:
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {getStatusIcon(order.paymentStatus)}
                              <span className="ml-1">
                                {order.paymentStatus}
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Delivery:
                            </span>
                            <span
                              className={`ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                order.deliveryStatus
                              )}`}
                            >
                              {getStatusIcon(order.deliveryStatus)}
                              <span className="ml-1">
                                {order.deliveryStatus}
                              </span>
                            </span>
                          </div>
                          <div>
                            <span className="font-medium text-gray-600">
                              Date:
                            </span>
                            <span className="ml-2 text-gray-900">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Wishlist */}
              {selectedCustomer.wishlist.length > 0 && (
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-3">
                    Wishlist ({selectedCustomer.wishlist.length})
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedCustomer.wishlist.map((item) => (
                      <div
                        key={item.id}
                        className="bg-gray-50 p-3 rounded-lg border"
                      >
                        <div className="flex items-center space-x-3">
                          {item.product.image ? (
                            <img
                              src={
                                item.product.image.startsWith("http")
                                  ? item.product.image
                                  : `${window.location.origin}${item.product.image}`
                              }
                              alt={item.product.name}
                              className="w-12 h-12 rounded object-cover"
                              onError={(e) => {
                                console.log(
                                  "Modal image failed to load:",
                                  item.product.image
                                );
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 rounded bg-gray-200 flex items-center justify-center">
                              <span className="text-sm text-gray-500">?</span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {item.product.name}
                            </p>
                            <p className="text-gray-600">
                              {formatCurrency(item.product.price, "USD")}
                            </p>
                            <p className="text-xs text-gray-500">
                              Added{" "}
                              {new Date(item.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                onClick={() => setSelectedCustomer(null)}
                className="px-6 py-2.5 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
