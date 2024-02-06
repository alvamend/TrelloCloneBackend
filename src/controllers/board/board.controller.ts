import { Body, Controller, Delete, Get, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { BoardAddDto } from 'src/dto/board/board.add.dto';
import { BoardCreateDto } from 'src/dto/board/board.create.dto';
import { BoardUpdateDto } from 'src/dto/board/board.update.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { IdElementLength } from 'src/middlewares/IdElementLength.middleware';
import { BoardService } from 'src/services/board/board.service';

@Controller('board')
@UseGuards(AuthGuard)
export class BoardController {

    constructor(private boardService: BoardService) { }

    @Post()
    @UsePipes(ValidationPipe)
    createBoard(@Req() req: Request, @Body() body: BoardCreateDto) {
        return this.boardService.create(req, body);
    }

    @Put(':id')
    @UseGuards(IdElementLength)
    @UsePipes(ValidationPipe)
    updateBoard(@Req() req: Request, @Body() body: BoardUpdateDto, @Param() params) {
        return this.boardService.update(req, body, params.id);
    }

    @Get(':id')
    @UseGuards(IdElementLength)
    getBoard(@Param() params, @Req() req: Request) {
        return this.boardService.retrieveBoard(params.id, req);
    }

    @Put('add-member/:id')
    @UseGuards(IdElementLength)
    addMember(@Param() params, @Body() body: BoardAddDto, @Req() req: Request) {
        return this.boardService.addMember(params.id, body, req);
    }

    @Put('remove-member/:id')
    @UseGuards(IdElementLength)
    removeMember(@Param() params, @Body() body: BoardAddDto, @Req() req: Request) {
        return this.boardService.removeMember(params.id, body, req);
    }

    @Delete(':id')
    @UseGuards(IdElementLength)
    delete(@Param() params, @Req() req: Request) {
        return this.boardService.delete(params.id, req);
    }
}
