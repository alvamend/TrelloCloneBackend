import { Document } from "mongoose";

export interface UserInterface extends Document{
    name: string;
    surname: string;
    bio?: string;
    username: string;
    email: string;
    password: string;
    role?: string;
}

export interface UserCreateInterface{
    name: string;
    surname: string;
    bio?: string;
    username: string;
    email: string;
    password: string;
    role?: string;
}