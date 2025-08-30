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

// Customer pages with dynamic imports
export const Home = criticalCustomerImport(() => import("../pages/Home"));
export const Products = highPriorityCustomerImport(
  () => import("../pages/Products")
);
export const ProductDetail = highPriorityCustomerImport(
  () => import("../pages/ProductDetail")
);
export const Categories = highPriorityCustomerImport(
  () => import("../pages/Categories")
);
export const CategoryDetail = highPriorityCustomerImport(
  () => import("../pages/CategoryDetail")
);
export const Cart = criticalCustomerImport(() => import("../pages/Cart"));
export const Checkout = highPriorityCustomerImport(
  () => import("../pages/Checkout")
);
export const Wishlist = mediumPriorityCustomerImport(
  () => import("../pages/Wishlist")
);
export const Success = mediumPriorityCustomerImport(
  () => import("../pages/Success")
);
export const Cancel = mediumPriorityCustomerImport(
  () => import("../pages/Cancel")
);
export const About = mediumPriorityCustomerImport(
  () => import("../pages/About")
);
export const Contact = mediumPriorityCustomerImport(
  () => import("../pages/Contact")
);

// Customer routes with dynamic imports
export const customerRoutes = [
  {
    path: "",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "products",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Products />
      </Suspense>
    ),
  },
  {
    path: "products/:slug",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProductDetail />
      </Suspense>
    ),
  },
  {
    path: "categories",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Categories />
      </Suspense>
    ),
  },
  {
    path: "categories/:slug",
    element: (
      <Suspense fallback={<PageLoader />}>
        <CategoryDetail />
      </Suspense>
    ),
  },
  {
    path: "cart",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cart />
      </Suspense>
    ),
  },
  {
    path: "checkout",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Checkout />
      </Suspense>
    ),
  },
  {
    path: "wishlist",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Wishlist />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "success",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Success />
      </Suspense>
    ),
  },
  {
    path: "cancel",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cancel />
      </Suspense>
    ),
  },
  {
    path: "about",
    element: (
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "contact",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    ),
  },
];
