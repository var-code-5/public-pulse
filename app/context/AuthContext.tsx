import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, types } from '../services/api';

// Auth context type
interface AuthContextType {
  user: types.User | null;
  role: types.Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the auth context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<types.User | null>(null);
  const [role, setRole] = useState<types.Role | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const isLoggedIn = await authService.isLoggedIn();
        if (isLoggedIn) {
          const userRole = await authService.getUserRole() as types.Role;
          const userData = await authService.getCurrentUser();
          
          setUser(userData);
          setRole(userRole);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string, roleType: string) => {
    setIsLoading(true);
    try {
      let response;
      
      switch (roleType.toUpperCase()) {
        case 'CITIZEN':
          response = await authService.loginAsCitizen({ email, password });
          break;
        case 'GOVERNMENT':
          response = await authService.loginAsGovernment({ email, password });
          break;
        case 'ADMIN':
          response = await authService.loginAsAdmin({ email, password });
          break;
        default:
          throw new Error('Invalid role type');
      }
      
      if (response.data) {
        setUser(response.data.user);
        setRole(response.data.user.role);
        setIsAuthenticated(true);
      } else if (response.error) {
        throw new Error(response.error.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Register function
  const register = async (name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await authService.registerCitizen({ name, email, password });
      
      if (response.data) {
        // After registration, usually we would login the user
        await login(email, password, 'CITIZEN');
      } else if (response.error) {
        throw new Error(response.error.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
      setUser(null);
      setRole(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);
