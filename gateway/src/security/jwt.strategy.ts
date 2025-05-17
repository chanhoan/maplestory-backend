import {Injectable} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {PassportStrategy} from "@nestjs/passport";
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {

    constructor(cs: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: cs.get('jwt.secret'),
        });
    }

    async validate(payload: any) {

        return {
            userId: payload.sub,
            username: payload.username,
            role: payload.role,
        };
    }
}