import { Document } from "mongoose";

export interface ListInterface extends Document{
    title: string;
    boardRef: string;
    status: string;
}