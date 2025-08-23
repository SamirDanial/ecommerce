import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ThemeProvider from './components/ThemeProvider';
import ClerkProvider from './components/ClerkProvider';
import ClerkSessionManager from './components/ClerkSessionManager';
import SessionRecovery from './components/SessionRecovery';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './components/admin/AdminLayout';
import GlobalWishlistLoader from './components/GlobalWishlistLoader';
import { CurrencyProvider } from './contexts/CurrencyContext';

import { AuthRedirectWrapper } from './components/AuthRedirectWrapper';
import Home from './pages/Home';
import Admin from './pages/Admin';
import AdminProducts from './pages/admin/Products';
import AdminCategories from './pages/admin/Categories';
import AdminOrders from './pages/admin/Orders';
import AdminAnalytics from './pages/admin/Analytics';
import AdminLocalization from './pages/admin/Localization';
import AdminTaxShipping from './pages/admin/TaxShipping';
import AdminDeliveryScope from './pages/admin/DeliveryScope';
import CurrencyManagement from './pages/admin/CurrencyManagement';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import ClerkLogin from './pages/ClerkLogin';
import ClerkRegister from './pages/ClerkRegister';
import VerifyEmail from './pages/VerifyEmail';
import UserProfile from './pages/UserProfile';
import About from './pages/About';
import Contact from './pages/Contact';
import './App.css';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ClerkProvider>
        <ClerkSessionManager />
        <SessionRecovery />
        <ThemeProvider>
          <CurrencyProvider>
            <Router>
              <AuthRedirectWrapper>
                <Routes>
                  {/* Admin Routes - No Header/Footer */}
                  <Route path="/admin/*" element={
                    <AdminRoute>
                      <AdminLayout />
                    </AdminRoute>
                  }>
                    <Route index element={<Admin />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="categories" element={<AdminCategories />} />
                    <Route path="orders" element={<AdminOrders />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="localization" element={<AdminLocalization />} />
                    <Route path="tax-shipping" element={<AdminTaxShipping />} />
                    <Route path="delivery-scope" element={<AdminDeliveryScope />} />
                                          <Route path="currency" element={<CurrencyManagement />} />
                  </Route>
                  
                  {/* Main Site Routes - With Header/Footer */}
                  <Route path="/*" element={
                    <div className="App">
                      <GlobalWishlistLoader />
                      <Header />
                      <main>
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/products" element={<Products />} />
                          <Route path="/products/:slug" element={<ProductDetail />} />
                          <Route path="/categories" element={<Categories />} />
                          <Route path="/categories/:slug" element={<CategoryDetail />} />
                          <Route path="/wishlist" element={
                            <ProtectedRoute>
                              <Wishlist />
                            </ProtectedRoute>
                          } />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/checkout" element={<Checkout />} />
                          <Route path="/success" element={<Success />} />
                          <Route path="/cancel" element={<Cancel />} />
                          <Route path="/login" element={<ClerkLogin />} />
                          <Route path="/login/factor-one" element={<ClerkLogin />} />
                          <Route path="/register" element={<ClerkRegister />} />
                          <Route path="/register/verify-email-address" element={<VerifyEmail />} />
                          <Route path="/profile" element={
                            <ProtectedRoute>
                              <UserProfile />
                            </ProtectedRoute>
                          } />
                          <Route path="/about" element={<About />} />
                          <Route path="/contact" element={<Contact />} />
                        </Routes>
                      </main>
                      <Toaster position="top-right" richColors />
                    </div>
                  } />
                </Routes>
              </AuthRedirectWrapper>
            </Router>
          </CurrencyProvider>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default App;
