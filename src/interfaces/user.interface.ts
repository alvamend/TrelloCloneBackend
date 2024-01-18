import { Document } from "mongoose";

export interface UserCreateInterface extends Document{
    name: string;
    surname: string;
    bio?: string;
    email: string;
    password: string;
    role?: string;
}