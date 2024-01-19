import { BadRequestException, ForbiddenException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { UserUpdateDto } from 'src/dto/user/user.update.dto';
import { UserInterface } from 'src/interfaces/user.interface';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private User: Model<UserInterface>) { }

    updateInfo = async (id: string, updateDto: UserUpdateDto, req: Request): Promise<ForbiddenException | BadRequestException | Object> => {
        // Check if ID is different than 24 and if ID matches the id in the request user
        if (id.length !== 24) throw new HttpException('user not found', HttpStatus.NOT_FOUND);
        if (req.user['sub'].valueOf() !== id) throw new ForbiddenException('Forbidden Request')

        try {
            // Verify if username is already taken by another user
            const usernameExists = await this.User.findOne({ username: updateDto.username });
            if (usernameExists) throw new BadRequestException('username already taken');

            // Update new information in the collection
            const updateUserInfo = await this.User.findOneAndUpdate({ _id: id }, {
                username: updateDto?.username,
                bio: updateDto?.bio
            });

            if (!updateDto) throw new BadRequestException('could not update information');
            return { message: 'user updated succesfully' }

        } catch (error) {
            throw error
        }
    }
}
