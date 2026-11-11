import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt, ArrayUnique } from 'class-validator';

export class AssignPermissionsDto {

    @ApiProperty()
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    permissionIds: number[];
}