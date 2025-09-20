import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';

// Create auth context
const AuthContext = createContext();

/**
 * AuthProvider Component
 * 
 * Provides authentication state and methods to the entire application
 * Wraps NextAuth's session provider with additional functionality
 */
export const AuthProvider = ({ children }) => {
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const status = sessionResult?.status;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  // Update user state when session changes
  useEffect(() => {
    if (status === 'loading') {
      setLoading(true);
      return;
    }
    
    if (session?.user) {
      setUser(session.user);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  }, [session, status]);
  
  // Login function with redirect
  const login = async (credentials, callbackUrl) => {
    try {
      const result = await signIn('credentials', {
        ...credentials,
        redirect: false
      });
      
      if (result?.error) {
        return { success: false, error: result.error };
      }
      
      if (callbackUrl) {
        router.push(callbackUrl);
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Logout function with redirect
  const logout = async (callbackUrl = '/') => {
    await signOut({ redirect: false });
    router.push(callbackUrl);
  };
  
  // Register function
  const register = async (userData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };
  
  // Check if user has specific role
  const hasRole = (role) => {
    if (!user) return false;
    return user.role === role;
  };
  
  // Check if user is authenticated
  const isAuthenticated = !!user;
  
  // Auth context value
  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    logout,
    register,
    hasRole
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth Hook
 * 
 * Custom hook to access the auth context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

/**
 * withAuth HOC
 * 
 * Higher-order component to protect routes that require authentication
 */
export const withAuth = (Component, options = {}) => {
  const { requireAuth = true, requiredRole = null, redirectTo = '/login' } = options;
  
  const WithAuth = (props) => {
    const { user, loading, isAuthenticated, hasRole } = useAuth();
    const router = useRouter();
    
    useEffect(() => {
      if (loading) return;
      
      if (requireAuth && !isAuthenticated) {
        router.replace(`${redirectTo}?callbackUrl=${encodeURIComponent(router.asPath)}`);
        return;
      }
      
      if (requiredRole && !hasRole(requiredRole)) {
        router.replace('/unauthorized');
        return;
      }
    }, [loading, isAuthenticated, hasRole, router]);
    
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }
    
    if (requireAuth && !isAuthenticated) {
      return null;
    }
    
    if (requiredRole && !hasRole(requiredRole)) {
      return null;
    }
    
    return <Component {...props} />;
  };
  
  WithAuth.displayName = `withAuth(${Component.displayName || Component.name || 'Component'})`;
  
  return WithAuth;
};

export default AuthProvider;