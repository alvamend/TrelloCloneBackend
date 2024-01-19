import { Body, Controller, Delete, Get, Post, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginDto } from 'src/dto/auth/login.dto';
import { UserCreateDto } from 'src/dto/user/user.create.dto';
import { AuthService } from 'src/services/auth/auth.service';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('signup')
    @UsePipes(ValidationPipe)
    signUp(@Body() userCreateDto: UserCreateDto, @Res() res: Response) {
        return this.authService.signUp(userCreateDto, res)
    }

    @Post('login')
    @UsePipes(ValidationPipe)
    handleLogin(@Body() loginDto: LoginDto, @Res() res: Response) {
        return this.authService.login(loginDto, res);
    }

    @Delete('logout')
    handleLogout(@Req() req: Request, @Res() res: Response) {
        return this.authService.logout(req, res);
    }

    @Get('refresh')
    handleRefresh(@Req() req: Request, @Res() res: Response) {
        return this.authService.refresh(req, res);
    }

}
