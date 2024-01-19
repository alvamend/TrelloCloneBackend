import { Controller, Get, Post, Put, Delete, Param, Body, Req, Res, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserUpdateDto } from 'src/dto/user/user.update.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {

    constructor(private userService:UserService){}

    @Put(':id')
    updateUser(@Body() userUpdateDto:UserUpdateDto, @Res() res:Response){
        console.log('HOLA')
    }

}
