import { Body, Controller, Get, Param, Post, Put, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceAddMemberDto } from 'src/dto/workspace/workspace.add.dto';
import { WorkspaceCreateDto } from 'src/dto/workspace/workspace.create.dto';
import { WorkspaceEditDto } from 'src/dto/workspace/workspace.edit.dto';
import { WorkspaceRemoveMemberDto } from 'src/dto/workspace/workspace.remove.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { WorkspaceService } from 'src/services/workspace/workspace.service';

@Controller('workspace')
@UseGuards(AuthGuard)
export class WorkspaceController {
    constructor(private workspaceService: WorkspaceService) { }

    @Post()
    @UsePipes(ValidationPipe)
    createWorkspace(@Body() dto: WorkspaceCreateDto, @Req() req: Request) {
        return this.workspaceService.create(dto, req);
    }

    // Method allows the user to check all the workspaces he is part of
    @Get()
    getWorkspaces(@Req() req: Request) {
        return this.workspaceService.getWorkspaces(req);
    }

    @Get(':id')
    getWorkspaceById(@Param() params, @Req() req: Request) {
        return this.workspaceService.getWorkspaceById(params.id, req);
    }

    @Put(':id')
    @UsePipes(ValidationPipe)
    editWorkspace(@Param() params, @Req() req: Request, @Body() dto: WorkspaceEditDto) {
        return this.workspaceService.edit(params.id, req, dto);
    }

    @Put('add-member/:id')
    @UsePipes(ValidationPipe)
    addMember(@Param() params, @Req() req:Request, @Body() dto:WorkspaceAddMemberDto){
        return this.workspaceService.addmember(params.id, req, dto);
    }

    @Put('remove-member/:id')
    @UsePipes(ValidationPipe)
    removeMember(@Param() params, @Req() req:Request, @Body() dto:WorkspaceRemoveMemberDto){
        return this.workspaceService.removeMember(params.id, req, dto);
    }
}
