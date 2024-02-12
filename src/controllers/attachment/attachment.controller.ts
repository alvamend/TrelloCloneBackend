import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  ParseFilePipeBuilder,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AttachmentCreateDto } from 'src/dto/attachment/attachment.create.dto';
import { IdElementLength } from 'src/guards/IdElementLength.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanEditCard } from 'src/guards/canEditCard.guard';
import { AttachmentService } from 'src/services/attachment/attachment.service';

@Controller('attachment')
@UseGuards(AuthGuard)
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Get()
  getAttachmentsFromCard(@Query() query) {
    return this.attachmentService.getFromCards(query.card);
  }

  @Get(':id')
  @UseGuards(IdElementLength)
  getAttachment(@Param() params) {
    return this.attachmentService.getAttachment(params.id);
  }

  @Delete(':id')
  @UseGuards(IdElementLength)
  deleteAttachment(@Param() params) {
    return this.attachmentService.delete(params.id);
  }

  @Get('file/:filename')
  async getFile(@Param() params, @Res() response: Response) {
    const signedUrl = await this.attachmentService.getFile(params.filename);
    return response.status(200).json({signedUrl})
  }

  @Post('card=:id')
  @UseGuards(IdElementLength, CanEditCard)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'jpeg|png|jpg|pdf|JPG',
        })
        .addMaxSizeValidator({
          maxSize: 1000000,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Body() body: AttachmentCreateDto,
    @Param() params,
    @Req() req: Request,
  ) {
    return this.attachmentService.addFile(file, body, params.id, req);
  }
}
