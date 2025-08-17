import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { 
  ShoppingCart, 
  Heart, 
  User, 
  LogOut, 
  Menu,
  Home,
  Package,
  Grid3X3,
  Info,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useClerkAuth } from '../hooks/useClerkAuth';
import SearchBar from './SearchBar';
import ThemeToggle from './ThemeToggle';
import WishlistHoverOverlay from './WishlistHoverOverlay';
import CartHoverSheet from './CartHoverSheet';

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  
  const { getTotalItems } = useCartStore();
  const { getWishlistCount } = useWishlistStore();
  const { user, isAuthenticated, signOut } = useClerkAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get wishlist count from store
  const wishlistCount = getWishlistCount();

  const navigationItems = [
    { path: '/', label: 'Home', icon: Home, color: 'from-blue-500 to-cyan-500' },
    { path: '/products', label: 'Products', icon: Package, color: 'from-purple-500 to-pink-500' },
    { path: '/categories', label: 'Categories', icon: Grid3X3, color: 'from-green-500 to-emerald-500' },
    { path: '/about', label: 'About', icon: Info, color: 'from-orange-500 to-red-500' },
    { path: '/contact', label: 'Contact', icon: MessageCircle, color: 'from-indigo-500 to-purple-500' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    // Clear cart when user logs out
    useCartStore.getState().clearCart();
    signOut();
    navigate('/');
  };

  const handleMenuClick = () => {
    setIsMobileMenuOpen(false);
  };

  const isActiveRoute = (path: string) => location.pathname === path;

  return (
    <>
      <header className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/30 shadow-2xl' 
          : 'bg-transparent'
      }`}>
        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="container mx-auto px-4 relative">
          <div className="flex items-center justify-between h-20">
            {/* Enhanced Logo */}
            <Link to="/" className="group relative">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-blue-500/25 transition-all duration-500 group-hover:scale-110">
                    <span className="text-white font-bold text-xl">E</span>
                  </div>
                  {/* Floating sparkles around logo */}
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Commerce
                  </span>
                  <div className="w-16 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
                </div>
              </div>
            </Link>

            {/* Enhanced Desktop Navigation */}
            <nav className="hidden xl:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                const isHovered = hoveredNav === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onMouseEnter={() => setHoveredNav(item.path)}
                    onMouseLeave={() => setHoveredNav(null)}
                    className={`group relative px-6 py-3 rounded-2xl transition-all duration-500 ${
                      isActive 
                        ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {/* Background glow effect */}
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-xl`}></div>
                    
                    {/* Icon and Label */}
                    <div className="flex items-center space-x-2 relative z-10">
                      <Icon className={`h-4 w-4 transition-all duration-300 ${
                        isActive || isHovered ? 'scale-110' : 'group-hover:scale-110'
                      }`} />
                      <span className="font-medium text-sm">{item.label}</span>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                    )}
                    
                    {/* Hover effect */}
                    {!isActive && (
                      <div className={`absolute inset-0 rounded-2xl border-2 border-transparent group-hover:border-gray-200 dark:group-hover:border-gray-600 transition-all duration-500 ${
                        isHovered ? 'scale-105' : 'scale-100'
                      }`}></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Enhanced Desktop Search */}
            <div className="hidden lg:flex flex-1 max-w-2xl mx-8">
              <div className="relative w-full">
                <SearchBar onResultSelect={() => {}} />
                {/* Search decoration */}
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced Desktop Actions */}
            <div className="hidden lg:flex items-center space-x-3">
              <ThemeToggle />
              
              <WishlistHoverOverlay>
                <Link to="/wishlist">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative group px-4 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-950/20 dark:hover:to-rose-950/20 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:fill-pink-500 group-hover:text-pink-500" />
                    {wishlistCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 animate-pulse z-10 bg-gradient-to-r from-pink-500 to-rose-500"
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </WishlistHoverOverlay>

              <CartHoverSheet>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative px-4 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCart className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />
                    {getTotalItems() > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 animate-pulse z-10 bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </div>
              </CartHoverSheet>

              {/* User Menu Dropdown */}
              {isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="relative group px-4 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 transition-all duration-300 hover:scale-105"
                    >
                      {user.imageUrl ? (
                        <img 
                          src={user.imageUrl} 
                          alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 transition-all duration-300 group-hover:scale-110" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-white/20 dark:border-gray-700/30 shadow-2xl"
                  >
                    <DropdownMenuLabel className="p-4">
                      <div className="flex items-center space-x-3">
                        {user.imageUrl ? (
                          <img 
                            src={user.imageUrl} 
                            alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'} 
                            className="w-10 h-10 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-2 border-purple-200 dark:border-purple-700">
                            <User className="h-5 w-5 text-white" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p 
                            className="font-semibold text-gray-900 dark:text-gray-100 truncate" 
                            title={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                          >
                            {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                          </p>
                          <p 
                            className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate" 
                            title={user.emailAddresses?.[0]?.emailAddress || 'No email'}
                          >
                            {user.emailAddresses?.[0]?.emailAddress || 'No email'}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/profile" className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span>View Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => {
                        // Clear cart when user logs out
                        useCartStore.getState().clearCart();
                        handleLogout();
                      }}
                      className="flex items-center space-x-3 p-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/20 dark:hover:to-pink-950/20 transition-all duration-300 text-red-600 dark:text-red-400"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="px-4 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300"
                    >
                      Login
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button 
                      size="sm"
                      className="px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
                    >
                      Sign Up
                    </Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle />
              
              <WishlistHoverOverlay>
                <Link to="/wishlist">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-950/20 dark:hover:to-rose-950/20 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:fill-pink-500 group-hover:text-pink-500" />
                    {wishlistCount > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10 bg-gradient-to-r from-pink-500 to-rose-500"
                      >
                        {wishlistCount > 99 ? '99+' : wishlistCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
              </WishlistHoverOverlay>

              <CartHoverSheet>
                <div className="relative">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="relative px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300 hover:scale-105"
                  >
                    <ShoppingCart className="h-5 w-5 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />
                    {getTotalItems() > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 animate-pulse z-10 bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        {getTotalItems()}
                      </Badge>
                    )}
                  </Button>
                </div>
              </CartHoverSheet>

              {/* Hamburger Menu Button */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsMobileMenuOpen(true)}
                className="relative group px-3 py-2 rounded-2xl hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50 dark:hover:from-purple-950/20 dark:hover:to-pink-950/20 transition-all duration-500 hover:scale-105 overflow-hidden"
              >
                <Menu className="h-5 w-5 transition-all duration-500 group-hover:rotate-180" />
                {/* Animated background */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-2xl scale-0 group-hover:scale-100 transition-transform duration-500" />
                {/* Floating elements */}
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                <div className="absolute -bottom-1 -left-1 w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
              </Button>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu - Sheet Component */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent 
          side="right" 
          className="w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/30 transition-all duration-700 ease-out"
        >
          {/* Enhanced Mobile Menu Header */}
          <SheetHeader className="relative">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Menu
              </SheetTitle>
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
              </div>
            </div>
            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"></div>
          </SheetHeader>
          
          <div className="mt-8 space-y-8 animate-in slide-in-from-right-2 duration-700 delay-200">
            {/* Enhanced Mobile Search */}
            <div className="animate-in slide-in-from-right-2 duration-500 delay-300">
              <div className="relative">
                <SearchBar onResultSelect={handleMenuClick} />
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced Main Navigation */}
            <nav className="space-y-2 animate-in slide-in-from-right-2 duration-500 delay-400">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = isActiveRoute(item.path);
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={handleMenuClick}
                    className={`group block p-4 rounded-2xl transition-all duration-500 hover:translate-x-3 hover:scale-105 ${
                      isActive 
                        ? `bg-gradient-to-r ${item.color} text-white shadow-lg` 
                        : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700'
                    }`}
                    style={{ animationDelay: `${400 + index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-white/20' 
                          : 'bg-gray-100 dark:bg-gray-800 group-hover:bg-gradient-to-r group-hover:from-blue-100 group-hover:to-purple-100'
                      }`}>
                        <Icon className={`h-5 w-5 transition-all duration-300 ${
                          isActive ? 'text-white' : 'text-gray-600 dark:text-gray-400 group-hover:text-blue-600'
                        }`} />
                      </div>
                      <span className={`font-medium transition-all duration-300 ${
                        isActive ? 'text-white' : 'text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white'
                      }`}>
                        {item.label}
                      </span>
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="w-8 h-1 bg-white rounded-full mt-2"></div>
                    )}
                  </Link>
                );
              })}
            </nav>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent h-px animate-in slide-in-from-right-2 duration-500 delay-600" />

            {/* Enhanced User Section */}
            <div className="animate-in slide-in-from-right-2 duration-500 delay-700">
              {isAuthenticated && user ? (
                <div className="space-y-4">
                  {/* Enhanced User Info Header */}
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 rounded-2xl border border-purple-200/50 dark:border-purple-700/30">
                    <div className="flex items-center space-x-4">
                      {user.imageUrl ? (
                        <div className="relative">
                          <img 
                            src={user.imageUrl} 
                            alt={`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-purple-200 dark:border-purple-700"
                          />
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center border-2 border-purple-200 dark:border-purple-700">
                            <User className="h-7 w-7 text-white" />
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-900"></div>
                        </div>
                      )}
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900 dark:text-gray-100 text-lg">
                          {`${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{user.emailAddresses?.[0]?.emailAddress || 'No email'}</p>
                        <div className="w-16 h-1 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full mt-2"></div>
                      </div>
                    </div>
                  </div>
                  
                  <Link
                    to="/profile"
                    onClick={handleMenuClick}
                    className="group flex items-center p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300 hover:translate-x-3 hover:scale-105"
                  >
                    <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-300">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <span className="ml-3 font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      View Profile
                    </span>
                  </Link>

                  <button
                    onClick={() => {
                      handleLogout();
                      handleMenuClick();
                    }}
                    className="group flex items-center w-full p-4 rounded-2xl hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 dark:hover:from-red-950/20 dark:hover:to-pink-950/20 transition-all duration-300 hover:translate-x-3 hover:scale-105"
                  >
                    <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30 group-hover:bg-red-200 dark:group-hover:bg-red-800/50 transition-all duration-300">
                      <LogOut className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <span className="ml-3 font-medium text-gray-700 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400">
                      Logout
                    </span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link
                    to="/login"
                    onClick={handleMenuClick}
                    className="group block p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300 hover:translate-x-3 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-all duration-300">
                        <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        Login
                      </span>
                    </div>
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleMenuClick}
                    className="group block p-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg transition-all duration-300 hover:translate-x-3 hover:scale-105"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-white/20">
                        <Sparkles className="h-5 w-5 text-white" />
                      </div>
                      <span className="font-medium">
                        Sign Up
                      </span>
                    </div>
                  </Link>
                </div>
              )}
            </div>

            <Separator className="bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent h-px animate-in slide-in-from-right-2 duration-500 delay-800" />

            {/* Enhanced Quick Actions */}
            <div className="grid grid-cols-2 gap-3 animate-in slide-in-from-right-2 duration-500 delay-1000">
              <WishlistHoverOverlay position="top">
                <Link to="/wishlist" onClick={handleMenuClick} className="group">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full relative p-4 rounded-2xl hover:bg-gradient-to-r hover:from-pink-50 hover:to-rose-50 dark:hover:from-pink-950/20 dark:hover:to-rose-950/20 transition-all duration-300 hover:scale-105 border border-pink-200 dark:border-pink-700/30"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <Heart className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:fill-pink-500 group-hover:text-pink-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-pink-600 dark:group-hover:text-pink-400">
                        Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10 bg-gradient-to-r from-pink-500 to-rose-500"
                        >
                          {wishlistCount > 99 ? '99+' : wishlistCount}
                        </Badge>
                      )}
                    </div>
                  </Button>
                </Link>
              </WishlistHoverOverlay>
              
              <Link to="/cart" onClick={handleMenuClick} className="group">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full relative p-4 rounded-2xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 dark:hover:from-blue-950/20 dark:hover:to-cyan-950/20 transition-all duration-300 hover:scale-105 border border-blue-200 dark:border-blue-700/30"
                >
                  <div className="flex flex-col items-center space-y-2">
                    <ShoppingCart className="h-6 w-6 transition-all duration-300 group-hover:scale-110 group-hover:text-blue-500" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      Cart
                    </span>
                    {getTotalItems() > 0 && (
                      <Badge 
                        variant="destructive" 
                        className="absolute -top-2 -right-2 h-5 w-5 p-0 text-xs font-medium flex items-center justify-center rounded-full min-w-0 z-10 bg-gradient-to-r from-blue-500 to-cyan-500"
                      >
                        {getTotalItems()}
                      </Badge>
                    )}
                  </div>
                </Button>
              </Link>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default Header;
