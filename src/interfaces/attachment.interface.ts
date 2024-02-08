import { Document } from 'mongoose';

export interface AttachmentInterface extends Document {
  cardId: string;
  filename: string;
  user: string;
  description?: string
}
