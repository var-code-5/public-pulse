import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { Department } from './types';

interface DepartmentsResponse {
  departments: Department[];
}

interface DepartmentResponse {
  message: string;
  department: Department;
}

export const departmentService = {
  // Get all departments
  getAllDepartments: async () => {
    return apiClient.get<DepartmentsResponse>(ENDPOINTS.DEPARTMENTS);
  },
  
  // Create a department (admin only)
  createDepartment: async (name: string) => {
    return apiClient.post<DepartmentResponse>(ENDPOINTS.DEPARTMENTS, { name });
  },
  
  // Get department by ID
  getDepartmentById: async (id: string) => {
    return apiClient.get<Department>(ENDPOINTS.DEPARTMENT_BY_ID(id));
  },
  
  // Update department (admin only)
  updateDepartment: async (id: string, name: string) => {
    return apiClient.put<DepartmentResponse>(ENDPOINTS.DEPARTMENT_BY_ID(id), { name });
  },
  
  // Delete department (admin only)
  deleteDepartment: async (id: string) => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.DEPARTMENT_BY_ID(id));
  }
};
