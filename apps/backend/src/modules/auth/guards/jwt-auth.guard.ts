import { Injectable, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {

  canActivate(context: ExecutionContext) {
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // Ensure we return a proper 401 with the error message
      const message = info?.message || err?.message || 'Unauthorized';
      throw new UnauthorizedException(message);
    }
    return user;
  }
}
