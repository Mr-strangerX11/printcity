import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CsrfGuard } from './csrf.guard';

function makeContext(
  method: string,
  cookieToken: string | undefined,
  headerToken: string | undefined,
  skipMeta = false,
): ExecutionContext {
  const reflector = {
    getAllAndOverride: jest.fn().mockReturnValue(skipMeta),
  } as unknown as Reflector;

  const request = {
    method,
    cookies: cookieToken ? { __csrf: cookieToken } : {},
    headers: headerToken ? { 'x-csrf-token': headerToken } : {},
  };

  const ctx = {
    switchToHttp: () => ({ getRequest: () => request }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;

  // Inject reflector separately — we test guard in isolation
  (ctx as any).__reflector = reflector;

  return ctx;
}

describe('CsrfGuard', () => {
  let guard: CsrfGuard;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(() => {
    reflector = { getAllAndOverride: jest.fn().mockReturnValue(false) } as any;
    guard = new CsrfGuard(reflector);
  });

  it('allows safe methods without CSRF token (GET)', () => {
    const ctx = makeContext('GET', undefined, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows safe methods without CSRF token (HEAD)', () => {
    const ctx = makeContext('HEAD', undefined, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows safe methods without CSRF token (OPTIONS)', () => {
    const ctx = makeContext('OPTIONS', undefined, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('allows mutating request when cookie and header match', () => {
    const ctx = makeContext('POST', 'abc123', 'abc123');
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when header is missing on POST', () => {
    const ctx = makeContext('POST', 'abc123', undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when cookie is missing on POST', () => {
    const ctx = makeContext('POST', undefined, 'abc123');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when token mismatch on POST', () => {
    const ctx = makeContext('POST', 'token-a', 'token-b');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when tokens mismatch on PATCH', () => {
    const ctx = makeContext('PATCH', 'token-a', 'token-b');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('throws ForbiddenException when tokens mismatch on DELETE', () => {
    const ctx = makeContext('DELETE', 'token-a', 'token-b');
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });

  it('skips check when @SkipCsrf() is present', () => {
    reflector.getAllAndOverride.mockReturnValue(true);
    const ctx = makeContext('POST', undefined, undefined);
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('issueToken returns a hex string of 64 chars', () => {
    const res = { cookie: jest.fn() } as any;
    const token = CsrfGuard.issueToken(res, false);
    expect(typeof token).toBe('string');
    expect(token).toHaveLength(64);
    expect(res.cookie).toHaveBeenCalledWith('__csrf', token, expect.objectContaining({ httpOnly: false }));
  });
});
