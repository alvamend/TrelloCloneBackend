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

    create = async (body: ListCreateDto): Promise<Object> => {
        try {
            const { title, boardRef } = body;

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

    edit = async (id: string, body: ListUpdateDto): Promise<Object> => {
        try {
            const editedList = await this.List.findOneAndUpdate({ _id: id }, {
                title: body?.title,
                boardRef: body?.boardRef,
                status: body?.status
            })

            if (editedList) return { message: 'list was updated' }
        } catch (error) {
            throw error
        }
    }

    delete = async (id: string) => {
        try {
            const deletedList = await this.List.findOneAndDelete({ _id: id });
            if (deletedList) return { message: 'list deleted' }

        } catch (error) {
            throw error
        }
    }
}
