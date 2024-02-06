import { Document } from "mongoose";

export interface CardInterface extends Document{
    title: string;
    description?: string;
    listRef: string;
    members: Array<Members>;
    dueDate?: Date;
    attachments?: Array<string>;
    cover?: string;
}

interface Members{
    user: string;
}