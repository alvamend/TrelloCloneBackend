import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from 'src/dto/user/user.create.dto';
import { UserInterface } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import { Response } from 'express';

@Injectable()
export class UserService {

    constructor(@InjectModel('User') private User: Model<UserInterface>) { }

    getAll = async (): Promise<UserInterface[]> => {
        return await this.User.find();
    }

    createUser = async (userCreateDto: UserCreateDto, res: Response):Promise<Object> => {
        try {
            //VERIFY IF USER EXISTS
            const userExists: UserInterface = await this.User.findOne({
                $or: [
                    { email: userCreateDto.email },
                    { username: userCreateDto.username }
                ]
            });

            //IF THE USER EXISTS, VERIFY WHICH FIELDS ALREADY EXIST
            if (userExists) {
                if (userExists.email === userCreateDto.email && userExists.username === userCreateDto.username) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'email and username already exist' })
                } else if (userExists.username === userCreateDto.username) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'username already exists' });
                } else if (userExists.email === userCreateDto.email) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'email already exists' });
                }
            }

            //HASH PASSWORD
            const hashedPassword = bcrypt.hashSync(userCreateDto.password, 10);
            const createdUser = await this.User.create({
                name: userCreateDto.email,
                surname: userCreateDto.surname,
                bio: userCreateDto?.bio,
                username: userCreateDto.username,
                email: userCreateDto.email,
                password: hashedPassword,
                role: userCreateDto?.role
            })

            // IF USER WAS CREATED, RETURN SUCCESSFUL
            if (createdUser) return res.status(HttpStatus.CREATED).json({
                message: 'user created succesfully'
            })

        } catch (error) {
            throw error
        }
    }
}
