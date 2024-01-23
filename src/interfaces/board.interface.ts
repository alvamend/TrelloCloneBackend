import { Document } from "mongoose";

export interface BoardInterface extends Document{
    title: string;
    description?: string;
    workspaceRef: string;
    members: Array<Members>;
    privacy?: string;
    background?: string;
}

export interface Members{
    user: string;
    boardRole: string;
}