import { Controller, Post, Put, Delete, Body, Param, Query, Get, Req, UsePipes, ValidationPipe, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { CardCreateDto } from 'src/dto/card/card.create.dto';
import { IdElementLength } from 'src/guards/IdElementLength.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanCreateListOrCard } from 'src/guards/canCreateListOrCard.guard';
import { CanEditCard } from 'src/guards/canEditCard.guard';
import { CardService } from 'src/services/card/card.service';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
    constructor(private cardService: CardService) { }

    @Post()
    @UsePipes(ValidationPipe)
    @UseGuards(CanCreateListOrCard)
    createCard(@Body() body:CardCreateDto, @Req() req:Request){
        return this.cardService.create(body, req);
    }

    @Delete(':id')
    @UseGuards(IdElementLength, CanEditCard)
    deleteCard(@Param() params){
        return this.cardService.delete(params.id);
    }
}
