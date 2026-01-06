import React from 'react';
import { type User, type LoginCredentials, type RegisterData } from '../services/api';

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; message: string }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; requiresConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => void;
}

export const AuthContext = React.createContext<AuthContextType | undefined>(undefined);