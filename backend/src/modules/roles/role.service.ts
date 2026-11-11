import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from './entities/role.entity';
import { RolePermission } from '../auth/entities/role-permission.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermRepo: Repository<RolePermission>,
    ) { }

    async create(dto: CreateRoleDto) {
        const exists = await this.roleRepo.findOne({ where: { name: dto.name } });
        if (exists) throw new ConflictException('El rol ya existe');

        // Solo guardamos nombre y descripción
        const role = this.roleRepo.create({
            name: dto.name,
            description: dto.description
        });
        await this.roleRepo.save(role);

        return this.findOne(role.id);
    }

    findAll() {
        return this.roleRepo.find({
            relations: {
                rolePermissions: {
                    permission: true
                }
            },
        });
    }

    async findOne(id: number) {
        const role = await this.roleRepo.findOne({
            where: { id },
            relations: {
                rolePermissions: {
                    permission: true
                }
            },
        });
        if (!role) throw new NotFoundException('Rol no encontrado');
        return role;
    }

    async update(id: number, dto: UpdateRoleDto) {
        const role = await this.findOne(id);

        // Actualizar datos básicos
        if (dto.name) role.name = dto.name;
        if (dto.description !== undefined) role.description = dto.description;
        await this.roleRepo.save(role);


        return this.findOne(id);
    }

    async remove(id: number) {
        const role = await this.findOne(id);
        await this.roleRepo.remove(role); // El onDelete: 'CASCADE' borrará los rolePermissions
        return { message: 'Rol eliminado' };
    }


    async assignPermissions(id: number, dto: AssignPermissionsDto) {
        const role = await this.findOne(id); // Valida que exista

        // Borramos los permisos anteriores del rol
        await this.rolePermRepo.delete({ roleId: id });

        // Insertamos los nuevos
        if (dto.permissionIds.length > 0) {
            const newRolePerms = dto.permissionIds.map((permId) =>
                this.rolePermRepo.create({ roleId: id, permissionId: permId }),
            );
            await this.rolePermRepo.save(newRolePerms);
        }

        return this.findOne(id); // Retorna el rol ya actualizado
    }
}