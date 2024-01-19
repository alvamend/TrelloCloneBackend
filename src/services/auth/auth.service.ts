import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from 'src/dto/user/user.create.dto';
import { UserInterface } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { LoginDto } from 'src/dto/auth/login.dto';
import { TokenPayload } from 'src/interfaces/auth.interface';

@Injectable()
export class AuthService {

    constructor(@InjectModel('User') private User: Model<UserInterface>) { }

    private signJwt = (payload: jwt.JwtPayload, secretKey: string, duration: string) => {
        return jwt.sign(payload, secretKey, { expiresIn: duration });
    }

    signUp = async (userCreateDto: UserCreateDto, res: Response): Promise<Object> => {
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

    login = async (loginDto: LoginDto, res: Response) => {
        const { email, password } = loginDto;
        try {
            // Verify if user exists
            const findUser: UserInterface = await this.User.findOne({ email: email });
            if (!findUser) throw new HttpException('incorrect email or password', HttpStatus.NOT_FOUND);

            // Verify if password matches
            const matchPwd: boolean = bcrypt.compareSync(password, findUser.password);
            if (!matchPwd) throw new HttpException('incorrect email or password', HttpStatus.NOT_FOUND);

            // Create payload to generate access and refresh token
            const payload: TokenPayload = {
                sub: findUser._id,
                name: findUser.name,
                surname: findUser.surname,
                email: findUser.email,
                role: findUser.role
            }

            // Create refresh and access token
            const accessToken = this.signJwt(payload, `${process.env.ACCESS_TOKEN}`, '30m');
            const refreshToken = this.signJwt(payload, `${process.env.REFRESH_TOKEN}`, '1h');

            res.cookie('jwt', refreshToken);

            return res.status(200).json({
                username: findUser.username,
                email: findUser.email,
                role: findUser.role,
                accessToken: accessToken
            })

        } catch (error) {
            throw error
        }
    }

    logout = (req: Request, res: Response) => {
        if(!req?.cookies?.jwt) return res.sendStatus(204);

        res.clearCookie('jwt', {httpOnly: true, sameSite: 'none', secure: true});
        res.sendStatus(204);
    }

}
