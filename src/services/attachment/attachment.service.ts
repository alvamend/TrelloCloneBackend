import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AttachmentCreateDto } from 'src/dto/attachment/attachment.create.dto';
import { AttachmentInterface } from 'src/interfaces/attachment.interface';
import * as moment from 'moment';
import { StorageService } from '../storage/storage.service';
import { Request } from 'express';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectModel('Attachment') private Attachment: Model<AttachmentInterface>,
    private storageService: StorageService,
  ) {}

  getFromCards = async (cardId: string): Promise<AttachmentInterface[]> => {
    if (cardId.length !== 24) throw new NotFoundException('invalid id');
    try {
      const attachments: Array<AttachmentInterface> =
        await this.Attachment.find({ cardId: cardId });

      return attachments;
    } catch (error) {
      throw error;
    }
  };

  addFile = async (
    file: Express.Multer.File,
    body: AttachmentCreateDto,
    cardId: string,
    req: Request,
  ): Promise<Object> => {
    try {
      // Generate another name to the file, if not, then the file will be overwritten
      const newFileName = `${moment().unix()}-${file.originalname}`;
      file.filename = newFileName;

      //    Call uploadfile method, if it worked, then we proceed to create an attachment record
      const fileSaved = await this.storageService.uploadFile(file);
      if (!fileSaved)
        throw new InternalServerErrorException('could not upload the file');

      const createdAttachment: AttachmentInterface =
        await this.Attachment.create({
          cardId: cardId,
          filename: newFileName,
          user: req.user['sub'],
          description: body?.description,
        });

      if (!createdAttachment)
        throw new InternalServerErrorException('could not upload the file');
      return { message: 'attachment added', createdAttachment };
    } catch (error) {
      throw error;
    }
  };

  getFile = async (fileName: string): Promise<string> => {
    try {
      const signedUrl = await this.storageService.getSignedUrl(fileName);
      return signedUrl;
    } catch (error) {
      throw error;
    }
  };

  getAttachment = async (id: string): Promise<AttachmentInterface> => {
    try {
      const attachment = await this.Attachment.findOne({ _id: id });
      if (!attachment) throw new NotFoundException('attachment does not exist');

      return attachment;
    } catch (error) {
      throw error;
    }
  };

  delete = async (id: string): Promise<Object> => {
    try {
      const deleted = await this.Attachment.findOne({ _id: id });
      if (!deleted) throw new NotFoundException('attachment not found');
      const deletedFromGCP = await this.storageService.deleteFile(
        deleted.filename,
      );
      if (deletedFromGCP) {
        await deleted.deleteOne();
        return { message: 'attachment deleted' };
      }
    } catch (error) {
      throw error;
    }
  };
}
