import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Globe, 
  LogOut,
  Menu,
  X,
  Home,
  ChevronLeft,
  ChevronRight,
  FolderOpen,
  BarChart3,
  DollarSign,
  Truck,
  Languages
} from 'lucide-react';
import { useClerkAuth } from '../../hooks/useClerkAuth';
import { useSidebarStore } from '../../stores/sidebarStore';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Toaster } from 'sonner';


const AdminLayout: React.FC = () => {
  const { signOut } = useClerkAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const { 
    isCollapsed, 
    toggleCollapsed, 
    expand
  } = useSidebarStore();

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Close mobile sidebar when clicking outside
  const mobileSidebarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileSidebarRef.current && !mobileSidebarRef.current.contains(event.target as Node)) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (isMobileSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileSidebarOpen]);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/admin',
      icon: LayoutDashboard,
      current: location.pathname === '/admin',
      description: 'Overview and analytics'
    },
    {
      name: 'Products',
      href: '/admin/products',
      icon: Package,
      current: location.pathname.startsWith('/admin/products'),
      description: 'Manage inventory',
      badge: 'New'
    },
    {
      name: 'Categories',
      href: '/admin/categories',
      icon: FolderOpen,
      current: location.pathname.startsWith('/admin/categories'),
      description: 'Category management'
    },
    {
      name: 'Orders',
      href: '/admin/orders',
      icon: ShoppingCart,
      current: location.pathname.startsWith('/admin/orders'),
      description: 'Order management',
      badge: '12'
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: location.pathname.startsWith('/admin/analytics'),
      description: 'Advanced charts & insights',
      badge: 'Charts'
    },
    {
      name: 'Localization',
      href: '/admin/localization',
      icon: Languages,
      current: location.pathname.startsWith('/admin/localization'),
      description: 'Languages & currencies'
    },
    {
      name: 'Tax & Shipping',
      href: '/admin/tax-shipping',
      icon: DollarSign,
      current: location.pathname.startsWith('/admin/tax-shipping'),
      description: 'Tax rates & shipping costs'
    },
    {
      name: 'Delivery Scope',
      href: '/admin/delivery-scope',
      icon: Globe,
      current: location.pathname.startsWith('/admin/delivery-scope'),
      description: 'Business delivery configuration'
    }
  ];

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  const goToMainSite = () => {
    navigate('/');
  };

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Calculate sidebar positioning and content layout
  const sidebarWidthClass = isCollapsed ? 'w-16' : 'w-80';

  // Mobile sidebar classes
  const mobileSidebarClass = isMobileSidebarOpen 
    ? 'translate-x-0' 
    : '-translate-x-full';

  // Handle navigation item click
  const handleNavigationClick = (href: string) => {
    // Always navigate - don't collapse sidebar
    navigate(href);
    
    // Don't auto-collapse when menu items are clicked
    // Sidebar stays open for easy navigation between sections
  };



  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
      {/* Sidebar header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-lg">A</span>
          </div>
          {!isCollapsed && (
            <div>
              <span className="text-xl font-bold text-gray-900">Admin</span>
              <p className="text-xs text-gray-500">Dashboard</p>
            </div>
          )}
        </div>
        {!isCollapsed && (
          <button
            onClick={toggleCollapsed}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

             {/* Navigation */}
       <nav className="flex-1 px-3 py-4 overflow-y-auto">
         <div className="space-y-1">
           {navigation.map((item) => {
             const Icon = item.icon;
             return (
                               <button
                  key={item.name}
                  onClick={() => handleNavigationClick(item.href)}
                  className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left ${
                    item.current
                      ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md'
                  }`}
                  title={isCollapsed ? item.name : undefined}
                >
                 {/* Active indicator */}
                 {item.current && !isCollapsed && (
                   <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                 )}
                 
                 <Icon
                   className={`h-5 w-5 ${
                     isCollapsed ? 'mx-auto' : 'mr-3'
                   } ${
                     item.current 
                       ? 'text-white' 
                       : 'text-gray-400 group-hover:text-gray-600'
                   }`}
                 />
                 
                 {!isCollapsed && (
                   <div className="flex-1 min-w-0">
                     <div className="flex items-center justify-between">
                       <span className="truncate">{item.name}</span>
                       {item.badge && (
                         <Badge variant={item.badge === 'New' ? 'secondary' : 'default'} className="ml-2">
                           {item.badge}
                         </Badge>
                       )}
                     </div>
                     <p className={`text-xs truncate ${
                       item.current ? 'text-purple-100' : 'text-gray-500'
                     }`}>
                       {item.description}
                     </p>
                   </div>
                 )}
               </button>
             );
           })}
         </div>
       </nav>

      {/* Bottom actions */}
      <div className="px-3 py-4 border-t border-gray-200 bg-white">
        <Button
          variant="ghost"
          onClick={goToMainSite}
          className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 w-full justify-start"
          title={isCollapsed ? 'Back to Site' : undefined}
        >
          <Home className={`h-5 w-5 ${
            isCollapsed ? 'mx-auto' : 'mr-3'
          } text-gray-400 group-hover:text-gray-600`} />
          {!isCollapsed && (
            <div className="text-left">
              <span>Back to Site</span>
              <p className="text-xs text-gray-500">Return to main site</p>
            </div>
          )}
        </Button>
        
        <Button
          variant="ghost"
          onClick={handleSignOut}
          className="group flex items-center px-3 py-3 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 w-full mt-2 justify-start"
          title={isCollapsed ? 'Sign Out' : undefined}
        >
          <LogOut className={`h-5 w-5 ${
            isCollapsed ? 'mx-auto' : 'mr-3'
          } text-red-400 group-hover:text-red-500`} />
          {!isCollapsed && (
            <div className="text-left">
              <span>Sign Out</span>
              <p className="text-xs text-red-500">End your session</p>
            </div>
          )}
        </Button>
      </div>
    </div>
  );

  const renderMobileSidebar = () => (
    <div className="lg:hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Mobile sidebar */}
      <div
        ref={mobileSidebarRef}
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${mobileSidebarClass}`}
      >
        <div className="flex flex-col h-full bg-gradient-to-b from-white to-gray-50">
          {/* Mobile sidebar header */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 bg-white">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div>
                <span className="text-xl font-bold text-gray-900">Admin</span>
                <p className="text-xs text-gray-500">Dashboard</p>
              </div>
            </div>
            <button
              onClick={() => setIsMobileSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavigationClick(item.href)}
                    className={`group relative flex items-center px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 w-full text-left ${
                      item.current
                        ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-white hover:shadow-md'
                    }`}
                  >
                    {/* Active indicator */}
                    {item.current && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"></div>
                    )}
                    
                    <Icon
                      className={`h-5 w-5 mr-3 ${
                        item.current 
                          ? 'text-white' 
                          : 'text-gray-400 group-hover:text-gray-600'
                      }`}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="truncate">{item.name}</span>
                        {item.badge && (
                          <Badge variant={item.badge === 'New' ? 'secondary' : 'default'} className="ml-2">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-xs truncate ${
                        item.current ? 'text-purple-100' : 'text-gray-500'
                      }`}>
                        {item.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Mobile bottom actions */}
          <div className="px-3 py-4 border-t border-gray-200 bg-white">
            <Button
              variant="ghost"
              onClick={goToMainSite}
              className="group flex items-center px-3 py-3 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all duration-200 w-full justify-start"
            >
              <Home className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-600" />
              <div className="text-left">
                <span>Back to Site</span>
                <p className="text-xs text-gray-500">Return to main site</p>
              </div>
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="group flex items-center px-3 py-3 text-sm font-medium text-red-700 hover:text-red-800 hover:bg-red-50 rounded-xl transition-all duration-200 w-full mt-2 justify-start"
            >
              <LogOut className="h-5 w-5 mr-3 text-red-400 group-hover:text-red-500" />
              <div className="text-left">
                <span>Sign Out</span>
                <p className="text-xs text-red-500">End your session</p>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Mobile Sidebar */}
      {renderMobileSidebar()}
      
      {/* Desktop Sidebar - hidden on mobile */}
      <div className={`hidden lg:block bg-white shadow-xl transition-all duration-300 ease-in-out flex-shrink-0 ${sidebarWidthClass}`}>
        {renderSidebarContent()}
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            {/* Mobile hamburger menu */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileSidebar}
                className="p-2"
                title="Open menu"
              >
                <Menu className="w-6 h-6" />
              </Button>
            </div>
            
            {/* Desktop expand sidebar button (when collapsed) */}
            {!isMobile && isCollapsed && (
              <Button
                variant="ghost"
                size="sm"
                onClick={expand}
                className="p-2 hidden lg:block"
                title="Expand sidebar"
              >
                <ChevronRight className="w-6 h-6" />
              </Button>
            )}
            
            {/* Page title */}
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-gray-900">
                {navigation.find(item => item.current)?.name || 'Admin Panel'}
              </h1>
            </div>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <span>Admin Panel</span>
                <span>•</span>
                <span>v1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-auto bg-gray-50">
          <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>
      
      {/* Toast notifications for admin panel */}
      <Toaster position="top-right" richColors />
    </div>
  );
};

export default AdminLayout;
