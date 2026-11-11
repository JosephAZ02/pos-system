import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Put } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';


@ApiTags('Usuarios')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post('create')
    @RequirePermissions('users.manage')
    create(@Body() createUserDto: CreateUserDto) {
        return this.usersService.create(createUserDto);
    }

    @Get('get-all')
    @RequirePermissions('users.manage')
    findAll() {
        return this.usersService.findAll();
    }

    @Get('find/:id')
    @RequirePermissions('users.manage')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Put('update/:id')
    @RequirePermissions('users.manage')
    update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Delete('delete/:id')
    @RequirePermissions('users.manage')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}