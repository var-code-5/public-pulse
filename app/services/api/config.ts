// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api', // Change to your production URL for production builds
  TIMEOUT: 30000, // 30 seconds timeout
};

// Endpoints based on the Swagger documentation
export const ENDPOINTS = {
  // Issues
  ISSUES: '/issues',
  ISSUES_NEARBY: '/issues/nearby',
  ISSUE_BY_ID: (id: string) => `/issues/${id}`,
  ISSUE_STATUS: (id: string) => `/issues/${id}/status`,
  ISSUE_DEPARTMENT: (id: string) => `/issues/${id}/department`,
  
  // Comments
  COMMENTS: '/comments',
  COMMENTS_BY_ISSUE: (issueId: string) => `/comments/issue/${issueId}`,
  COMMENT_BY_ID: (id: string) => `/comments/${id}`,
  
  // Votes
  VOTE_ISSUE: (issueId: string) => `/votes/issue/${issueId}`,
  VOTE_COMMENT: (commentId: string) => `/votes/comment/${commentId}`,
  
  // Users
  USERS: '/users',
  USER_BY_ID: (id: string) => `/users/${id}`,
  USER_ISSUES: (id: string) => `/users/${id}/issues`,
  
  // Departments
  DEPARTMENTS: '/departments',
  DEPARTMENT_BY_ID: (id: string) => `/departments/${id}`,
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION_READ: (id: string) => `/notifications/${id}/read`,
  
  // Authentication
  CITIZEN_REGISTER: '/citizen/auth/register',
  CITIZEN_LOGIN: '/citizen/auth/login',
  GOVERNMENT_LOGIN: '/government/auth/login',
  ADMIN_LOGIN: '/admin/auth/login',
};
