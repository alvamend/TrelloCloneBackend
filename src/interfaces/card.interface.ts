import { Document } from "mongoose";

export interface CardInterface extends Document{
    title: string;
    description?: string;
    listRef: string;
    members: Array<string>;
    dueDate?: Date;
    attachments?: Array<string>;
    cover?: string;
}