import { Body, Controller, Delete, Get, Param, Post, Put, Query, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { ListCreateDto } from 'src/dto/list/list.create.dto';
import { ListUpdateDto } from 'src/dto/list/list.update.dto';
import { IdElementLength } from 'src/guards/IdElementLength.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanCreateListOrCard } from 'src/guards/canCreateListOrCard.guard';
import { CanEditList } from 'src/guards/canEditList.guard';
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
    @UseGuards(CanCreateListOrCard)
    @UsePipes(ValidationPipe)
    createList(@Body() dto: ListCreateDto) {
        return this.listService.create(dto);
    }

    @Put(':id')
    @UseGuards(IdElementLength, CanEditList)
    @UsePipes(ValidationPipe)
    updateList(@Param() params, @Body() dto: ListUpdateDto) {
        return this.listService.edit(params.id, dto);
    }

    @Delete(':id')
    @UseGuards(IdElementLength, CanEditList)
    deleteList(@Param() params){
        return this.listService.delete(params.id);
    }
}
