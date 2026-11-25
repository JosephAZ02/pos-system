import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

    @ApiProperty({ example: 'Joseph Alfaro', description: 'Nombre completo del usuario' })
    @IsString({ message: 'El nombre debe ser un texto' })
    @IsNotEmpty({ message: 'El nombre no puede estar vacío' })
    name: string;

    @ApiProperty({ example: 'joseph@pos.com', description: 'Correo único para el login' })
    @IsEmail({}, { message: 'Debes ingresar un correo electrónico válido (ej. usuario@dominio.com)' })
    email: string;

    @ApiProperty({ example: 'password123', description: 'Mínimo 6 caracteres' })
    @IsString({ message: 'La contraseña debe ser un texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;

    @ApiProperty({ example: 2, description: 'ID del rol asignado (1: Admin, 2: Cajero)' })
    @IsInt({ message: 'El rol seleccionado no es válido' })
    @IsNotEmpty({ message: 'Debes seleccionar un rol' })
    roleId: number;
}