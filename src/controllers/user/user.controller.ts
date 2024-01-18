import { Controller, Get, Post, Put, Delete, Param, Body, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Response } from 'express';
import { UserCreateDto } from 'src/dto/user/user.create.dto';
import { UserUpdateDto } from 'src/dto/user/user.update.dto';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
export class UserController {

    constructor(private userService:UserService){}

    @Get()
    getAllUsers(){
        return this.userService.getAll();
    }

    @Post()
    @UsePipes(ValidationPipe)
    createUser(@Body() userCreateDto:UserCreateDto, @Res() res:Response){
        return this.userService.createUser(userCreateDto, res);
    }

    @Put(':id')
    @UsePipes(ValidationPipe)
    updateUser(@Body() userUpdateDto:UserUpdateDto, @Res() res:Response){
        
    }

}
