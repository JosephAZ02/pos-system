import {Body, Controller, Get, Post, Req, UseGuards} from '@nestjs/common';
import {AuthService} from './auth.service';
import {LoginRequestDto} from './dto/login.dto';
import {JwtAuthGuard} from '../../common/guards/jwt-auth.guard';
import {PermissionsGuard} from '../../common/guards/permissions.guard';
import {RequirePermissions} from '../../common/decorators/require-permissions.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Autentificación')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }


    
    @Post('login')
    login(@Body() dto: LoginRequestDto) {
        return this.authService.login(dto);
    }

    

    
}