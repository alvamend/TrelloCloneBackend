import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import { Model } from 'mongoose';
import { ListCreateDto } from 'src/dto/list/list.create.dto';
import { ListUpdateDto } from 'src/dto/list/list.update.dto';
import { BoardInterface } from 'src/interfaces/board.interface';
import { ListInterface } from 'src/interfaces/list.interface';

@Injectable()
export class ListService {
    constructor(
        @InjectModel('List') private List: Model<ListInterface>,
        @InjectModel('Board') private Board: Model<BoardInterface>
    ) { }

    getAllListsFromBoard = async (boardId: string, listStatus: string = ''): Promise<ListInterface[]> => {
        try {
            // Verify id length
            if (boardId.length !== 24) throw new NotFoundException('invalid id');
            // Filter by BoardId and List Status
            const listsFromBoard: Array<ListInterface> = await this.List.find({ boardRef: boardId, status: listStatus });
            if (listsFromBoard) {
                return listsFromBoard
            }
        } catch (error) {
            throw error
        }
    }

    create = async (body: ListCreateDto, req: Request): Promise<Object> => {
        try {
            const { title, boardRef } = body;

            // Check if the board exists, if not, retrieve not found exception
            const boardExists = await this.Board.findOne({ _id: boardRef });
            if (!boardExists) throw new NotFoundException('board does not exist');

            // If the board exists, we need to verify if the current user is a member of the board, otherwise, should not be able to create one
            let userBelongsToBoard: boolean = false;
            boardExists.members.forEach(member => {
                if (member.user.valueOf() === req.user['sub'].valueOf()) {
                    userBelongsToBoard = true;
                }
            })

            if (!userBelongsToBoard) throw new UnauthorizedException('only members of the board can add lists')

            // Create the list
            const createdList = await this.List.create({
                title: title,
                boardRef: boardRef
            });

            if (createdList) {
                return {
                    message: 'list created',
                    list: createdList
                }
            }

        } catch (error) {
            throw error
        }
    }

    edit = async (id: string, body: ListUpdateDto, req: Request): Promise<Object> => {
        if (id.length !== 24) throw new NotFoundException('invalid id')
        try {
            // Check if the list exists, if not, return a not found exception
            const listExists: ListInterface = await this.List.findOne({ _id: id });
            if (!listExists) throw new NotFoundException('list does not exist');

            // Verify if the user belongs to the board of the list boardReference field, only members of the board can modify the lists
            let userBelongsToBoard: boolean = false;
            // Get the board
            const boardRef: BoardInterface = await this.Board.findOne({ _id: listExists.boardRef });

            boardRef.members.forEach(member => {
                if (member.user.valueOf() === req.user['sub'].valueOf()) {
                    userBelongsToBoard = true;
                }
            });

            if (!userBelongsToBoard) throw new UnauthorizedException('only members of the board can make changes to the lists');

            //If user does belong to the board, then, changes can be applied
            await listExists.updateOne({
                title: body?.title,
                boardRef: body?.boardRef,
                status: body?.status
            })

            return {
                message: 'list was updated',
            }

        } catch (error) {
            throw error
        }
    }

    delete = async (id: string, req: Request) => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            // Check if the list exists, if not, return a not found exception
            const listExists: ListInterface = await this.List.findOne({ _id: id });
            if (!listExists) throw new NotFoundException('list does not exist');

            // Verify if the user belongs to the board of the list boardReference field, only members of the board can modify the lists
            let userBelongsToBoard: boolean = false;
            // Get the board
            const boardRef: BoardInterface = await this.Board.findOne({ _id: listExists.boardRef });

            boardRef.members.forEach(member => {
                if (member.user.valueOf() === req.user['sub'].valueOf()) {
                    userBelongsToBoard = true;
                }
            });

            if (!userBelongsToBoard) throw new UnauthorizedException('only members of the board can make changes to the lists');

            await listExists.deleteOne();
            return{
                message: 'list deleted'
            }
        } catch (error) {
            throw error
        }
    }
}
