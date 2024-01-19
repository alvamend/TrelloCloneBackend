import { Controller, Get, Put, Delete, Param, Body, Req, Res, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Request, Response } from 'express';
import { UserUpdateDto } from 'src/dto/user/user.update.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { UserService } from 'src/services/user/user.service';

@Controller('user')
@UseGuards(AuthGuard)
export class UserController {

    constructor(private userService: UserService) { }

    @Put(':id')
    @UsePipes(ValidationPipe)
    updateUser(@Param() params, @Body() userUpdateDto: UserUpdateDto, @Req() req: Request) {
        return this.userService.updateInfo(params.id, userUpdateDto, req);
    }

}
