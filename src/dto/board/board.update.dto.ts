import { IsNotEmpty, IsOptional } from "class-validator";

export class BoardUpdateDto {
    @IsOptional()
    @IsNotEmpty({ message: 'title cannot be empty' })
    title: string;

    @IsOptional()
    @IsNotEmpty({ message: 'description cannot be empty' })
    description: string;

    @IsOptional()
    @IsNotEmpty({ message: 'privacy cannot be empty' })
    privacy: string;

    @IsOptional()
    background: string;
}