import { apiClient } from './client';
import { ENDPOINTS } from './config';
import { Vote, VoteType } from './types';

interface VoteResponse {
  message: string;
  vote: Vote;
}

export const voteService = {
  // Vote on an issue
  voteOnIssue: async (issueId: string, voteType: VoteType) => {
    return apiClient.post<VoteResponse>(ENDPOINTS.VOTE_ISSUE(issueId), { type: voteType });
  },
  
  // Vote on a comment
  voteOnComment: async (commentId: string, voteType: VoteType) => {
    return apiClient.post<VoteResponse>(ENDPOINTS.VOTE_COMMENT(commentId), { type: voteType });
  }
};
