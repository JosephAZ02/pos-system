import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginRequestDto {

    @ApiProperty({ example: 'admin@pos.com' })
    @IsEmail({}, { message: 'El correo electrónico no tiene un formato válido' })
    email: string;

    @ApiProperty({ example: 'admin123' })
    @IsString({ message: 'La contraseña debe ser un texto' })
    @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
    password: string;
}