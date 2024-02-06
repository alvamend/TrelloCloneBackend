import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import mongoose, { Model } from "mongoose";
import { CardInterface } from "src/interfaces/card.interface";
import { ListInterface } from "src/interfaces/list.interface";

@Injectable()
export class CanEditCard implements CanActivate {
    constructor(
        @InjectModel('Card') private readonly Card: Model<CardInterface>,
        @InjectModel('List') private readonly List: Model<ListInterface>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        // Verify if the Card exists
        const req = context.switchToHttp().getRequest<Request>();
        const id = new mongoose.Types.ObjectId(req.params.id);
        let userCanEditCard: boolean = false;
        try {
            const cardExists = await this.Card.aggregate([
                {
                    $match: { '_id': id }
                }, {
                    $lookup: {
                        from: 'lists',
                        localField: 'listRef',
                        foreignField: '_id',
                        as: 'listInfo'
                    }
                }, {
                    $unwind: '$listInfo'
                }, {
                    $lookup: {
                        from: 'boards',
                        localField: 'listInfo.boardRef',
                        foreignField: '_id',
                        as: 'boardInfo'
                    }
                }, {
                    $unwind: '$boardInfo'
                }
            ]);

            // If no value, it means the card does not exist
            if(cardExists.length === 0) throw new NotFoundException('card does not exist')

            // Here we verify if the logged in user is part of the board
            cardExists[0].boardInfo.members.forEach(member => {
                if(member.user.valueOf() === req.user['sub'].valueOf()){
                    userCanEditCard = true;
                }
            });

            if(!userCanEditCard) throw new UnauthorizedException('only members of the board can make changes to the cards')

        } catch (error) {
            throw error
        }

        return true;
    }
}