import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

export class UserCreateDto{
    @IsNotEmpty({message: 'Name cannot be empty'})
    name: string;

    @IsNotEmpty({message: 'Surname cannot be empty'})
    surname: string;

    @IsOptional()
    @IsNotEmpty({message: 'Bio cannot be empty'})
    bio: string;

    @IsEmail()
    @IsNotEmpty({message: 'Email cannot be empty'})
    email: string;

    @IsNotEmpty({message: 'Name cannot be empty'})
    password: string;

    @IsOptional()
    @IsNotEmpty({message: 'Name cannot be empty'})
    role: string;
}