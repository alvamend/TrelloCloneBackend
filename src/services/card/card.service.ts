import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { CardCreateDto } from 'src/dto/card/card.create.dto';
import { CardInterface } from 'src/interfaces/card.interface';

@Injectable()
export class CardService {
    constructor(@InjectModel('Card') private Card: Model<CardInterface>) { }

    create = async (body: CardCreateDto, req: Request): Promise<Object> => {
        try {
            const createdCard = await this.Card.create({
                title: body.title,
                description: body?.description,
                listRef: body.listRef,
                members: [{
                    user: req.user['sub']
                }]
            });
            if (createdCard) return { message: 'card was created', card: createdCard }
        } catch (error) {
            throw error
        }
    }

    delete = async (id: string) => {
        try {
            const deletedCard = await this.Card.findOneAndDelete({ _id: id });
            if (deletedCard) return { message: 'card deleted' }
        } catch (error) {
            throw error
        }
    }
}
