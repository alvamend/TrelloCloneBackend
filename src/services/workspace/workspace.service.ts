import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Request } from 'express';
import mongoose, { Model, mongo } from 'mongoose';
import { WorkspaceCreateDto } from 'src/dto/workspace/workspace.create.dto';
import { WorkspaceInterface } from 'src/interfaces/workspace.interface';

@Injectable()
export class WorkspaceService {

    constructor(@InjectModel('Workspace') private Workspace: Model<WorkspaceInterface>) { }

    create = async (createDto: WorkspaceCreateDto, req: Request): Promise<Object> => {
        try {
            const workspaceCreated = await this.Workspace.create({
                title: createDto.title,
                privacy: createDto?.privacy,
                members: {
                    user: req.user['sub']
                }
            });

            if (workspaceCreated) return { message: 'workspace created' }
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

    getWorkspaceById = async (id: string, req: Request) => {
        if (id.length !== 24) throw new HttpException('invalid id', HttpStatus.NOT_FOUND);
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
                    $project: {
                        _id: 1,
                        title: 1,
                        privacy: 1,
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

            // If workspace length is greater than zero it means there were results
            if(workspace.length > 0){
                // If workspace privacy is public then it can be returned to anyone
                if(workspace[0].privacy === 'public'){
                    return workspace[0];
                }
                // If workspace privacy is set to private, only members can see the workspace
                if(workspace[0].privacy === 'private'){
                    let userAuth = false;
                    workspace[0].members.forEach(member => {
                        if(member?.user?._id.valueOf() === req.user['sub'].valueOf()){
                            userAuth = true;
                        }
                    });

                    // If userAuth is true it means the current req user is a member of the workspace so can see the workspace
                    if(userAuth){
                        return workspace[0]
                    }else{
                        throw new HttpException('private workspace', HttpStatus.FORBIDDEN);
                    }
                }
            }else{
                throw new HttpException('Not found', HttpStatus.NOT_FOUND);
            }

        } catch (error) {
            throw error
        }
    }
}
