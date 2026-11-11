import {Module} from '@nestjs/common';
import {TypeOrmModule} from '@nestjs/typeorm';
import {JwtModule} from '@nestjs/jwt';
import {PassportModule} from '@nestjs/passport';
import {ConfigModule, ConfigService} from '@nestjs/config';

import {StringValue} from 'ms';

import {User} from '../users/entities/user.entity';
import {Role} from '../roles/entities/role.entity';
import {Permission} from '../permissions/entities/permission.entity';
import {RolePermission} from '../role-permissions/entities/role-permission.entity';

import {AuthService} from './auth.service';
import {AuthController} from './auth.controller';
import {JwtStrategy} from './strategies/jwt.strategy';
import {PermissionsGuard} from '../../common/guards/permissions.guard';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, Role, Permission, RolePermission]),
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('JWT_SECRET'),
                signOptions: {
                    expiresIn: (config.get<string>('JWT_EXPIRES_IN') ?? '8h') as StringValue
                },
            }),
        }),
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, PermissionsGuard],
    exports: [AuthService, PermissionsGuard],
})
export class AuthModule {
}