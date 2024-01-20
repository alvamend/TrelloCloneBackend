import { IsEmail, IsNotEmpty } from "class-validator";

export class WorkspaceRemoveMemberDto{
    @IsNotEmpty({message:'email cannot be empty'})
    @IsEmail()
    email: string;
}