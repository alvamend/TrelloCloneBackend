import { IsOptional } from 'class-validator';

export class AttachmentCreateDto {
  @IsOptional()
  description: string;
}
