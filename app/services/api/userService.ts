import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { User, Role, PaginationResponse } from './types';

interface UsersResponse {
  users: User[];
  pagination: PaginationResponse;
}

interface UserResponse {
  message: string;
  user: User;
}

interface UserIssuesResponse {
  issues: any[]; // Using any here as the response schema seems incomplete in the Swagger
}

export const userService = {
  // Get all users (admin only)
  getAllUsers: async (page = 1, limit = 10, role?: Role) => {
    return apiClient.get<UsersResponse>(ENDPOINTS.USERS, {
      params: {
        page,
        limit,
        ...(role && { role })
      }
    });
  },
  
  // Create a user (admin only)
  createUser: async (userData: {
    name: string;
    email: string;
    firebaseUid: string;
    role: Role;
    departmentId?: string;
  }) => {
    return apiClient.post<UserResponse>(ENDPOINTS.USERS, userData);
  },
  
  // Get user by ID
  getUserById: async (id: string) => {
    return apiClient.get<User>(ENDPOINTS.USER_BY_ID(id));
  },
  
  // Update user
  updateUser: async (id: string, data: {
    name?: string;
    email?: string;
    departmentId?: string | null;
  }) => {
    return apiClient.put<UserResponse>(ENDPOINTS.USER_BY_ID(id), data);
  },
  
  // Delete user (admin only)
  deleteUser: async (id: string) => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.USER_BY_ID(id));
  },
  
  // Get issues created by user
  getUserIssues: async (id: string) => {
    return apiClient.get<UserIssuesResponse>(ENDPOINTS.USER_ISSUES(id));
  }
};
