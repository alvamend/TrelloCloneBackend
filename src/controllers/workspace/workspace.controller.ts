import { Body, Controller, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { Request } from 'express';
import { WorkspaceCreateDto } from 'src/dto/workspace/workspace.create.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { WorkspaceService } from 'src/services/workspace/workspace.service';

@Controller('workspace')
@UseGuards(AuthGuard)
export class WorkspaceController {
    constructor(private workspaceService: WorkspaceService) { }

    @Post()
    @UsePipes(ValidationPipe)
    createWorkspace(@Body() dto: WorkspaceCreateDto, @Req() req: Request){
        return this.workspaceService.create(dto, req);
    }

    // Method allows the user to check all the workspaces he is part of
    @Get()
    getWorkspaces(@Req() req:Request){
        return this.workspaceService.getWorkspaces(req);
    }

    @Get(':id')
    getWorkspaceById(@Param() params, @Req() req:Request){
        return this.workspaceService.getWorkspaceById(params.id, req);
    }
}
