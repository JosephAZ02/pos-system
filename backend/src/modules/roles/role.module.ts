import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RolesController } from './role.controller';
import { RolesService } from './role.service';
import { Role } from './entities/role.entity';
import { RolePermission } from '../auth/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, RolePermission])],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}