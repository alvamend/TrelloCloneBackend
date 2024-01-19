import { Controller, Get } from '@nestjs/common';
import { AdminService } from 'src/services/admin/admin.service';

@Controller('admin')
export class AdminController {

    constructor(private adminService:AdminService){}

    @Get()
    getAllUsers(){
        return this.adminService.getAllUsers();
    }
}
