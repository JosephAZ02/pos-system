import { PartialType } from '@nestjs/mapped-types';
import { CreateRoleDto } from './create-role.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto extends PartialType(CreateRoleDto) { 

      @ApiProperty()
      @IsString()
      @IsNotEmpty()
      name: string;
    
    
      @ApiProperty()
      @IsString()
      @IsOptional()
      description?: string;
}