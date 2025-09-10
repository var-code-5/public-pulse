import { User } from './userModel';
import { Issue } from './issueModel';

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  userId: string;
  user?: User;
  issueId?: string;
  issue?: Issue;
  createdAt: Date;
}
