import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class AdminService {

    constructor(@InjectModel('User') private User:Model<UserInterface>){}

    getAllUsers = async (): Promise<UserInterface[]> => {
        return await this.User.find().select({password:0});
    }
}
