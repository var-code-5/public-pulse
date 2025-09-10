import { User } from './userModel';
import { Issue } from './issueModel';
import { Vote } from './voteModel';

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: User;
  issueId?: string;
  issue?: Issue;
  parentId?: string;
  parent?: Comment;
  replies?: Comment[];
  votes?: Vote[];
  createdAt: Date;
  updatedAt: Date;
}
