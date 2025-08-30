import React, { Suspense } from "react";
import {
  criticalCustomerImport,
  highPriorityCustomerImport,
  mediumPriorityCustomerImport,
} from "../utils/customerDynamicImports";
import ProtectedRoute from "../components/ProtectedRoute";

// Loading Components
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

// Customer pages with dynamic imports (priority-based)
export const Home = criticalCustomerImport(
  () => import("../pages/Home"),
  "Home"
);

export const Products = highPriorityCustomerImport(
  () => import("../pages/Products"),
  "Products"
);

export const ProductDetail = highPriorityCustomerImport(
  () => import("../pages/ProductDetail"),
  "ProductDetail"
);

export const Categories = highPriorityCustomerImport(
  () => import("../pages/Categories"),
  "Categories"
);

export const CategoryDetail = highPriorityCustomerImport(
  () => import("../pages/CategoryDetail"),
  "CategoryDetail"
);

export const Cart = criticalCustomerImport(
  () => import("../pages/Cart"),
  "Cart"
);

export const Checkout = highPriorityCustomerImport(
  () => import("../pages/Checkout"),
  "Checkout"
);

export const Wishlist = mediumPriorityCustomerImport(
  () => import("../pages/Wishlist"),
  "Wishlist"
);

export const Success = mediumPriorityCustomerImport(
  () => import("../pages/Success"),
  "Success"
);

export const Cancel = mediumPriorityCustomerImport(
  () => import("../pages/Cancel"),
  "Cancel"
);

export const About = mediumPriorityCustomerImport(
  () => import("../pages/About"),
  "About"
);

export const Contact = mediumPriorityCustomerImport(
  () => import("../pages/Contact"),
  "Contact"
);

// Customer routes with dynamic imports
export const customerRoutes = [
  {
    path: "", // Home page - critical priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "products", // Products page - high priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Products />
      </Suspense>
    ),
  },
  {
    path: "products/:slug", // Product Detail page - high priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProductDetail />
      </Suspense>
    ),
  },
  {
    path: "categories", // Categories page - high priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Categories />
      </Suspense>
    ),
  },
  {
    path: "categories/:slug", // Category Detail page - high priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <CategoryDetail />
      </Suspense>
    ),
  },
  {
    path: "cart", // Cart page - critical priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cart />
      </Suspense>
    ),
  },
  {
    path: "checkout", // Checkout page - high priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Checkout />
      </Suspense>
    ),
  },
  {
    path: "wishlist", // Wishlist page - medium priority
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Wishlist />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "success", // Success page - medium priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Success />
      </Suspense>
    ),
  },
  {
    path: "cancel", // Cancel page - medium priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cancel />
      </Suspense>
    ),
  },
  {
    path: "about", // About page - medium priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "contact", // Contact page - medium priority
    element: (
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    ),
  },
];
