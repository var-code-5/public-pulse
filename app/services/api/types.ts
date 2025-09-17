// Define types based on Swagger API schema
export interface User {
  id: string;
  name: string;
  email: string;
  firebaseUid: string;
  role: Role;
  departmentId: string | null;
  createdAt: string;
  updatedAt: string;
}

export enum Role {
  CITIZEN = 'CITIZEN',
  GOVERNMENT = 'GOVERNMENT',
  ADMIN = 'ADMIN'
}

export interface Department {
  id: string;
  name: string;
}

export enum IssueStatus {
  PENDING = 'PENDING',
  ONGOING = 'ONGOING',
  PAUSED = 'PAUSED',
  CLOSED = 'CLOSED'
}

export interface Image {
  id: string;
  url: string;
  issueId: string;
  createdAt: string;
}

export interface Issue {
  id: string;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  severity: number;
  status: IssueStatus;
  departmentId: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  author?: User;
  department?: Department;
  images?: Image[];
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  issueId: string | null;
  parentId: string | null;
  createdAt: string;
  updatedAt: string;
  author?: User;
}

export enum VoteType {
  UPVOTE = 'UPVOTE',
  DOWNVOTE = 'DOWNVOTE'
}

export interface Vote {
  id: string;
  type: VoteType;
  userId: string;
  issueId: string | null;
  commentId: string | null;
  createdAt: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  userId: string;
  issueId: string | null;
  createdAt: string;
}

export interface PaginationResponse {
  total: number;
  pages: number;
  page: number;
  limit: number;
}

export interface ErrorResponse {
  error: string;
  message?: string;
}
