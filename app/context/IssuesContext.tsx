import React, { createContext, useContext, ReactNode, useState } from 'react';
import { issueService, types } from '../services/api';

// Issues context type
interface IssuesContextType {
  issues: types.Issue[];
  nearbyIssues: types.Issue[];
  currentIssue: types.Issue | null;
  isLoading: boolean;
  error: string | null;
  fetchIssues: (page?: number, limit?: number, status?: types.IssueStatus, departmentId?: string) => Promise<void>;
  fetchNearbyIssues: (latitude: number, longitude: number, radius?: number) => Promise<void>;
  fetchIssueById: (id: string) => Promise<void>;
  createIssue: (title: string, description: string, latitude: number, longitude: number, images?: any[]) => Promise<types.Issue | undefined>;
  updateIssue: (id: string, data: any) => Promise<types.Issue | undefined>;
  deleteIssue: (id: string) => Promise<boolean>;
}

// Create the issues context with default values
const IssuesContext = createContext<IssuesContextType>({
  issues: [],
  nearbyIssues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  fetchIssues: async () => {},
  fetchNearbyIssues: async () => {},
  fetchIssueById: async () => {},
  createIssue: async () => undefined,
  updateIssue: async () => undefined,
  deleteIssue: async () => false,
});

// Provider component
export const IssuesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [issues, setIssues] = useState<types.Issue[]>([]);
  const [nearbyIssues, setNearbyIssues] = useState<types.Issue[]>([]);
  const [currentIssue, setCurrentIssue] = useState<types.Issue | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch issues with optional filters
  const fetchIssues = async (
    page = 1,
    limit = 10,
    status?: types.IssueStatus,
    departmentId?: string
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.getAllIssues(page, limit, status, departmentId);
      
      if (response.data) {
        setIssues(response.data.issues);
      } else if (response.error) {
        setError(response.error.message || 'Failed to fetch issues');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch nearby issues based on location
  const fetchNearbyIssues = async (latitude: number, longitude: number, radius = 5) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.getNearbyIssues(latitude, longitude, radius);
      
      if (response.data) {
        setNearbyIssues(response.data.issues);
      } else if (response.error) {
        setError(response.error.message || 'Failed to fetch nearby issues');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a single issue by ID
  const fetchIssueById = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.getIssueById(id);
      
      if (response.data) {
        setCurrentIssue(response.data);
      } else if (response.error) {
        setError(response.error.message || 'Failed to fetch issue');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new issue
  const createIssue = async (
    title: string,
    description: string,
    latitude: number,
    longitude: number,
    images?: any[]
  ) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.createIssue(
        title,
        description,
        latitude,
        longitude,
        images
      );
      
      if (response.data) {
        // Refresh the issues list
        await fetchIssues();
        return response.data.issue;
      } else if (response.error) {
        setError(response.error.message || 'Failed to create issue');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return undefined;
  };

  // Update an existing issue
  const updateIssue = async (id: string, data: any) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.updateIssue(id, data);
      
      if (response.data) {
        // If this is the current issue, update it
        if (currentIssue && currentIssue.id === id) {
          setCurrentIssue(response.data.issue);
        }
        
        // Refresh the issues list
        await fetchIssues();
        return response.data.issue;
      } else if (response.error) {
        setError(response.error.message || 'Failed to update issue');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return undefined;
  };

  // Delete an issue
  const deleteIssue = async (id: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await issueService.deleteIssue(id);
      
      if (response.data) {
        // Clear current issue if it was deleted
        if (currentIssue && currentIssue.id === id) {
          setCurrentIssue(null);
        }
        
        // Refresh the issues list
        await fetchIssues();
        return true;
      } else if (response.error) {
        setError(response.error.message || 'Failed to delete issue');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
    
    return false;
  };

  return (
    <IssuesContext.Provider
      value={{
        issues,
        nearbyIssues,
        currentIssue,
        isLoading,
        error,
        fetchIssues,
        fetchNearbyIssues,
        fetchIssueById,
        createIssue,
        updateIssue,
        deleteIssue,
      }}
    >
      {children}
    </IssuesContext.Provider>
  );
};

// Custom hook to use the issues context
export const useIssues = () => useContext(IssuesContext);
