import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsController } from './permission.controller';
import { Permission } from './entities/permission.entity';

@Module({
    imports: [TypeOrmModule.forFeature([Permission])],
    controllers: [PermissionsController],
})
export class PermissionsModule { }