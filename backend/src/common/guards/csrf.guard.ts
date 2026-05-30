import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { randomBytes } from 'crypto';
import { Request, Response } from 'express';

export const SKIP_CSRF_KEY = 'skipCsrf';

/** Mark a route as CSRF-exempt (e.g. webhooks with their own signature checks). */
export const SkipCsrf = () => SetMetadata(SKIP_CSRF_KEY, true);

/**
 * Double-submit cookie CSRF guard.
 *
 * Flow:
 *  1. Any GET /auth/csrf-token → server sets a random __csrf cookie (not httpOnly)
 *     and returns { csrfToken } in the body.
 *  2. Client stores the token and sends it in the X-CSRF-Token header on every
 *     state-changing request (POST / PATCH / PUT / DELETE).
 *  3. This guard rejects any mutating request where the header doesn't match
 *     the __csrf cookie value.
 *
 * Safe methods (GET, HEAD, OPTIONS) are never checked.
 * Routes decorated with @SkipCsrf() are exempt (used for payment webhooks).
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private static readonly SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
  private static readonly COOKIE_NAME = '__csrf';
  private static readonly HEADER_NAME = 'x-csrf-token';

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_CSRF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const req = context.switchToHttp().getRequest<Request>();

    // Safe methods never carry state changes
    if (CsrfGuard.SAFE_METHODS.has(req.method)) return true;

    const cookieToken = req.cookies?.[CsrfGuard.COOKIE_NAME];
    const headerToken = req.headers[CsrfGuard.HEADER_NAME] as string | undefined;

    if (!cookieToken || !headerToken || cookieToken !== headerToken) {
      throw new ForbiddenException('Invalid or missing CSRF token');
    }

    return true;
  }

  /** Call this from the CSRF-token endpoint to mint a fresh token. */
  static issueToken(res: Response, isProduction: boolean): string {
    const token = randomBytes(32).toString('hex');
    res.cookie(CsrfGuard.COOKIE_NAME, token, {
      httpOnly: false, // must be readable by JS so the client can copy it into a header
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 60 * 60 * 1000, // 1 hour
    });
    return token;
  }
}
