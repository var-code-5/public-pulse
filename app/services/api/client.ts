import { API_CONFIG } from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Error type definition
interface ApiError {
  status: number;
  message: string;
  error?: any;
}

// Response type definition
interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

// Request options type
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
  isFormData?: boolean;
}

// File object interface
interface FileObject {
  uri: string;
  type?: string;
  name?: string;
}

class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(baseUrl: string, defaultTimeout = 30000) {
    this.baseUrl = baseUrl;
    this.defaultTimeout = defaultTimeout;
  }

  // Get the authentication token
  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('auth_token');
    } catch (error) {
      console.error('Error retrieving auth token', error);
      return null;
    }
  }

  // Create headers for the request
  private async createHeaders(customHeaders: Record<string, string> = {}, isFormData = false): Promise<Headers> {
    const headers = new Headers({
      'Accept': 'application/json',
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...customHeaders,
    });

    const token = await this.getAuthToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  // Format URL with query parameters
  private formatUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          queryParams.append(key, String(value));
        }
      });
      
      const queryString = queryParams.toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
    }
    
    return url;
  }

  // Execute a request with timeout
  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    timeout: number
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Parse response data
      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Handle response status
      if (response.ok) {
        return { data };
      } else {
        const error: ApiError = {
          status: response.status,
          message: data.message || response.statusText,
          error: data.error || data,
        };
        
        // Handle authentication errors
        if (response.status === 401) {
          // Clear token if unauthorized
          await AsyncStorage.removeItem('auth_token');
        }
        
        return { error };
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error && error.name === 'AbortError') {
        return {
          error: {
            status: 408, // Request Timeout
            message: 'Request timeout',
            error,
          },
        };
      }
      
      return {
        error: {
          status: 0, // Network or other error
          message: 'Network error',
          error,
        },
      };
    }
  }

  // GET request
  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout } = options;
    const url = this.formatUrl(endpoint, params);
    
    const requestHeaders = await this.createHeaders(headers);
    
    return this.executeRequest<T>(
      url,
      {
        method: 'GET',
        headers: requestHeaders,
      },
      timeout
    );
  }

  // POST request
  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout, isFormData = false } = options;
    const url = this.formatUrl(endpoint, params);
    
    const requestHeaders = await this.createHeaders(headers, isFormData);
    
    let body;
    if (isFormData) {
      // If it's already a FormData instance, use it directly
      body = data instanceof FormData ? data : this.objectToFormData(data);
    } else {
      // JSON data
      body = data ? JSON.stringify(data) : undefined;
    }
    
    return this.executeRequest<T>(
      url,
      {
        method: 'POST',
        headers: requestHeaders,
        body,
      },
      timeout
    );
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout, isFormData = false } = options;
    const url = this.formatUrl(endpoint, params);
    
    const requestHeaders = await this.createHeaders(headers, isFormData);
    
    let body;
    if (isFormData) {
      body = data instanceof FormData ? data : this.objectToFormData(data);
    } else {
      body = data ? JSON.stringify(data) : undefined;
    }
    
    return this.executeRequest<T>(
      url,
      {
        method: 'PUT',
        headers: requestHeaders,
        body,
      },
      timeout
    );
  }

  // PATCH request
  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout, isFormData = false } = options;
    const url = this.formatUrl(endpoint, params);
    
    const requestHeaders = await this.createHeaders(headers, isFormData);
    
    let body;
    if (isFormData) {
      body = data instanceof FormData ? data : this.objectToFormData(data);
    } else {
      body = data ? JSON.stringify(data) : undefined;
    }
    
    return this.executeRequest<T>(
      url,
      {
        method: 'PATCH',
        headers: requestHeaders,
        body,
      },
      timeout
    );
  }

  // DELETE request
  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { headers = {}, params, timeout = this.defaultTimeout } = options;
    const url = this.formatUrl(endpoint, params);
    
    const requestHeaders = await this.createHeaders(headers);
    
    return this.executeRequest<T>(
      url,
      {
        method: 'DELETE',
        headers: requestHeaders,
      },
      timeout
    );
  }

  // Helper to check if an object is a file object
  private isFileObject(value: any): value is FileObject {
    return value && typeof value === 'object' && 'uri' in value;
  }

  // Helper to convert object to FormData for file uploads
  private objectToFormData(obj: any): FormData {
    const formData = new FormData();
    
    Object.entries(obj).forEach(([key, value]) => {
      if (value === null || value === undefined) {
        return;
      }
      
      // Handle arrays (like multiple images)
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          // If the item is a file object for upload
          if (this.isFileObject(item)) {
            const fileType = item.type || 'image/jpeg'; // Default to jpeg if type not provided
            const fileName = item.name || `file-${index}.jpg`; // Default name if not provided
            
            formData.append(key, {
              uri: item.uri,
              type: fileType,
              name: fileName,
            } as any);
          } else {
            formData.append(`${key}[]`, String(item));
          }
        });
      } 
      // Handle file objects
      else if (this.isFileObject(value)) {
        const fileType = value.type || 'image/jpeg';
        const fileName = value.name || 'file.jpg';
        
        formData.append(key, {
          uri: value.uri,
          type: fileType,
          name: fileName,
        } as any);
      } 
      // Handle regular values
      else {
        formData.append(key, String(value));
      }
    });
    
    return formData;
  }
}

// Create and export the API client instance
export const apiClient = new ApiClient(API_CONFIG.BASE_URL, API_CONFIG.TIMEOUT);

export default apiClient;
