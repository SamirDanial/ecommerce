import React, { Suspense } from "react";
import { PageLoader } from "./index";
import {
  Admin,
  AdminProducts,
  AdminCategories,
  AdminOrders,
  Customers,
  AdminAnalytics,
  AdminLocalization,
  AdminTaxShipping,
  AdminDeliveryScope,
  CurrencyManagement,
  Notifications,
  QuestionManagement,
  ReviewManagement,
  ChatManagement,
} from "./index";

export const adminRoutes = [
  {
    path: "", // Changed from "/" to "" for index route
    element: (
      <Suspense fallback={<PageLoader />}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: "products",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminProducts />
      </Suspense>
    ),
  },
  {
    path: "categories",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminCategories />
      </Suspense>
    ),
  },
  {
    path: "orders",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminOrders />
      </Suspense>
    ),
  },
  {
    path: "customers",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Customers />
      </Suspense>
    ),
  },
  {
    path: "reviews",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ReviewManagement />
      </Suspense>
    ),
  },
  {
    path: "questions",
    element: (
      <Suspense fallback={<PageLoader />}>
        <QuestionManagement />
      </Suspense>
    ),
  },
  {
    path: "chat",
    element: (
      <Suspense fallback={<PageLoader />}>
        <ChatManagement />
      </Suspense>
    ),
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminAnalytics />
      </Suspense>
    ),
  },
  {
    path: "localization",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminLocalization />
      </Suspense>
    ),
  },
  {
    path: "tax-shipping",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminTaxShipping />
      </Suspense>
    ),
  },
  {
    path: "delivery-scope",
    element: (
      <Suspense fallback={<PageLoader />}>
        <AdminDeliveryScope />
      </Suspense>
    ),
  },
  {
    path: "currency",
    element: (
      <Suspense fallback={<PageLoader />}>
        <CurrencyManagement />
      </Suspense>
    ),
  },
  {
    path: "notifications",
    element: (
      <Suspense fallback={<PageLoader />}>
        <Notifications />
      </Suspense>
    ),
  },
];
