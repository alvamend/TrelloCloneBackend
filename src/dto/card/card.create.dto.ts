import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CardCreateDto{
    @IsNotEmpty({message: 'title cannot be empty'})
    title: string;

    @IsOptional()
    description: string;

    @IsNotEmpty({message: 'list reference cannot be empty'})
    @Length(24,24, {message: 'list reference id must be 24 characters'})
    listRef: string;
}