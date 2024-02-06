import { ForbiddenException, HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model, mongo } from 'mongoose';
import { WorkspaceAddMemberDto } from 'src/dto/workspace/workspace.add.dto';
import { WorkspaceCreateDto } from 'src/dto/workspace/workspace.create.dto';
import { WorkspaceEditDto } from 'src/dto/workspace/workspace.edit.dto';
import { WorkspaceRemoveMemberDto } from 'src/dto/workspace/workspace.remove.dto';
import { UserInterface } from 'src/interfaces/user.interface';
import { WorkspaceInterface } from 'src/interfaces/workspace.interface';

@Injectable()
export class WorkspaceService {

    constructor(
        @InjectModel('Workspace') private Workspace: Model<WorkspaceInterface>,
        @InjectModel('User') private User: Model<UserInterface>
    ) { }

    create = async (createDto: WorkspaceCreateDto, req: Request): Promise<Object> => {
        try {
            const workspaceCreated = await this.Workspace.create({
                title: createDto.title,
                privacy: createDto?.privacy,
                members: {
                    user: req.user['sub']
                }
            });

            if (workspaceCreated) return { message: 'workspace created', workspace: workspaceCreated }
        } catch (error) {
            throw error
        }
    }

    getWorkspaces = async (req: Request): Promise<WorkspaceInterface[]> => {
        try {
            const workspaces = await this.Workspace.aggregate([
                {
                    $match: { "members.user": req.user['sub'] }
                }
            ]);
            return workspaces;
        } catch (error) {
            throw error
        }
    }

    getWorkspaceById = async (id: string, req: Request): Promise<WorkspaceInterface> => {
        try {
            const workspace: any = await this.retrieveWorkspaceInfo(id);

            // If workspace length is greater than zero it means there were results
            if (workspace.length > 0) {
                // If workspace privacy is public then it can be returned to anyone
                if (workspace[0].privacy === 'public') {
                    return workspace[0];
                }
                // If workspace privacy is set to private, only members can see the workspace
                if (workspace[0].privacy === 'private') {
                    let userAuth = false;
                    workspace[0].members.forEach(member => {
                        if (member?.user?._id.valueOf() === req.user['sub'].valueOf()) {
                            userAuth = true;
                        }
                    });

                    // If userAuth is true it means the current req user is a member of the workspace so can see the workspace
                    if (userAuth) {
                        return workspace[0]
                    } else {
                        throw new HttpException('private workspace', HttpStatus.FORBIDDEN);
                    }
                }
            } else {
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }

        } catch (error) {
            throw error
        }
    }

    edit = async (id: string, req: Request, body: WorkspaceEditDto) => {
        try {
            const workspace: WorkspaceInterface = await this.Workspace.findOne({ _id: id });
            if (!workspace) throw new NotFoundException;

            // Verify if user is part of the members and has administrator workspace role
            let userCanEdit = false;
            workspace.members.forEach(member => {
                if ((member.user.valueOf() === req.user['sub'].valueOf()) && (member.workspaceRole === 'administrator')) {
                    userCanEdit = true;
                }
            })

            if (userCanEdit) {
                await workspace.updateOne({
                    title: body?.title,
                    privacy: body?.privacy
                })
                return { message: 'workspace updated' }
            }
        } catch (error) {
            throw error
        }
    }

    addmember = async (id: string, req: Request, body: WorkspaceAddMemberDto) => {
        try {
            // Verify if workspace exists and if the user that we want to add exists as well
            const workspace = await this.Workspace.findOne({ _id: id });
            if (!workspace) throw new NotFoundException('workspace does not exist');

            const userToAddExists = await this.User.findOne({ email: body.email });
            if (!userToAddExists) throw new NotFoundException('user does not exist');

            //THIS VALIDATION IS USED 2 TIMES, CAN CREATE A HELPER FUNCTION LATER
            let userCanEdit = false;
            workspace.members.forEach(member => {
                if ((member?.user.valueOf() === req.user['sub'].valueOf()) && (member.workspaceRole === 'administrator')) {
                    userCanEdit = true;
                }
            });

            //If user cannot edit, forbiddenexception is sent, otherwise, the new user is added
            if (!userCanEdit) throw new UnauthorizedException;

            // Check if the user is already a member
            let userAlreadyMember = false;
            workspace.members.forEach(member => {
                if (member?.user.valueOf() === userToAddExists._id.valueOf()) {
                    userAlreadyMember = true;
                }
            })

            if (userAlreadyMember) {
                throw new UnauthorizedException('user is already a member of this workspace')
            } else {
                workspace.members.push({
                    user: userToAddExists._id,
                    workspaceRole: body?.workspaceRole
                });

                await workspace.save();
                console.log(workspace);
                return {
                    message: 'user added to the workspace',
                    members: workspace.members
                }
            }
        } catch (error) {
            throw error
        }
    }

    removeMember = async (id: string, req: Request, body: WorkspaceRemoveMemberDto) => {
        try {
            // Verify if workspace exists and if the user that we want to remove exists as well
            const workspace = await this.Workspace.findOne({ _id: id });
            if (!workspace) throw new NotFoundException('workspace does not exist');

            const userToRemoveExists = await this.User.findOne({ email: body.email });
            if (!userToRemoveExists) throw new NotFoundException('user does not exist');

            //THIS VALIDATION IS USED 2 TIMES, CAN CREATE A HELPER FUNCTION LATER
            let userCanEdit = false;
            workspace.members.forEach(member => {
                if ((member?.user.valueOf() === req.user['sub'].valueOf()) && (member.workspaceRole === 'administrator')) {
                    userCanEdit = true;
                }
            });

            //If user cannot edit, forbiddenexception is sent, otherwise, the new user is added
            if (!userCanEdit) throw new ForbiddenException;

            // Check if the user is already a member
            let userAlreadyMember = false;
            workspace.members.forEach(member => {
                if (member?.user.valueOf() === userToRemoveExists._id.valueOf()) {
                    userAlreadyMember = true;
                }
            })

            // If user is not part of the workspace, there's no need to remove it, if it's part from the workspace, we filter the array
            if (!userAlreadyMember) {
                return {
                    message: 'user is not part of this workspace'
                }
            } else {
                const membersUpdated = workspace.members.filter(member => member.user.valueOf() !== userToRemoveExists._id.valueOf());
                await workspace.updateOne({
                    members: membersUpdated
                })
                return {
                    message: 'user removed from the workspace'
                }
            }
        } catch (error) {
            throw error
        }
    }

    delete = async (id: string, req: Request) => {
        try {
            //Check if workspace exists and if it's the default, cannot be deleted
            const workspace = await this.Workspace.findOne({ _id: id });
            if (!workspace) throw new NotFoundException('workspace not found');
            if (workspace.title === `${req.user['name']} ${req.user['surname']} Workspace`) throw new UnauthorizedException('default workspace cannot be deleted');

            // We need to make sure that only the creator is able to delete the workspace
            if (workspace.members[0].user.valueOf() !== req.user['sub'].valueOf()) throw new UnauthorizedException('only the creator can delete the workspace');

            await workspace.deleteOne();
            return { message: 'workspace deleted' }
        } catch (error) {
            throw error;
        }
    }

    // util function
    retrieveWorkspaceInfo = async (id: string): Promise<WorkspaceInterface[]> => {
        try {
            const workspaceId = new mongoose.Types.ObjectId(id);
            const workspace = await this.Workspace.aggregate([
                {
                    $match: { '_id': workspaceId }
                }, {
                    $lookup: {
                        from: 'users',
                        localField: 'members.user',
                        foreignField: '_id',
                        as: 'membersInfo'
                    }
                }, {
                    $lookup: { from: 'boards', foreignField: 'workspaceRef', localField: '_id', as: 'boards' }
                }, {
                    $project: {
                        _id: 1,
                        title: 1,
                        privacy: 1,
                        boards: 1,
                        members: {
                            //Map the array, $members is the variable and each member will have an alias "member"
                            $map: {
                                input: '$members',
                                as: 'member',
                                in: {
                                    // We iterate on each field, in this case, under user which needs to be mapped agains Users collection
                                    // we filter using $membersInfo obtained in the previous $lookup and its new alias is info, then
                                    // it will match $$info_id and member.user
                                    user: {
                                        $arrayElemAt: [
                                            {
                                                $filter: {
                                                    input: '$membersInfo',
                                                    as: 'info',
                                                    cond: { $eq: ['$$info._id', '$$member.user'] }
                                                }
                                            },
                                            0
                                        ]
                                    },
                                    workspaceRole: '$$member.workspaceRole',
                                    _id: '$$member._id'
                                }
                            }
                        },

                    }
                }, {
                    $project: {
                        'members.user.password': 0,
                        'members.user.role': 0,
                        'members.user.bio': 0
                    }
                }
            ]);

            return workspace;
        } catch (error) {
            throw error
        }
    }
}
