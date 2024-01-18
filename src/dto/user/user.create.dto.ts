import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class UserCreateDto{
    @IsNotEmpty({message: 'name cannot be empty'})
    name: string;

    @IsNotEmpty({message: 'surname cannot be empty'})
    surname: string;

    @IsOptional()
    @IsNotEmpty({message: 'bio cannot be empty'})
    bio: string;

    @IsNotEmpty({message: 'username cannot be empty'})
    username: string;

    @IsEmail()
    @IsNotEmpty({message: 'email cannot be empty'})
    email: string;

    @IsNotEmpty({message: 'password cannot be empty'})
    password: string;

    @IsOptional()
    @IsNotEmpty({message: 'role cannot be empty'})
    role: string;
}