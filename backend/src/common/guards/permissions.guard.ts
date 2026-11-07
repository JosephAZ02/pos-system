import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../decorators/require-permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const required = this.reflector.getAllAndOverride<string[]>(
            PERMISSIONS_KEY,
            [context.getHandler(), context.getClass()],
        );

        if (!required || required.length === 0) return true;

        const { user } = context.switchToHttp().getRequest();
        const userPerms: string[] = user?.permissions ?? [];

        const hasAll = required.every((p) => userPerms.includes(p));
        if (!hasAll) {
            throw new ForbiddenException('Permisos insuficientes');
        }
        return true;
    }
}