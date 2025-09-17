// Export all API services and types
import { apiClient } from './client';
import { API_CONFIG, ENDPOINTS } from './config';
import { issueService } from './issueService';
import { commentService } from './commentService';
import { voteService } from './voteService';
import { userService } from './userService';
import { departmentService } from './departmentService';
import { notificationService } from './notificationService';
import { authService } from './authService';
import * as types from './types';

// Export everything for easy imports
export {
  apiClient,
  API_CONFIG,
  ENDPOINTS,
  issueService,
  commentService,
  voteService,
  userService,
  departmentService,
  notificationService,
  authService,
  types
};
