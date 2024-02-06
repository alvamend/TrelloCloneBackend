import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { BoardInterface } from "src/interfaces/board.interface";
import { ListInterface } from "src/interfaces/list.interface";

@Injectable()
export class CanEditList implements CanActivate {

    constructor(
        @InjectModel('List') private readonly List: Model<ListInterface>,
        @InjectModel('Board') private readonly Board: Model<BoardInterface>
    ) { }

    async canActivate(context: ExecutionContext) {
        const req = context.switchToHttp().getRequest<Request>();
        const { id } = req.params;
        let userBelongsToBoard: boolean = false;
        try {
            // Check if the list exists, if not, return a not found exception
            const listExists: ListInterface = await this.List.findOne({ _id: id });
            if (!listExists) throw new NotFoundException('list does not exist');

            // Verify if the user belongs to the board of the list boardReference field, only members of the board can modify the lists
            // Get the board
            const boardRef: BoardInterface = await this.Board.findOne({ _id: listExists.boardRef });

            boardRef.members.forEach(member => {
                if (member.user.valueOf() === req.user['sub'].valueOf()) {
                    userBelongsToBoard = true;
                }
            });

            if (!userBelongsToBoard) throw new UnauthorizedException('only members of the board can make changes to the lists');
        } catch (error) {
            throw error
        }

        return true
    }
}