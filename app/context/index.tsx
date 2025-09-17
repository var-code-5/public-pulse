// Export all contexts for easy importing
import { AuthProvider, useAuth } from './AuthContext';
import { IssuesProvider, useIssues } from './IssuesContext';
import { CommentsProvider, useComments } from './CommentsContext';

// Main app provider that combines all contexts
import React, { ReactNode } from 'react';

interface AppProviderProps {
  children: ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  return (
    <AuthProvider>
      <IssuesProvider>
        <CommentsProvider>
          {children}
        </CommentsProvider>
      </IssuesProvider>
    </AuthProvider>
  );
};

export {
  AuthProvider,
  useAuth,
  IssuesProvider,
  useIssues,
  CommentsProvider,
  useComments
};
