import { IsNotEmpty } from "class-validator";

export class BoardDeleteDto {
    @IsNotEmpty({ message: 'email cannot be empty' })
    email:string;
}