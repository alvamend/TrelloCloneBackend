import { IsEmail, IsNotEmpty, IsOptional, MinLength } from "class-validator";

export class UserUpdateDto{
    @IsOptional()
    @IsNotEmpty({message: 'username cannot be empty'})
    username: string;

    @IsOptional()
    @IsNotEmpty({message: 'bio cannot be empty'})
    @MinLength(5)
    bio: string;
}