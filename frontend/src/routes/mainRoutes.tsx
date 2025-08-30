import React, { Suspense } from "react";
import { PageLoader } from "./index";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  Home,
  Products,
  ProductDetail,
  Categories,
  CategoryDetail,
  Wishlist,
  Cart,
  Checkout,
  Success,
  Cancel,
  ClerkLogin,
  ClerkRegister,
  VerifyEmail,
  UserProfile,
  About,
  Contact,
} from "./index";

export const mainRoutes = [
  {
    path: "", // Changed from "/" to "" for index route
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
    path: "login",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ClerkLogin />
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
