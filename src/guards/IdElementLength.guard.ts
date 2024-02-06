import { CanActivate, ExecutionContext, Injectable, NotFoundException } from "@nestjs/common";
import { Request } from "express";
import { Observable } from "rxjs";

@Injectable()
export class IdElementLength implements CanActivate {
    constructor() { }

    canActivate(context: ExecutionContext) {

        const req = context.switchToHttp().getRequest<Request>();
        const { id } = req.params;

        if (id.length !== 24) throw new NotFoundException('invalid id')

        return true;
    }
}