import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import Header from './components/Header';
import ThemeProvider from './components/ThemeProvider';
import ClerkProvider from './components/ClerkProvider';
import ProtectedRoute from './components/ProtectedRoute';
import GlobalWishlistLoader from './components/GlobalWishlistLoader';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Categories from './pages/Categories';
import CategoryDetail from './pages/CategoryDetail';
import Wishlist from './pages/Wishlist';
import Cart from './pages/Cart';
import ClerkLogin from './pages/ClerkLogin';
import ClerkRegister from './pages/ClerkRegister';
import VerifyEmail from './pages/VerifyEmail';
import UserProfile from './pages/UserProfile';
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
        <ThemeProvider>
          <Router>
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
                  <Route path="/cart" element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  } />
                  <Route path="/login" element={<ClerkLogin />} />
                  <Route path="/login/factor-one" element={<ClerkLogin />} />
                  <Route path="/register" element={<ClerkRegister />} />
                  <Route path="/register/verify-email-address" element={<VerifyEmail />} />
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Toaster position="top-right" richColors />
            </div>
          </Router>
        </ThemeProvider>
      </ClerkProvider>
    </QueryClientProvider>
  );
}

export default App;
