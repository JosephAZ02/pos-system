import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { RolesService } from './role.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Roles')
@ApiBearerAuth()
@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RolesController {
    constructor(private readonly rolesService: RolesService) { }

    @Post('create')
    @RequirePermissions('users.manage') // Usamos el permiso de admin
    create(@Body() createRoleDto: CreateRoleDto) {
        return this.rolesService.create(createRoleDto);
    }

    @Get('get-all')
    @RequirePermissions('users.manage')
    findAll() {
        return this.rolesService.findAll();
    }

    @Get('find/:id')
    @RequirePermissions('users.manage')
    findOne(@Param('id') id: string) {
        return this.rolesService.findOne(+id);
    }

    @Put('update/:id')
    @RequirePermissions('users.manage')
    update(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto) {
        return this.rolesService.update(+id, updateRoleDto);
    }

    @Delete('delete/:id')
    @RequirePermissions('users.manage')
    remove(@Param('id') id: string) {
        return this.rolesService.remove(+id);
    }

    @Patch('give-permissions/:id')
    @RequirePermissions('users.manage')
    assignPermissions(
        @Param('id') id: string,
        @Body() assignPermissionsDto: AssignPermissionsDto
    ) {
        return this.rolesService.assignPermissions(+id, assignPermissionsDto);
    }
}