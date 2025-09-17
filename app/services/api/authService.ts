import { apiClient } from './client';
import { ENDPOINTS } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from './types';

// Define auth response type
interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Firebase authentication service for the app
export const authService = {
  // Register a new citizen
  registerCitizen: async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.CITIZEN_REGISTER, userData);
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user_role', 'CITIZEN');
    }
    
    return response;
  },
  
  // Citizen login
  loginAsCitizen: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.CITIZEN_LOGIN, credentials);
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user_role', 'CITIZEN');
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Government login
  loginAsGovernment: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.GOVERNMENT_LOGIN, credentials);
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user_role', 'GOVERNMENT');
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Admin login
  loginAsAdmin: async (credentials: { email: string; password: string }) => {
    const response = await apiClient.post<AuthResponse>(ENDPOINTS.ADMIN_LOGIN, credentials);
    
    if (response.data && response.data.token) {
      await AsyncStorage.setItem('auth_token', response.data.token);
      await AsyncStorage.setItem('user_role', 'ADMIN');
      await AsyncStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    
    return response;
  },
  
  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    return !!token;
  },
  
  // Get current user role
  getUserRole: async () => {
    return AsyncStorage.getItem('user_role');
  },
  
  // Get current user data
  getCurrentUser: async () => {
    const userData = await AsyncStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  },
  
  // Logout
  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('user_role');
    await AsyncStorage.removeItem('user_data');
  }
};
