import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsInt, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {

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
}