import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private User: Model<UserInterface>) { }

    
}
