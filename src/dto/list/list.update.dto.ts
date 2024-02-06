import { IsNotEmpty, IsOptional, Length } from "class-validator";

export class ListUpdateDto {
    @IsOptional()
    @IsNotEmpty({ message: 'title cannot be empty' })
    title: string;

    @IsOptional()
    @IsNotEmpty({ message: 'board reference cannot be empty' })
    @Length(24, 24, { message: 'board ref must be 24 characters' })
    boardRef: string;

    @IsOptional()
    status: string;
}