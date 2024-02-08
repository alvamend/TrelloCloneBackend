import { Document } from "mongoose";

export interface CardInterface extends Document {
    title: string;
    description?: string;
    listRef: string;
    members: Array<Members>;
    dueDate?: Date;
    cover?: string;
    status?: string;
}

interface Members {
    user: string;
}