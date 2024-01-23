import { IsNotEmpty } from "class-validator";

export class BoardAddDto {
    @IsNotEmpty({ message: 'email cannot be empty' })
    email:string;
}