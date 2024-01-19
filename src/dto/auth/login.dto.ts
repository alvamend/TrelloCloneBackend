import { IsEmail, IsNotEmpty } from "class-validator";

export class LoginDto{
    @IsNotEmpty({message:'email cannot be empty'})
    @IsEmail()
    email: string;

    @IsNotEmpty({message: 'password cannot be empty'})
    password: string;
}