import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsBoolean, IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// PartialType hace que todos los campos de CreateUserDto sean opcionales
export class UpdateUserDto extends PartialType(CreateUserDto) {


    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    name: string;


    @ApiProperty()
    @IsEmail()
    email: string;


    @ApiProperty()
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    roleId: number;


    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}