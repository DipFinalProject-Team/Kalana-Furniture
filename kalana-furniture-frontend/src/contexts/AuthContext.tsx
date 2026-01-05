import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import { userService, type User, type LoginCredentials, type RegisterData } from '../services/api';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('userToken');
      const loginTime = localStorage.getItem('userLoginTime');
      
      if (token && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const oneDay = 24 * 60 * 60 * 1000; // 1 day in milliseconds
        
        // Check if login is still valid (less than 1 day old)
        if (currentTime - loginTimestamp < oneDay) {
          try {
            const response = await userService.verifyToken();
            if (response.success && response.user) {
              setUser(response.user);
            } else {
              localStorage.removeItem('userToken');
              localStorage.removeItem('userLoginTime');
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            localStorage.removeItem('userToken');
            localStorage.removeItem('userLoginTime');
          }
        } else {
          // Token expired, remove it
          localStorage.removeItem('userToken');
          localStorage.removeItem('userLoginTime');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = async (credentials: LoginCredentials): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await userService.login(credentials);
      if (response.success && response.token && response.user) {
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userLoginTime', Date.now().toString());
        setUser(response.user);
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed. Please try again.';
      return { success: false, message };
    }
  };

  const register = async (userData: RegisterData): Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }> => {
    try {
      const response = await userService.register(userData);
      if (response.success && response.token && response.user) {
        localStorage.setItem('userToken', response.token);
        localStorage.setItem('userLoginTime', Date.now().toString());
        setUser(response.user);
        return { success: true, message: response.message };
      } else if (response.success && response.requiresConfirmation) {
        return { success: true, message: response.message, requiresConfirmation: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed. Please try again.';
      return { success: false, message };
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await userService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userLoginTime');
      setUser(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};