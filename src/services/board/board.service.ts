import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model } from 'mongoose';
import { BoardAddDto } from 'src/dto/board/board.add.dto';
import { BoardCreateDto } from 'src/dto/board/board.create.dto';
import { BoardDeleteDto } from 'src/dto/board/board.remove.dto';
import { BoardUpdateDto } from 'src/dto/board/board.update.dto';
import { BoardInterface } from 'src/interfaces/board.interface';
import { UserInterface } from 'src/interfaces/user.interface';
import { WorkspaceInterface } from 'src/interfaces/workspace.interface';

@Injectable()
export class BoardService {

    constructor(
        @InjectModel('Board') private Board: Model<BoardInterface>,
        @InjectModel('Workspace') private Workspace: Model<WorkspaceInterface>,
        @InjectModel('User') private User: Model<UserInterface>
    ) { }

    create = async (req: Request, dto: BoardCreateDto): Promise<Object> => {
        try {
            // Verify if there's a workspace assigned, if not, the board will be created under the default one
            let workspaceQuery: string = '';
            let workspace: WorkspaceInterface;
            if (!dto.workspaceRef) {
                workspaceQuery = `${req.user['name']} ${req.user['surname']} Workspace`;
                workspace = await this.Workspace.findOne({ title: workspaceQuery });
            } else {
                workspaceQuery = dto.workspaceRef;
                workspace = await this.Workspace.findOne({ _id: workspaceQuery });
            }

            if (!workspace) throw new NotFoundException('workspace does not exist');
            const createdBoard = await this.Board.create({
                title: dto.title,
                privacy: dto.privacy,
                workspaceRef: workspace._id,
                members: {
                    user: req.user['sub'],
                    boardRole: 'administrator'
                }
            });

            if (createdBoard) return { message: 'board created successfully' }
        } catch (error) {
            throw error
        }
    }

    update = async (req: Request, body: BoardUpdateDto, id: string): Promise<Object> => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            //Validate if board exists
            const board: BoardInterface = await this.Board.findOne({ _id: id });
            if (!board) throw new NotFoundException('board not found');

            // Verify if user is part of the members and if it has edit permissions
            let userCanEdit: boolean = false;
            board.members.forEach(member => {
                if ((member.user.valueOf() === req.user['sub'].valueOf()) && (member.boardRole === 'administrator')) {
                    userCanEdit = true;
                }
            });

            // If user was not part of the members and did not have administrator Permissions, forbidden exception will be sent, otherwise, will be updated
            if (!userCanEdit) throw new ForbiddenException('Not enough permissions');
            await board.updateOne({
                title: body?.title,
                description: body?.description,
                background: body?.background,
                privacy: body?.privacy
            });

            return { message: 'board updated successfully' }
        } catch (error) {
            throw error
        }
    }

    retrieveBoard = async (id: string, req: Request): Promise<BoardInterface> => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            //Verify if board exists
            const boardId = new mongoose.Types.ObjectId(id);
            const board: Array<BoardInterface> = await this.Board.aggregate([
                {
                    $match: { '_id': boardId }
                }, {
                    $lookup: {
                        from: 'users',
                        foreignField: '_id',
                        localField: 'members.user',
                        as: 'membersInfo'
                    }
                }, {
                    $project: {
                        _id: 1,
                        title: 1,
                        description: 1,
                        workspaceRef: 1,
                        privacy: 1,
                        background: 1,
                        members: {
                            $map: {
                                input: '$members',
                                as: 'member',
                                in: {
                                    user: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$membersInfo',
                                                    as: 'info',
                                                    cond: ['$$info._id', '$$member.user']
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    boardRole: '$$member.boardRole',
                                    _id: '$$member._id'
                                }
                            }
                        }
                    }
                }, {
                    $project: {
                        'members.user.password': 0,
                        'members.user.role': 0,
                        'members.user.bio': 0
                    }
                }
            ])

            //Verify board privacy, if set to private, only board members can see it; workspace, only workspace members can see it; public, anyone can see it
            let userBelongsToWorkspace = false;
            let userBelongsToBoard = false;

            //If privacy is set to workspace, we need to check if the current user is part of the workspace, if not, exception will be sent
            if (board[0].privacy === 'workspace') {
                const workspace = await this.Workspace.findOne({ _id: board[0].workspaceRef });
                workspace.members.forEach(member => {
                    if (member.user.valueOf() === req.user['sub'].valueOf()) {
                        userBelongsToWorkspace = true;
                    }
                });

                if (!userBelongsToWorkspace) throw new UnauthorizedException('user is not part of this workspace');
            }

            //If privacy is set to private, we need to check if the current user is part of the board, if not, exception will be sent
            if (board[0].privacy === 'private') {
                board[0].members.forEach(member => {
                    if (member.user['_id'].valueOf() === req.user['sub'].valueOf()) {
                        userBelongsToBoard = true;
                    }
                });

                if (!userBelongsToBoard) throw new UnauthorizedException('this is a private board')
            }

            //If privacy is set to public, or any of the other conditions are true, the result will be sent
            if (board[0].privacy === 'public' || userBelongsToWorkspace || userBelongsToBoard) {
                return board[0];
            }

        } catch (error) {
            throw error
        }
    }

    addMember = async (id: string, body: BoardAddDto, req: Request): Promise<Object> => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            // Verify if the user that will be added exists
            const userExists = await this.User.findOne({ email: body.email });
            if (!userExists) throw new NotFoundException('user to be added does not exist');

            // Verify if the board exists
            const board: BoardInterface = await this.Board.findOne({ _id: id });
            if (!board) throw new NotFoundException('board not found');

            // Verify if the user is part of the board and has administrator roles
            let userCanEdit: boolean = false;
            board.members.forEach(member => {
                if ((member.user.valueOf() === req.user['sub'].valueOf()) && (member.boardRole === 'administrator')) {
                    userCanEdit = true;
                }
            })
            if (!userCanEdit) throw new UnauthorizedException('not enough permissions to add members');

            // Check if user is already part of the members
            let userAlreadyMember = false;
            board.members.forEach(member => {
                if (member.user.valueOf() === userExists._id.valueOf()) {
                    userAlreadyMember = true;
                }
            })
            if (userAlreadyMember) throw new BadRequestException('user is already a board member');

            // Add the new user into the members array
            board.members.push({
                user: userExists._id,
                boardRole: 'collaborator'
            });

            await board.save();
            return { message: 'member added successfully' }
        } catch (error) {
            throw error
        }
    }

    removeMember = async (id: string, body: BoardDeleteDto, req: Request): Promise<Object> => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            // Verify if the user that will be added exists
            const userExists = await this.User.findOne({ email: body.email });
            if (!userExists) return { message: 'user does not exist' }

            // Verify if the board exists
            const board: BoardInterface = await this.Board.findOne({ _id: id });
            if (!board) throw new NotFoundException('board not found');

            // Verify if the user is part of the board and has administrator roles
            let userCanEdit: boolean = false;
            board.members.forEach(member => {
                if ((member.user.valueOf() === req.user['sub'].valueOf()) && (member.boardRole === 'administrator')) {
                    userCanEdit = true;
                }
            })
            if (!userCanEdit) throw new UnauthorizedException('not enough permissions to remove members');

            // Check if user is already part of the members
            let userAlreadyMember = false;
            board.members.forEach(member => {
                if (member.user.valueOf() === userExists._id.valueOf()) {
                    userAlreadyMember = true;
                }
            });

            //Create a new array with the users except the one we want to delete
            if (userAlreadyMember) {
                const newMembers = board.members.filter(member => member.user.valueOf() !== userExists._id.valueOf());
                await board.updateOne({
                    members: newMembers
                });
                return { message: 'user removed from the board' }
            } else {
                return { message: 'user is not part of the board' }
            }

        } catch (error) {
            throw error
        }
    }

    delete = async (id: string, req: Request) => {
        if (id.length !== 24) throw new NotFoundException('invalid id');
        try {
            const board = await this.Board.findOne({ _id: id });
            if (!board) throw new NotFoundException('board not found');

            // Verify if the user is part of the members and has administrator roles
            let userCanDelete = false;
            board.members.forEach(member => {
                if (member.user.valueOf() === req.user['sub'].valueOf() && member.boardRole === 'administrator') {
                    userCanDelete = true;
                }
            });

            if (!userCanDelete) throw new UnauthorizedException('only administrators can delete a board');
            await board.deleteOne();
            return { message: 'board deleted' }
        } catch (error) {
            throw error
        }
    }
}

