import { CanActivate, ExecutionContext, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { BoardInterface } from "src/interfaces/board.interface";
import { ListInterface } from "src/interfaces/list.interface";

// This guard is to check if a user belongs to a specific board, to allow to create, edit, delete, add-remove elements (List or Card)
@Injectable()
export class CanCreateListOrCard implements CanActivate {
    constructor(
        @InjectModel('List') private readonly List: Model<ListInterface>,
        @InjectModel('Board') private readonly Board: Model<BoardInterface>
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {

        const req = context.switchToHttp().getRequest<Request>();
        let userCanMakeChanges: boolean = false;

        //Check if we are working with a card or a list. A Card contains a field called "listRef", while a List contains a field called "boardRef", in both cases, we need to make sure that the user belongs to the Board to make any changes

        // When creating a card or list, the reference will be handled by the request body
        if (req.body.listRef || req.body.boardRef) {
            if (req.body.listRef) {
                const { listRef } = req.body;
                // Get the board information from the list with the populate
                const listExists: any = await this.List.findOne({ _id: listRef }).populate('boardRef', ['members'], this.Board);

                // Destructuring the boardRef, it contains the members and it will validate if the current request user is part of the board
                const { boardRef } = listExists;
                userCanMakeChanges = this.checkIfUserBelongsToBoard(boardRef, req);
            }

            if (req.body.boardRef) {
                // Check if the board exists, if it does, we need to make sure that the user is a member
                const { boardRef } = req.body;
                const boardExists = await this.Board.findOne({ _id: boardRef });
                if (!boardExists) throw new NotFoundException('board does not exist');

                userCanMakeChanges = this.checkIfUserBelongsToBoard(boardExists, req);
            }
        }

        if (!userCanMakeChanges) throw new UnauthorizedException('only members of the board can create or make any changes to a list or card');
        return true
    }

    // This function allows to run the whole members array and check whether the current logged in user belongs to the board or not
    checkIfUserBelongsToBoard = (boardElement, req: Request): boolean => {
        let isABoardMember: boolean = false;
        boardElement.members.forEach(member => {
            if (member.user.valueOf() === req.user['sub'].valueOf()) {
                isABoardMember = true;
            }
        });

        return isABoardMember
    }
}