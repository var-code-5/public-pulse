import { VoteType } from './types';
import { User } from './userModel';
import { Issue } from './issueModel';
import { Comment } from './commentModel';

export interface Vote {
  id: string;
  type: VoteType;
  userId: string;
  user?: User;
  issueId?: string;
  issue?: Issue;
  commentId?: string;
  comment?: Comment;
  createdAt: Date;
}
