import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class CardEditDto{
    @IsOptional()
    @IsNotEmpty({message: 'title cannot be empty'})
    title: string;

    @IsOptional()
    @IsNotEmpty({message: 'description cannot be empty'})
    description: string;

    @IsOptional()
    @IsNotEmpty({message: 'list reference cannot be empty'})
    @Length(24,24, {message: 'list reference id must be 24 characters'})
    listRef: string;

    @IsOptional()
    cover: string;

    @IsOptional()
    @IsNotEmpty({message: 'status cannot be empty'})
    status: string;

    @IsOptional()
    dueDate: string;
}