import { Controller, Get, UseGuards } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('permissions')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class PermissionsController {
    constructor(
        @InjectRepository(Permission)
        private readonly permRepo: Repository<Permission>,
    ) { }

    @Get('get-all')
    @RequirePermissions('users.manage')
    findAll() {
        
        return this.permRepo.find();
    }
}