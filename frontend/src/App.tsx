import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import Header from "./components/Header";
import ThemeProvider from "./components/ThemeProvider";
import ClerkProvider from "./components/ClerkProvider";
import ClerkSessionManager from "./components/ClerkSessionManager";
import SessionRecovery from "./components/SessionRecovery";
import AdminRoute from "./components/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import GlobalWishlistLoader from "./components/GlobalWishlistLoader";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import { AuthRedirectWrapper } from "./components/AuthRedirectWrapper";
import ChatWidget from "./components/ChatWidget";
import { SmartPreloader } from "./components/SmartPreloader";
import { adminRoutes } from "./routes/adminRoutes";
import { mainRoutes } from "./routes/mainRoutes";
import {
  Home,
  Products,
  ProductDetail,
  Categories,
  CategoryDetail,
  Wishlist,
  Cart,
  Checkout,
  About,
  Contact,
  Admin,
  AdminProducts,
  AdminCategories,
} from "./routes";
import "./App.css";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Define preload priorities
const preloadComponents = [
  // High priority - essential pages
  { name: "Home", component: Home, priority: "high" as const },
  { name: "Products", component: Products, priority: "high" as const },
  { name: "Cart", component: Cart, priority: "high" as const },

  // Medium priority - commonly accessed
  {
    name: "ProductDetail",
    component: ProductDetail,
    priority: "medium" as const,
  },
  { name: "Categories", component: Categories, priority: "medium" as const },
  {
    name: "CategoryDetail",
    component: CategoryDetail,
    priority: "medium" as const,
  },
  { name: "Checkout", component: Checkout, priority: "medium" as const },
  { name: "About", component: About, priority: "medium" as const },
  { name: "Contact", component: Contact, priority: "medium" as const },

  // Low priority - less frequently accessed
  { name: "Wishlist", component: Wishlist, priority: "low" as const },
  { name: "Admin", component: Admin, priority: "low" as const },
  { name: "AdminProducts", component: AdminProducts, priority: "low" as const },
  {
    name: "AdminCategories",
    component: AdminCategories,
    priority: "low" as const,
  },
];

// Main site layout component
const MainSiteLayout = () => (
  <div className="App">
    <GlobalWishlistLoader />
    <Header />
    <main>
      <Routes>
        {mainRoutes.map((route, index) => (
          <Route key={index} path={route.path} element={route.element} />
        ))}
      </Routes>
    </main>
    <Toaster position="top-right" richColors />
    <ChatWidget />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <ClerkSessionManager />
        <SessionRecovery />
        <ThemeProvider>
          <CurrencyProvider>
            <NotificationProvider>
              <SmartPreloader preloadComponents={preloadComponents}>
                <Router>
                  <AuthRedirectWrapper>
                    <Routes>
                      {/* Admin Routes - No Header/Footer */}
                      <Route
                        path="/admin/*"
                        element={
                          <AdminRoute>
                            <AdminLayout />
                          </AdminRoute>
                        }
                      >
                        {adminRoutes.map((route, index) => (
                          <Route
                            key={index}
                            path={route.path}
                            element={route.element}
                          />
                        ))}
                      </Route>

                      {/* Main Site Routes - With Header/Footer */}
                      <Route path="/*" element={<MainSiteLayout />} />
                    </Routes>
                  </AuthRedirectWrapper>
                </Router>
              </SmartPreloader>
            </NotificationProvider>
          </CurrencyProvider>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default App;
