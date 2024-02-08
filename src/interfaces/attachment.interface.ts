import { Document } from 'mongoose';

export interface AttachmentInterface extends Document {
  listId: string;
  filename: string;
}
