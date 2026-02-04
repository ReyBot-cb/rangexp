import { Injectable, UnauthorizedException, Logger } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger = new Logger(JwtStrategy.name);

  constructor(private configService: ConfigService) {
    const jwtSecret = configService.get<string>("JWT_SECRET");
    console.log(`[JwtStrategy] Initializing with JWT_SECRET present: ${!!jwtSecret}, length: ${jwtSecret?.length}`);

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: { sub: string; email: string }) {
    this.logger.debug(`[JwtStrategy] validate called with payload: ${JSON.stringify(payload)}`);

    if (!payload.sub) {
      this.logger.error(`[JwtStrategy] Invalid token - no sub in payload`);
      throw new UnauthorizedException("Invalid token");
    }

    const user = { id: payload.sub, email: payload.email };
    this.logger.debug(`[JwtStrategy] Returning user: ${JSON.stringify(user)}`);
    return user;
  }
}
