import { IsArray, IsInt, ArrayUnique } from 'class-validator';

export class AssignPermissionsDto {
    @IsArray()
    @ArrayUnique()
    @IsInt({ each: true })
    permissionIds: number[];
}