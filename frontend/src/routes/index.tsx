import { lazy } from "react";
import { createPreloadableComponent } from "../components/PreloadableComponent";

// Loading Components
export const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

export const AdminPageLoader = () => (
  <div className="flex items-center justify-center min-h-[600px]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
  </div>
);

// Lazy load all pages with error boundaries and preloading
const lazyLoad = (importFunc: () => Promise<any>) => {
  return createPreloadableComponent(() =>
    importFunc().catch((err) => {
      console.error("Error loading component:", err);
      return import("../components/ErrorBoundary");
    })
  );
};

// Main pages
export const Home = lazyLoad(() => import("../pages/Home"));
export const Products = lazyLoad(() => import("../pages/Products"));
export const ProductDetail = lazyLoad(() => import("../pages/ProductDetail"));
export const Categories = lazyLoad(() => import("../pages/Categories"));
export const CategoryDetail = lazyLoad(() => import("../pages/CategoryDetail"));
export const Wishlist = lazyLoad(() => import("../pages/Wishlist"));
export const Cart = lazyLoad(() => import("../pages/Cart"));
export const Checkout = lazyLoad(() => import("../pages/Checkout"));
export const Success = lazyLoad(() => import("../pages/Success"));
export const Cancel = lazyLoad(() => import("../pages/Cancel"));
export const ClerkLogin = lazyLoad(() => import("../pages/ClerkLogin"));
export const ClerkRegister = lazyLoad(() => import("../pages/ClerkRegister"));
export const VerifyEmail = lazyLoad(() => import("../pages/VerifyEmail"));
export const UserProfile = lazyLoad(() => import("../pages/UserProfile"));
export const About = lazyLoad(() => import("../pages/About"));
export const Contact = lazyLoad(() => import("../pages/Contact"));

// Admin pages
export const Admin = lazyLoad(() => import("../pages/Admin"));
export const AdminProducts = lazyLoad(() => import("../pages/admin/Products"));
export const AdminCategories = lazyLoad(
  () => import("../pages/admin/Categories")
);
export const AdminOrders = lazyLoad(() => import("../pages/admin/Orders"));
export const Customers = lazyLoad(() => import("../pages/admin/Customers"));
export const ReviewManagement = lazyLoad(
  () => import("../pages/admin/ReviewManagement")
);
export const QuestionManagement = lazyLoad(
  () => import("../pages/admin/QuestionManagement")
);
export const AdminAnalytics = lazyLoad(
  () => import("../pages/admin/Analytics")
);
export const ChatManagement = lazyLoad(
  () => import("../components/admin/ChatManagement")
);
export const AdminLocalization = lazyLoad(
  () => import("../pages/admin/Localization")
);
export const AdminTaxShipping = lazyLoad(
  () => import("../pages/admin/TaxShipping")
);
export const AdminDeliveryScope = lazyLoad(
  () => import("../pages/admin/DeliveryScope")
);
export const CurrencyManagement = lazyLoad(
  () => import("../pages/admin/CurrencyManagement")
);
export const Notifications = lazyLoad(
  () => import("../pages/admin/Notifications")
);
