import React, { Suspense } from "react";
import { PageLoader } from "./index";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Home,
  Products,
  ProductDetail,
  Categories,
  CategoryDetail,
  Cart,
  Checkout,
  Wishlist,
  Success,
  Cancel,
  About,
  Contact,
} from "./customerRoutes"; // Import all customer pages from customer routes
import { ClerkLogin, ClerkRegister, VerifyEmail, UserProfile } from "./index";

export const mainRoutes = [
  {
    path: "", // Home page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Home />
      </Suspense>
    ),
  },
  {
    path: "products", // Products page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Products />
      </Suspense>
    ),
  },
  {
    path: "products/:slug", // Product Detail page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <ProductDetail />
      </Suspense>
    ),
  },
  {
    path: "categories", // Categories page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Categories />
      </Suspense>
    ),
  },
  {
    path: "categories/:slug", // Category Detail page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <CategoryDetail />
      </Suspense>
    ),
  },
  {
    path: "wishlist", // Wishlist page - now using customer dynamic import
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <Wishlist />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "cart", // Cart page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cart />
      </Suspense>
    ),
  },
  {
    path: "checkout", // Checkout page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Checkout />
      </Suspense>
    ),
  },
  {
    path: "success", // Success page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Success />
      </Suspense>
    ),
  },
  {
    path: "cancel", // Cancel page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Cancel />
      </Suspense>
    ),
  },
  {
    path: "login/factor-one",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ClerkLogin />
      </Suspense>
    ),
  },
  {
    path: "register",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ClerkRegister />
      </Suspense>
    ),
  },
  {
    path: "register/verify-email-address",
    element: (
      <Suspense fallback={<PageLoader />}>
        <VerifyEmail />
      </Suspense>
    ),
  },
  {
    path: "profile",
    element: (
      <ProtectedRoute>
        <Suspense fallback={<PageLoader />}>
          <UserProfile />
        </Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "about", // About page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <About />
      </Suspense>
    ),
  },
  {
    path: "contact", // Contact page - now using customer dynamic import
    element: (
      <Suspense fallback={<PageLoader />}>
        <Contact />
      </Suspense>
    ),
  },
];
