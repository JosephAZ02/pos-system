import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsOptional } from 'class-validator';

// PartialType hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}