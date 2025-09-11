import React, { createContext, useContext, ReactNode, useState } from 'react';
import { commentService, types } from '../services/api';

// Comments context type
interface CommentsContextType {
  comments: types.Comment[];
  isLoading: boolean;
  error: string | null;
  fetchCommentsByIssueId: (issueId: string) => Promise<void>;
  createComment: (content: string, issueId?: string, parentId?: string) => Promise<types.Comment | undefined>;
  updateComment: (id: string, content: string) => Promise<types.Comment | undefined>;
  deleteComment: (id: string) => Promise<boolean>;
}

// Create the comments context with default values
const CommentsContext = createContext<CommentsContextType>({
  comments: [],
  isLoading: false,
  error: null,
  fetchCommentsByIssueId: async () => {},
  createComment: async () => undefined,
  updateComment: async () => undefined,
  deleteComment: async () => false,
});

// Provider component
export const CommentsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [comments, setComments] = useState<types.Comment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comments by issue ID
  const fetchCommentsByIssueId = async (issueId: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await commentService.getCommentsByIssueId(issueId);
      
      if (response.data) {
        setComments(response.data.comments);
      } else if (response.error) {
        setError(response.error.message || 'Failed to fetch comments');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new comment
  const createComment = async (content: string, issueId?: string, parentId?: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await commentService.createComment(content, issueId, parentId);
      
      if (response.data) {
        // Refresh comments list if we have an issue ID
        if (issueId) {
          await fetchCommentsByIssueId(issueId);
        }
        // If it's a reply to another comment, refresh the parent comment's issue
        else if (parentId) {
          // We would need to know the issue ID of the parent comment
          // This might require an additional API call or storing the info
        }
        
        return response.data.comment;
      } else if (response.error) {
        setError(response.error.message || 'Failed to create comment');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return undefined;
  };

  // Update an existing comment
  const updateComment = async (id: string, content: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await commentService.updateComment(id, content);
      
      if (response.data) {
        // Update the comment in the local state
        setComments(prevComments => 
          prevComments.map(comment => 
            comment.id === id ? response.data!.comment : comment
          )
        );
        
        return response.data.comment;
      } else if (response.error) {
        setError(response.error.message || 'Failed to update comment');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return undefined;
  };

  // Delete a comment
  const deleteComment = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await commentService.deleteComment(id);
      
      if (response.data) {
        // Remove the comment from the local state
        setComments(prevComments => 
          prevComments.filter(comment => comment.id !== id)
        );
        
        return true;
      } else if (response.error) {
        setError(response.error.message || 'Failed to delete comment');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  return (
    <CommentsContext.Provider
      value={{
        comments,
        isLoading,
        error,
        fetchCommentsByIssueId,
        createComment,
        updateComment,
        deleteComment,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
};

// Custom hook to use the comments context
export const useComments = () => useContext(CommentsContext);
