import {Injectable, UnauthorizedException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {User} from './entities/user.entity';
import {RolePermission} from './entities/role-permission.entity';
import {LoginRequestDto} from './dto/login.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(RolePermission)
        private readonly rolePermRepo: Repository<RolePermission>,
        private readonly jwtService: JwtService,
    ) {
    }

    async login(dto: LoginRequestDto) {
        const user = await this.userRepo
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', {email: dto.email})
            .getOne();

        if (!user || !user.isActive) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const ok = await bcrypt.compare(dto.password, user.password);
        if (!ok) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        const perms = await this.rolePermRepo.find({
            where: {roleId: user.roleId},
            relations: {permission: true},
        });
        const permissions = perms.map((rp) => rp.permission.name);

        const payload = {
            sub: user.id,
            email: user.email,
            roleId: user.roleId,
            permissions,
        };

        const accessToken = await this.jwtService.signAsync(payload);

        return {
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role?.name,
                permissions,
                isActive: user.isActive,
                createdAt: user.createdAt,
            },
        };
    }
}