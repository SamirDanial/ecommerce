import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useUser, useAuth } from '@clerk/clerk-react';

interface AdminRouteProps {
  children: React.ReactNode;
  fallbackPath?: string;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ 
  children, 
  fallbackPath = '/login' 
}) => {
  const { isAuthenticated, isLoaded } = useClerkAuth();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!isAuthenticated || !clerkUser) {
        setIsAdmin(false);
        setIsCheckingRole(false);
        return;
      }

      try {
        // Get JWT token for backend authentication
        const token = await getToken({ template: 'e-commerce' });
        if (!token) {
          setIsAdmin(false);
          return;
        }
        

        
        // Check backend for user role
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/admin/check-role`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const isUserAdmin = data.isAdmin === true || data.role === 'ADMIN';
          setIsAdmin(isUserAdmin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setIsCheckingRole(false);
      }
    };

    checkAdminRole();
  }, [isAuthenticated, clerkUser, getToken]);

  // Show loading state while checking role
  if (!isLoaded || isCheckingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Redirect if not admin
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Render admin content
  return <>{children}</>;
};

export default AdminRoute;
