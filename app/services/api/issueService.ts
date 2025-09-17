import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { 
  Issue, 
  IssueStatus, 
  Comment,
  PaginationResponse
} from './types';

// Response types
interface IssuesResponse {
  issues: Issue[];
  pagination: PaginationResponse;
}

interface IssueResponse {
  message: string;
  issue: Issue;
}

interface NearbyIssuesResponse {
  issues: Issue[];
}

// Service for Issue-related API calls
export const issueService = {
  // Get all issues with optional filters
  getAllIssues: async (page = 1, limit = 10, status?: IssueStatus, departmentId?: string) => {
    return apiClient.get<IssuesResponse>(ENDPOINTS.ISSUES, {
      params: {
        page,
        limit,
        ...(status && { status }),
        ...(departmentId && { departmentId })
      }
    });
  },
  
  // Get nearby issues
  getNearbyIssues: async (latitude: number, longitude: number, radius = 5) => {
    return apiClient.get<NearbyIssuesResponse>(ENDPOINTS.ISSUES_NEARBY, {
      params: {
        latitude,
        longitude,
        radius
      }
    });
  },
  
  // Get issue by ID
  getIssueById: async (id: string) => {
    return apiClient.get<Issue>(ENDPOINTS.ISSUE_BY_ID(id));
  },
  
  // Create a new issue
  createIssue: async (
    title: string, 
    description: string, 
    latitude: number, 
    longitude: number, 
    images?: Array<{ uri: string; type: string; name: string }>
  ) => {
    const formData = {
      title,
      description,
      latitude,
      longitude,
      ...(images && { images })
    };
    
    return apiClient.post<IssueResponse>(ENDPOINTS.ISSUES, formData, { isFormData: !!images });
  },
  
  // Update an existing issue
  updateIssue: async (
    id: string,
    data: {
      title?: string;
      description?: string;
      latitude?: number;
      longitude?: number;
      images?: Array<{ uri: string; type: string; name: string }>;
      deleteImages?: string[];
    }
  ) => {
    const isFormData = !!(data.images || data.deleteImages);
    return apiClient.put<IssueResponse>(ENDPOINTS.ISSUE_BY_ID(id), data, { isFormData });
  },
  
  // Update issue status
  updateIssueStatus: async (id: string, status: IssueStatus) => {
    return apiClient.patch<IssueResponse>(ENDPOINTS.ISSUE_STATUS(id), { status });
  },
  
  // Assign issue to department
  assignIssueToDepartment: async (issueId: string, departmentId: string) => {
    return apiClient.patch<IssueResponse>(ENDPOINTS.ISSUE_DEPARTMENT(issueId), { departmentId });
  },
  
  // Delete an issue
  deleteIssue: async (id: string) => {
    return apiClient.delete(ENDPOINTS.ISSUE_BY_ID(id));
  },
  
  // Get comments for an issue
  getIssueComments: async (issueId: string) => {
    return apiClient.get<{ comments: Comment[] }>(ENDPOINTS.COMMENTS_BY_ISSUE(issueId));
  }
};
