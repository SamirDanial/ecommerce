import React, { Suspense } from "react";
import { Route } from "react-router-dom";
import { AdminPageLoader } from "./index";
import {
  Admin,
  AdminProducts,
  AdminCategories,
  AdminOrders,
  Customers,
  ReviewManagement,
  QuestionManagement,
  AdminAnalytics,
  ChatManagement,
  AdminLocalization,
  AdminTaxShipping,
  AdminDeliveryScope,
  CurrencyManagement,
  Notifications,
} from "./index";

export const adminRoutes = [
  {
    path: "", // Changed from "/" to "" for index route
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <Admin />
      </Suspense>
    ),
  },
  {
    path: "products",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminProducts />
      </Suspense>
    ),
  },
  {
    path: "categories",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminCategories />
      </Suspense>
    ),
  },
  {
    path: "orders",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminOrders />
      </Suspense>
    ),
  },
  {
    path: "customers",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <Customers />
      </Suspense>
    ),
  },
  {
    path: "reviews",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <ReviewManagement />
      </Suspense>
    ),
  },
  {
    path: "questions",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <QuestionManagement />
      </Suspense>
    ),
  },
  {
    path: "chat",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <ChatManagement />
      </Suspense>
    ),
  },
  {
    path: "analytics",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminAnalytics />
      </Suspense>
    ),
  },
  {
    path: "localization",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminLocalization />
      </Suspense>
    ),
  },
  {
    path: "tax-shipping",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminTaxShipping />
      </Suspense>
    ),
  },
  {
    path: "delivery-scope",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <AdminDeliveryScope />
      </Suspense>
    ),
  },
  {
    path: "currency",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <CurrencyManagement />
      </Suspense>
    ),
  },
  {
    path: "notifications",
    element: (
      <Suspense fallback={<AdminPageLoader />}>
        <Notifications />
      </Suspense>
    ),
  },
];
