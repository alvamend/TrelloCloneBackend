import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Get,
  Req,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { CardCreateDto } from 'src/dto/card/card.create.dto';
import { CardEditDto } from 'src/dto/card/card.edit.dto';
import { CardMemberManagement } from 'src/dto/card/card.member.dto';
import { IdElementLength } from 'src/guards/IdElementLength.guard';
import { AuthGuard } from 'src/guards/auth.guard';
import { CanCreateListOrCard } from 'src/guards/canCreateListOrCard.guard';
import { CanEditCard } from 'src/guards/canEditCard.guard';
import { CardQueryInterface } from 'src/interfaces/query.interface';
import { CardService } from 'src/services/card/card.service';

@Controller('card')
@UseGuards(AuthGuard)
export class CardController {
  constructor(private cardService: CardService) {}

  @Post()
  @UsePipes(ValidationPipe)
  @UseGuards(CanCreateListOrCard)
  createCard(@Body() body: CardCreateDto, @Req() req: Request) {
    return this.cardService.create(body, req);
  }

  @Get('query')
  getAllCardsFromList(@Query() query: CardQueryInterface) {
    return this.cardService.getAllFromList(query.l, query.s);
  }

  @Get(':id')
  @UseGuards(IdElementLength)
  getCard(@Param() params) {
    return this.cardService.retrieveCard(params.id);
  }

  @Put(':id')
  @UseGuards(IdElementLength, CanEditCard)
  @UsePipes(ValidationPipe)
  editCard(@Param() params, @Body() body: CardEditDto) {
    return this.cardService.edit(params.id, body);
  }

  @Delete(':id')
  @UseGuards(IdElementLength, CanEditCard)
  deleteCard(@Param() params) {
    return this.cardService.delete(params.id);
  }

  @Put('add-member/:id')
  @UseGuards(IdElementLength, CanEditCard)
  @UsePipes(ValidationPipe)
  addMember(@Param() params, @Body() body: CardMemberManagement) {
    return this.cardService.addMember(params.id, body);
  }

  @Put('remove-member/:id')
  @UseGuards(IdElementLength, CanEditCard)
  @UsePipes(ValidationPipe)
  removeMember(@Param() params, @Body() body: CardMemberManagement) {
    return this.cardService.removeMember(params.id, body);
  }
}
