import { Role } from './types';
import { Issue } from './issueModel';
import { Comment } from './commentModel';
import { Vote } from './voteModel';
import { IssueStatusHistory } from './issueModel';
import { Notification } from './notificationModel';

export interface User {
  id: string;
  name?: string;
  email?: string;
  firebaseUid: string;
  role: Role;
  departmentId?: string;
  department?: Department;
  issues?: Issue[];
  comments?: Comment[];
  votes?: Vote[];
  statusChanges?: IssueStatusHistory[];
  notifications?: Notification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Department {
  id: string;
  name: string;
  users?: User[];
  issues?: Issue[];
}
