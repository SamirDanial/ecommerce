import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  Settings, 
  LogOut, 
  Menu
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';

import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import { useCartStore } from '../stores/cartStore';
import { useUserInteractionStore } from '../stores/userInteractionStore';
import { useClerkAuth } from '../hooks/useClerkAuth';



const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const { getTotalItems } = useCartStore();
  const { wishlist } = useUserInteractionStore();
  const { user, isAuthenticated, signOut, isLoaded } = useClerkAuth();
  const navigate = useNavigate();

  // Simple wishlist count state
  const [wishlistCount, setWishlistCount] = useState(0);

  // Force re-render when authentication state changes
  useEffect(() => {
    if (isLoaded) {
      setForceUpdate(prev => prev + 1);
    }
  }, [isAuthenticated, user, isLoaded]);

  // Listen for custom authentication change events
  useEffect(() => {
    const handleAuthChange = () => {
      setForceUpdate(prev => prev + 1);
    };

    window.addEventListener('clerk-auth-changed', handleAuthChange);
    
    return () => {
      window.removeEventListener('clerk-auth-changed', handleAuthChange);
    };
  }, []);


  // Check initial state on mount
  useEffect(() => {
    // Check localStorage on mount for initial wishlist count
    const wishlistStore = localStorage.getItem('wishlist-store');
    const userInteractionStore = localStorage.getItem('user-interaction-store');
    
    if (wishlistStore) {
      try {
        const parsed = JSON.parse(wishlistStore);
        if (wishlist.length === 0 && parsed?.wishlist?.length > 0) {
          setWishlistCount(parsed.wishlist.length);
        }
      } catch (error) {
        console.error('Error parsing wishlist-store:', error);
      }
    }
    
    if (userInteractionStore) {
      try {
        const parsed = JSON.parse(userInteractionStore);
        if (wishlist.length === 0 && parsed?.wishlist?.length > 0) {
          setWishlistCount(parsed.wishlist.length);
        }
      } catch (error) {
        console.error('Error parsing user-interaction-store:', error);
      }
    }
  }, [wishlist]);

  // Update wishlist count whenever wishlist changes
  useEffect(() => {
    // Get count from store first, fallback to localStorage
    let count = wishlist.length;
    
    // If store is empty, check localStorage
    if (count === 0) {
      // Check both possible localStorage keys
      const wishlistStore = localStorage.getItem('wishlist-store');
      const userInteractionStore = localStorage.getItem('user-interaction-store');
      
      if (wishlistStore) {
        try {
          const parsed = JSON.parse(wishlistStore);
          if (parsed?.wishlist?.length > 0) {
            count = parsed.wishlist.length;
          }
        } catch (error) {
          console.error('Error parsing wishlist-store:', error);
        }
      }
      
      if (userInteractionStore) {
        try {
          const parsed = JSON.parse(userInteractionStore);
          if (parsed?.wishlist?.length > 0) {
            count = parsed.wishlist.length;
          }
        } catch (error) {
          console.error('Error parsing user-interaction-store:', error);
        }
      }
    }
    
    setWishlistCount(count);
  }, [wishlist]);

  // Listen for storage changes (cross-tab updates)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'wishlist-store' || e.key === 'user-interaction-store') {
        if (e.newValue) {
          try {
            const parsed = JSON.parse(e.newValue);
            const newCount = parsed?.wishlist?.length || 0;
            setWishlistCount(newCount);
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);





  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);



  const handleLogout = () => {
    signOut();
    navigate('/');
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <header className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b' 
          : 'bg-background'
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">E</span>
              </div>
              <span className="text-xl font-bold">Commerce</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Link to="/" className="text-sm font-medium hover:text-primary transition-colors">
                Home
              </Link>
              <Link to="/products" className="text-sm font-medium hover:text-primary transition-colors">
                Products
              </Link>
              <Link to="/categories" className="text-sm font-medium hover:text-primary transition-colors">
                Categories
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-primary transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-primary transition-colors">
                Contact
              </Link>
            </nav>

            {/* Desktop Search */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <SearchBar onResultSelect={() => {}} />
            </div>

                        {/* Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-4">
              <ThemeToggle />
              
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10"
                    >
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>

              {isAuthenticated && user ? (
                <div className="flex items-center space-x-2">
                  <Link to="/profile">
                    <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors cursor-pointer">
                      {user.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'} 
                          className="w-8 h-8 rounded-full object-cover border-2 border-primary/20"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-foreground hidden sm:block">
                        {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                      </span>
                    </div>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button variant="default" size="sm">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle />
              
              <Link to="/wishlist" className="relative">
                <Button variant="ghost" size="sm">
                  <Heart className="h-4 w-4" />
                  {wishlistCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10"
                    >
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Link to="/cart" className="relative">
                <Button variant="ghost" size="sm">
                  <ShoppingCart className="h-4 w-4" />
                  {getTotalItems() > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10"
                    >
                      {getTotalItems()}
                    </Badge>
                  )}
                </Button>
              </Link>

              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="group relative overflow-hidden transition-all duration-300 hover:scale-105 hover:bg-primary/10"
                  >
                    <Menu className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                    <div className="absolute inset-0 bg-primary/5 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300" />
                  </Button>
                </SheetTrigger>
                <SheetContent 
                  side="right" 
                  className="w-80 transition-all duration-500 ease-out"
                  {...({} as any)}
                >
                  <SheetHeader className="animate-in slide-in-from-top-2 duration-500">
                    <SheetTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                      Menu
                    </SheetTitle>
                  </SheetHeader>
                  
                  <div className="mt-6 space-y-6 animate-in slide-in-from-right-2 duration-700 delay-200">
                    {/* Mobile Search */}
                    <div className="animate-in slide-in-from-right-2 duration-500 delay-300">
                      <SearchBar onResultSelect={handleMenuClick} />
                    </div>

                    {/* Main Navigation */}
                    <nav className="space-y-3 animate-in slide-in-from-right-2 duration-500 delay-400">
                      <Link
                        to="/"
                        onClick={handleMenuClick}
                        className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                        style={{ animationDelay: "400ms" }}
                      >
                        <span className="transition-all duration-300 group-hover:font-medium">Home</span>
                      </Link>
                      <Link
                        to="/products"
                        onClick={handleMenuClick}
                        className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                        style={{ animationDelay: "500ms" }}
                      >
                        <span className="transition-all duration-300 group-hover:font-medium">Products</span>
                      </Link>
                      <Link
                        to="/categories"
                        onClick={handleMenuClick}
                        className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                        style={{ animationDelay: "600ms" }}
                      >
                        <span className="transition-all duration-300 group-hover:font-medium">Categories</span>
                      </Link>
                      <Link
                        to="/about"
                        onClick={handleMenuClick}
                        className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                        style={{ animationDelay: "700ms" }}
                      >
                        <span className="transition-all duration-300 group-hover:font-medium">About</span>
                      </Link>
                      <Link
                        to="/contact"
                        onClick={handleMenuClick}
                        className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                        style={{ animationDelay: "800ms" }}
                      >
                        <span className="transition-all duration-300 group-hover:font-medium">Contact</span>
                      </Link>
                    </nav>

                    <Separator className="animate-in slide-in-from-right-2 duration-500 delay-600" />



                    {/* User Section */}
                    <div className="animate-in slide-in-from-right-2 duration-500 delay-700">
                      {isAuthenticated && user ? (
                        <div className="space-y-3">
                          {/* User Info Header */}
                          <div className="flex items-center space-x-3 p-3 bg-accent/50 rounded-lg">
                            {user.imageUrl ? (
                              <img 
                                src={user.imageUrl} 
                                alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-primary/20"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border-2 border-primary/20">
                                <User className="h-6 w-6 text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-medium text-foreground">{`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}</p>
                              <p className="text-sm text-muted-foreground">{user.primaryEmailAddress?.emailAddress || 'No email'}</p>
                            </div>
                          </div>
                          
                          <Link
                            to="/profile"
                            onClick={handleMenuClick}
                            className="group flex items-center text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                            style={{ animationDelay: "800ms" }}
                          >
                            <User className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <span className="transition-all duration-300 group-hover:font-medium">View Profile</span>
                          </Link>
                          <Link
                            to="/settings"
                            onClick={handleMenuClick}
                            className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                            style={{ animationDelay: "900ms" }}
                          >
                            <Settings className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <span className="transition-all duration-300 group-hover:font-medium">Settings</span>
                          </Link>
                          <button
                            onClick={() => {
                              handleLogout();
                              handleMenuClick();
                            }}
                            className="group flex items-center w-full text-sm text-destructive hover:text-destructive/80 transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-destructive/5"
                            style={{ animationDelay: "1000ms" }}
                          >
                            <LogOut className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <span className="transition-all duration-300 group-hover:font-medium">Logout</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <Link
                            to="/login"
                            onClick={handleMenuClick}
                            className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                            style={{ animationDelay: "800ms" }}
                          >
                            <span className="transition-all duration-300 group-hover:font-medium">Login</span>
                          </Link>
                          <Link
                            to="/register"
                            onClick={handleMenuClick}
                            className="group block text-sm hover:text-primary transition-all duration-300 hover:translate-x-2 hover:scale-105 p-2 rounded-lg hover:bg-primary/5"
                            style={{ animationDelay: "900ms" }}
                          >
                            <span className="transition-all duration-300 group-hover:font-medium">Sign Up</span>
                          </Link>
                        </div>
                      )}
                    </div>

                    <Separator className="animate-in slide-in-from-right-2 duration-500 delay-800" />

                    {/* Quick Actions */}
                    <div className="flex items-center space-x-4 animate-in slide-in-from-right-2 duration-500 delay-1000">
                      <Link to="/wishlist" onClick={handleMenuClick} className="flex-1 group">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full relative transition-all duration-300 hover:scale-105 hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:border-pink-200 dark:hover:border-pink-800"
                        >
                          <Heart className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:fill-pink-500 group-hover:text-pink-500" />
                          Wishlist
                          {wishlistCount > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 animate-pulse z-10"
                            >
                              {wishlistCount > 99 ? '99+' : wishlistCount}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                      <Link to="/cart" onClick={handleMenuClick} className="flex-1 group">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="w-full relative transition-all duration-300 hover:scale-105 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-200 dark:hover:border-blue-800"
                        >
                          <ShoppingCart className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />
                          Cart
                          {getTotalItems() > 0 && (
                            <Badge 
                              variant="destructive" 
                              className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 animate-pulse z-10"
                            >
                              {getTotalItems()}
                            </Badge>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
