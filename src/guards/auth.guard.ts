import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PUBLIC_KEY } from "src/constants/key-decorator";
import { Request } from "express";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserInterface } from "src/interfaces/user.interface";
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthGuard implements CanActivate {

    constructor(
        private readonly reflector: Reflector,
        @InjectModel('User') private readonly User: Model<UserInterface>
    ) { }

    async canActivate(context: ExecutionContext) {

        // Check if public decorator exists, if it exists, anyone can access
        const isPublic: boolean = this.reflector.get<boolean>(PUBLIC_KEY, context.getHandler());

        if (isPublic) {
            return true;
        }

        // Validate if jwt token exists, if not, returns UnauthorizedException
        const req = context.switchToHttp().getRequest<Request>();
        const token: string = req.headers['authorization'];
        if (!token) throw new UnauthorizedException(`Token not present`);
        let userDecoded: string | jwt.JwtPayload;

        const tokenIsValid: void = jwt.verify(
            token,
            `${process.env.ACCESS_TOKEN}`,
            (err, decode) => {
                if (err) throw new UnauthorizedException('Token expired');
                userDecoded = decode
            }
        );

        if (tokenIsValid !== null) {
            const userExists: UserInterface = await this.User.findOne({ _id: userDecoded.sub });
            if (!userExists) throw new UnauthorizedException('Cannot access this resource');

            // If user found is an Admin, can access immediately
            if(userExists.role === 'admin'){
                return true;
            }
        }

        return true;
    }
}