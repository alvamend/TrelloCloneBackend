import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Request } from "express";
import { Observable } from "rxjs";
import { ADMIN_KEY, PUBLIC_KEY, ROLES_KEY } from "src/constants/key-decorator";
import { ROLES } from "src/constants/roles";

@Injectable()
export class RolesGuard implements CanActivate{
    constructor(private readonly reflector:Reflector){}

    canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {

        const isPublic = this.reflector.get<boolean>(PUBLIC_KEY, context.getHandler());
        if(isPublic) return true;

        const roles = this.reflector.get<Array<keyof typeof ROLES>>(ROLES_KEY, context.getHandler());
        const admin = this.reflector.get<String>(ADMIN_KEY, context.getHandler());

        const req = context.switchToHttp().getRequest<Request>();
        const userRole = req.user['role'];
        // Check if admin decorator is present and if current user is admin, will return true
        if(admin && userRole === admin){
            return true;
        };

        if(roles === undefined){
            if(!admin){
                return true;
            }else if(admin && userRole == 'admin'){
                return true;
            }else{
                throw new UnauthorizedException('Not enough privileges');
            };
        };

        const isAuth = roles.some((role) => {
            if(role.toLowerCase() === userRole){
                return true;
            };
        });

        if(!isAuth){
            throw new UnauthorizedException('Not enough privileges');
        }

        return true;
    }
}