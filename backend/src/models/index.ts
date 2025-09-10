export interface User {
  id: number;
  email: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post {
  id: number;
  title: string;
  content: string | null;
  published: boolean;
  authorId: number;
  createdAt: Date;
  updatedAt: Date;
}
