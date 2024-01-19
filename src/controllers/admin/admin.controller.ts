import { Controller, Get, UseGuards } from '@nestjs/common';
import { AdminAccess } from 'src/decorators/admin.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';
import { AdminService } from 'src/services/admin/admin.service';

@Controller('admin')
@UseGuards(AuthGuard, RolesGuard)
export class AdminController {

    constructor(private adminService:AdminService){}

    @AdminAccess()
    @Get('users')
    getAllUsers(){
        return this.adminService.getAllUsers();
    }
}
