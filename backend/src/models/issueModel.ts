import { IssueStatus } from './types';
import { User } from './userModel';
import { Department } from './userModel';
import { Comment } from './commentModel';
import { Image } from './imageModel';
import { Vote } from './voteModel';
import { Notification } from './notificationModel';

export interface Issue {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: number;
  status: IssueStatus;
  departmentId?: string;
  department?: Department;
  authorId: string;
  author?: User;
  comments?: Comment[];
  images?: Image[];
  votes?: Vote[];
  statusLogs?: IssueStatusHistory[];
  notifications?: Notification[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IssueStatusHistory {
  id: string;
  status: IssueStatus;
  changedAt: Date;
  issueId: string;
  issue?: Issue;
  changedById: string;
  changedBy?: User;
}
