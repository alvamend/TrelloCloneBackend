import { IsNotEmpty, IsOptional } from "class-validator";

export class WorkspaceCreateDto{
    @IsNotEmpty({message:'title cannot be empty'})
    title: string;

    @IsOptional()
    @IsNotEmpty({message: 'privacy cannot be empty'})
    privacy: string;
    
}