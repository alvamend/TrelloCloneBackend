import { Document } from "mongoose";

export interface CardInterface extends Document {
    title: string;
    description?: string;
    listRef: string;
    members: Array<Members>;
    dueDate?: Date;
    cover?: string;
    status?: string;
    taskList: Array<Tasks>;
}

interface Members {
    user: string;
}

interface Tasks {
    task: string;
}