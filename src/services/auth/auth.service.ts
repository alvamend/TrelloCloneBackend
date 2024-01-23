import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateDto } from 'src/dto/user/user.create.dto';
import { UserInterface } from 'src/interfaces/user.interface';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { LoginDto } from 'src/dto/auth/login.dto';
import { TokenPayload, TokenPayloadVerify } from 'src/interfaces/auth.interface';
import { WorkspaceInterface } from 'src/interfaces/workspace.interface';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel('User') private User: Model<UserInterface>,
        @InjectModel('Workspace') private Workspace: Model<WorkspaceInterface>
    ) { }

    private signJwt = (payload: jwt.JwtPayload, secretKey: string, duration: string) => {
        return jwt.sign(payload, secretKey, { expiresIn: duration });
    }

    signUp = async (userCreateDto: UserCreateDto, res: Response): Promise<Object> => {
        try {
            //Verify if user exists
            const userExists: UserInterface = await this.User.findOne({
                $or: [
                    { email: userCreateDto.email },
                    { username: userCreateDto.username }
                ]
            });

            //If the user exists, verify which fields already exist
            if (userExists) {
                if (userExists.email === userCreateDto.email && userExists.username === userCreateDto.username) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'email and username already exist' })
                } else if (userExists.username === userCreateDto.username) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'username already exists' });
                } else if (userExists.email === userCreateDto.email) {
                    return res.status(HttpStatus.BAD_REQUEST).json({ message: 'email already exists' });
                }
            }

            //Hash password
            const hashedPassword = bcrypt.hashSync(userCreateDto.password, 10);
            const createdUser = await this.User.create({
                name: userCreateDto.name,
                surname: userCreateDto.surname,
                bio: userCreateDto?.bio,
                username: userCreateDto.username,
                email: userCreateDto.email,
                password: hashedPassword,
                role: userCreateDto?.role
            })

            //Create default workspace when a user registers
            const defaultWorkspace = await this.Workspace.create({
                title: createdUser.name + ' ' + createdUser.surname + ' Workspace',
                members: {
                    user: createdUser._id,
                    workspaceRole: 'administrator'
                },
                privacy: 'private'
            })

            // Return success if user was created
            if (createdUser && defaultWorkspace) return res.status(HttpStatus.CREATED).json({
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
                username: findUser.username,
                email: findUser.email,
                role: findUser.role
            }

            // Create refresh and access token
            const accessToken = this.signJwt(payload, `${process.env.ACCESS_TOKEN}`, `${process.env.ACCESS_TOKEN_DURATION}`);
            const refreshToken = this.signJwt(payload, `${process.env.REFRESH_TOKEN}`, `${process.env.REFRESH_TOKEN_DURATION}`);

            res.cookie('jwt', refreshToken, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });

            return res.status(200).json({
                sub: findUser._id,
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
        if (!req?.cookies?.jwt) return res.sendStatus(204);

        res.clearCookie('jwt', { httpOnly: true, sameSite: 'none', secure: true });
        res.sendStatus(204);
    }

    refresh = (req: Request, res: Response) => {
        const token: string = req?.cookies?.jwt;
        // If not token is present in the cookie, return unauthorized
        if (!token) return res.sendStatus(401);

        jwt.verify(
            token,
            `${process.env.REFRESH_TOKEN}`,
            (err, decode: TokenPayloadVerify) => {
                // If token expired, will return a Forbidden Request
                if (err) return res.sendStatus(403)
                const newPayload: TokenPayload = {
                    sub: decode.sub,
                    name: decode.name,
                    surname: decode.surname,
                    username: decode.surname,
                    email: decode.email,
                    role: decode.role
                }

                const newAccessToken = this.signJwt(newPayload, `${process.env.ACCESS_TOKEN}`, `${process.env.ACCESS_TOKEN_DURATION}`);
                return res.status(200).json({
                    sub: decode.sub,
                    username: decode.username,
                    email: decode.email,
                    role: decode.role,
                    accessToken: newAccessToken
                })
            }
        )
    }

}
