import React, { useState, useEffect, type ReactNode } from 'react';
import { userService, type User, type LoginCredentials, type RegisterData } from '../services/api';
import { AuthContext, type AuthContextType } from './AuthContextDefinition';

// Helper functions for cookies
const setCookie = (name: string, value: string, maxAge: number) => {
  document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Lax`;
};

const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=; max-age=0; path=/; SameSite=Lax`;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in on app start
    const checkAuthStatus = async () => {
      const token = getCookie('userToken');
      const loginTime = getCookie('userLoginTime');
      
      if (token && loginTime) {
        const loginTimestamp = parseInt(loginTime);
        const currentTime = Date.now();
        const sevenDays = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
        
        // Check if login is still valid (less than 7 days old)
        if (currentTime - loginTimestamp < sevenDays) {
          try {
            const response = await userService.verifyToken();
            if (response.success && response.user) {
              setUser(response.user);
            } else {
              deleteCookie('userToken');
              deleteCookie('userLoginTime');
            }
          } catch (error) {
            console.error('Token verification failed:', error);
            deleteCookie('userToken');
            deleteCookie('userLoginTime');
          }
        } else {
          // Token expired, remove it
          deleteCookie('userToken');
          deleteCookie('userLoginTime');
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
        const maxAge = credentials.rememberMe ? 7 * 24 * 60 * 60 : 24 * 60 * 60; // 7 days or 1 day
        setCookie('userToken', response.token, maxAge);
        setCookie('userLoginTime', Date.now().toString(), maxAge);
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
        const maxAge = 7 * 24 * 60 * 60; // 7 days for register
        setCookie('userToken', response.token, maxAge);
        setCookie('userLoginTime', Date.now().toString(), maxAge);
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
      deleteCookie('userToken');
      deleteCookie('userLoginTime');
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