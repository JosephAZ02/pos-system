import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginRequestDto } from './dto/login.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    login(@Body() dto: LoginRequestDto) {
        return this.authService.login(dto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    profile(@Req() req: any) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard, PermissionsGuard)
    @RequirePermissions('users.manage')
    @Get('only-admin')
    onlyAdmin() {
        return { ok: true, message: 'Tienes permiso users.manage' };
    }
}