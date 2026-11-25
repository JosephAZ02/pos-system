import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// PartialType hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {


    @ApiProperty()
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    name: string;


    @ApiProperty()
    @IsEmail({}, { message: 'Debes ingresar un correo electrónico válido (ej. usuario@dominio.com)' })
    email: string;


    @ApiProperty()
    @IsString({ message: 'La contraseña debe ser un texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @ApiProperty()
    @IsInt({ message: 'El rol seleccionado no es válido' })
    @IsNotEmpty({ message: 'Debes seleccionar un rol' })
    roleId: number;


    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}