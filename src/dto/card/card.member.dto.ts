import { IsEmail, IsNotEmpty } from "class-validator";

export class CardMemberManagement {
    @IsNotEmpty({ message: 'email cannot be empty' })
    @IsEmail()
    email: string;
}