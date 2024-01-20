import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class WorkspaceAddMemberDto{
    @IsNotEmpty({message:'email cannot be empty'})
    @IsEmail()
    email: string;

    @IsNotEmpty()
    workspaceRole: string;
}