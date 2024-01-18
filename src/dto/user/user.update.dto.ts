import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class UserUpdateDto{
    @IsNotEmpty({message: 'username cannot be empty'})
    username: string;

    @IsOptional()
    @IsNotEmpty({message: 'bio cannot be empty'})
    bio: string;
}