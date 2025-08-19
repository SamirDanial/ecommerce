export interface User {
  id: number;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  avatar?: string;
  phone?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProductVariant {
  id: number;
  productId: number;
  size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  color: string;
  colorCode?: string;
  stock: number;
  sku?: string;
  price?: number;
  comparePrice?: number;
  isActive: boolean;
  stockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  url: string;
  alt?: string;
  color?: string;
  sortOrder: number;
  isPrimary: boolean;
  createdAt: string;
}

export interface ProductCounts {
  variants: number;
  images: number;
  reviews: number;
  orderItems: number;
}

export interface ProductFilters {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  status?: string;
  featured?: string;
  onSale?: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export interface CreateProductData {
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  categoryId: number;
  slug?: string;
  sku?: string;
  barcode?: string;
  weight?: number;
  dimensions?: string;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice?: number;
  saleEndDate?: string;
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  variants?: Array<{
    size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
    color: string;
    colorCode?: string;
    stock: number;
    sku?: string;
    price?: number;
    comparePrice?: number;
    lowStockThreshold?: number;
    allowBackorder?: boolean;
  }>;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  featuredProducts: number;
  onSaleProducts: number;
}

export interface Review {
  id: number;
  userId: number;
  productId: number;
  rating: number;
  title?: string;
  comment?: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    name: string;
    avatar?: string;
  };
}

export interface ReviewReply {
  id: number;
  reviewId: number;
  userId: number;
  reply: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    name: string;
    avatar?: string;
  };
}

export interface Product {
  id: number;
  name: string;
  slug: string; // Required for routing and WishlistButton
  description?: string; // Optional for list view, required for detail view
  shortDescription?: string;
  price: number;
  comparePrice?: number;
  costPrice?: number;
  sku?: string;
  barcode?: string;
  categoryId?: number;
  isActive: boolean;
  isFeatured: boolean;
  isOnSale: boolean;
  salePrice?: number;
  saleEndDate?: string;
  weight?: number;
  dimensions?: string;
  tags?: string[]; // Optional for list view, required for detail view
  lowStockThreshold?: number;
  allowBackorder?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt?: string; // Optional for list view
  updatedAt?: string; // Optional for list view
  // Public page fields (optional for list view, required for detail view)
  category?: Category; // Optional for list view, required for detail view
  variants?: ProductVariant[]; // Optional for list view, loaded on demand
  images?: ProductImage[]; // Optional for list view, loaded on demand
  // New fields for optimized list view
  primaryImage?: {
    url: string;
    alt?: string;
  } | null;
  reviews?: Review[];
  averageRating?: number;
  reviewCount?: number;
  // Admin-specific fields (optional for public use)
  _count?: {
    variants: number;
    images: number;
    reviews: number;
    orderItems: number;
  };
  totalStock?: number;
  activeVariants?: number;
  hasLowStock?: boolean;
  hasOutOfStock?: boolean;
  overallStockStatus?: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' | 'BACKORDER';
  lowStockVariants?: number;
  outOfStockVariants?: number;
}

export interface CartItem {
  id: number;
  userId: number;
  productId: number;
  variantId?: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface WishlistItem {
  id: number;
  userId: number;
  productId: number;
  createdAt: string;
  product?: Product;
}

export interface Address {
  id: number;
  userId: number;
  type: 'SHIPPING' | 'BILLING';
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  variantId?: number;
  productName: string;
  productSku?: string;
  size?: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'XXXL';
  color?: string;
  quantity: number;
  price: number;
  total: number;
  createdAt: string;
  product?: Product;
  variant?: ProductVariant;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number;
  status: 'PENDING' | 'CONFIRMED' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED';
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: 'USD' | 'EUR' | 'PKR';
  language: 'ENGLISH' | 'URDU' | 'ARABIC';
  notes?: string;
  shippingAddressId?: number;
  billingAddressId?: number;
  paymentMethod: 'STRIPE' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  trackingNumber?: string;
  shippedAt?: string;
  deliveredAt?: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
  shippingAddress?: Address;
  billingAddress?: Address;
  items?: OrderItem[];
}

export interface Payment {
  id: number;
  orderId: number;
  amount: number;
  currency: 'USD' | 'EUR' | 'PKR';
  method: 'STRIPE' | 'CASH_ON_DELIVERY' | 'BANK_TRANSFER';
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  transactionId?: string;
  gatewayResponse?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountCode {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  value: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  isActive: boolean;
  startsAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashSale {
  id: number;
  title: string;
  description?: string;
  discountPercentage: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isFeatured: boolean;
  bannerColor?: string;
  createdAt: string;
  updatedAt: string;
  timeLeft?: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  };
}

export interface RecentlyViewed {
  id: number;
  userId: number;
  productId: number;
  viewedAt: string;
  product?: Product;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
