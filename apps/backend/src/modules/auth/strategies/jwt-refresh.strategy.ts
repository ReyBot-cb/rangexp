import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, "jwt-refresh") {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromBodyField("refreshToken"),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>("JWT_REFRESH_SECRET"),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException("Invalid refresh token");
    }
    return { id: payload.sub, email: payload.email };
  }
}
