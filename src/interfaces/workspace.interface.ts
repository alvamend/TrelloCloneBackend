import { Document } from "mongoose";

export interface WorkspaceInterface extends Document{
    title: string;
    privacy?: string;
    members: Array<Members>;
}

export interface Members{
    user: string;
    workspaceRole?: string;
}

export interface WorkspaceEdit{
    privacy?: string;
    title?: string;
}

export interface WorkspaceAddMember{
    email: string;
}