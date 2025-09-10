import { Issue } from './issueModel';

export interface Image {
  id: string;
  url: string;
  issueId: string;
  issue?: Issue;
  createdAt: Date;
}
