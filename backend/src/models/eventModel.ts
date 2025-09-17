import { User } from './userModel';

export interface Event {
  id: string;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  eventDate: Date;
  imageUrl?: string;
  creatorId: string;
  creator?: User;
  createdAt: Date;
  updatedAt: Date;
}