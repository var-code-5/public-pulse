import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { Comment } from './types';

interface CommentResponse {
  message: string;
  comment: Comment;
}

interface CommentsResponse {
  comments: Comment[];
}

export const commentService = {
  // Create a new comment
  createComment: async (content: string, issueId?: string, parentId?: string) => {
    if (!issueId && !parentId) {
      throw new Error('Either issueId or parentId must be provided');
    }
    
    return apiClient.post<CommentResponse>(ENDPOINTS.COMMENTS, {
      content,
      ...(issueId && { issueId }),
      ...(parentId && { parentId })
    });
  },
  
  // Get all comments for an issue
  getCommentsByIssueId: async (issueId: string) => {
    return apiClient.get<CommentsResponse>(ENDPOINTS.COMMENTS_BY_ISSUE(issueId));
  },
  
  // Update a comment
  updateComment: async (id: string, content: string) => {
    return apiClient.put<CommentResponse>(ENDPOINTS.COMMENT_BY_ID(id), { content });
  },
  
  // Delete a comment
  deleteComment: async (id: string) => {
    return apiClient.delete<{ message: string }>(ENDPOINTS.COMMENT_BY_ID(id));
  }
};
