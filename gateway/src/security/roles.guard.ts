import {
    Injectable, CanActivate, ExecutionContext,
    ForbiddenException, UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {
    }

    canActivate(ctx: ExecutionContext): boolean {
        const required = this.reflector.get<string[]>('roles', ctx.getHandler());

        if (!required || required.length == 0) return true;

        const { user } = ctx.switchToHttp().getRequest();
        if (!user) throw new UnauthorizedException('인증이 필요합니다.');

        if (!required.includes(user.role)) {
            throw new ForbiddenException('권한이 없습니다.');
        }

        return true;
    }
}