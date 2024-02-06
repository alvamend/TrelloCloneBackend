import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { ListCreateDto } from 'src/dto/list/list.create.dto';
import { ListUpdateDto } from 'src/dto/list/list.update.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { QueryInterface } from 'src/interfaces/query.interface';
import { ListService } from 'src/services/list/list.service';

@Controller('list')
@UseGuards(AuthGuard)
export class ListController {
    constructor(private listService: ListService) { }

    @Get('query')
    getListsFromBoard(@Query() query: QueryInterface) {
        return this.listService.getAllListsFromBoard(query.b, query.s);
    }

    @Post()
    @UsePipes(ValidationPipe)
    createList(@Body() dto: ListCreateDto, @Req() req: Request) {
        return this.listService.create(dto, req);
    }

    @Put(':id')
    @UsePipes(ValidationPipe)
    updateList(@Param() params, @Body() dto: ListUpdateDto, @Req() req: Request) {
        return this.listService.edit(params.id, dto, req);
    }

    @Delete(':id')
    deleteList(@Param() params, @Req() req: Request){
        return this.listService.delete(params.id, req);
    }
}
