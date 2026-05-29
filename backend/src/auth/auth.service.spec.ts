import { Test, TestingModule } from '@nestjs/testing';
import {
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { MailService } from '../mail/mail.service';
import { VendorsService } from '../vendors/vendors.service';
import { Role } from '../user/schemas/user.schema';

const MOCK_USER_ID = '507f1f77bcf86cd799439011';

function makeUser(overrides: Partial<any> = {}) {
  return {
    id: MOCK_USER_ID,
    email: 'user@example.com',
    passwordHash: bcrypt.hashSync('correct-password', 1),
    name: 'Test User',
    role: Role.CUSTOMER,
    isActive: true,
    isVerified: true,
    ...overrides,
  };
}

function makeServices() {
  const userService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
  const jwtService = {
    sign: jest.fn().mockReturnValue('mock.jwt.token'),
    verify: jest.fn(),
  };
  const configService = {
    get: jest.fn().mockReturnValue('test-secret'),
  };
  const mailService = {
    sendVerificationOtp: jest.fn().mockResolvedValue(undefined),
  };
  const vendorsService = {
    createVendor: jest.fn(),
  };
  return { userService, jwtService, configService, mailService, vendorsService };
}

describe('AuthService — login', () => {
  let service: AuthService;
  let userService: ReturnType<typeof makeServices>['userService'];

  beforeEach(async () => {
    const deps = makeServices();
    userService = deps.userService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: deps.userService },
        { provide: JwtService, useValue: deps.jwtService },
        { provide: ConfigService, useValue: deps.configService },
        { provide: MailService, useValue: deps.mailService },
        { provide: VendorsService, useValue: deps.vendorsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns tokens on valid credentials', async () => {
    userService.findByEmail.mockResolvedValue(makeUser());
    const result = await service.login({ email: 'user@example.com', password: 'correct-password' });
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
    expect(result).toHaveProperty('role');
  });

  it('throws UnauthorizedException for non-existent user', async () => {
    userService.findByEmail.mockResolvedValue(null);
    await expect(service.login({ email: 'no@one.com', password: 'x' })).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for wrong password', async () => {
    userService.findByEmail.mockResolvedValue(makeUser());
    await expect(service.login({ email: 'user@example.com', password: 'wrong' })).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for inactive account', async () => {
    userService.findByEmail.mockResolvedValue(makeUser({ isActive: false }));
    await expect(service.login({ email: 'user@example.com', password: 'correct-password' })).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for unverified account', async () => {
    userService.findByEmail.mockResolvedValue(makeUser({ isVerified: false }));
    await expect(service.login({ email: 'user@example.com', password: 'correct-password' })).rejects.toThrow(UnauthorizedException);
  });
});

describe('AuthService — register', () => {
  let service: AuthService;
  let userService: ReturnType<typeof makeServices>['userService'];
  let mailService: ReturnType<typeof makeServices>['mailService'];

  beforeEach(async () => {
    const deps = makeServices();
    userService = deps.userService;
    mailService = deps.mailService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: deps.userService },
        { provide: JwtService, useValue: deps.jwtService },
        { provide: ConfigService, useValue: deps.configService },
        { provide: MailService, useValue: deps.mailService },
        { provide: VendorsService, useValue: deps.vendorsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('returns requiresVerification:true on success', async () => {
    userService.findByEmail.mockResolvedValue(null);
    userService.create.mockResolvedValue(makeUser());
    mailService.sendVerificationOtp.mockResolvedValue(undefined);

    const result = await service.register({
      name: 'New User',
      email: 'new@example.com',
      password: 'password123',
    } as any);

    expect(result.requiresVerification).toBe(true);
    expect(result.email).toBe('user@example.com');
  });

  it('throws ConflictException if email already registered', async () => {
    userService.findByEmail.mockResolvedValue(makeUser());
    await expect(service.register({ name: 'X', email: 'user@example.com', password: 'p' } as any))
      .rejects.toThrow(ConflictException);
  });

  it('deletes user and throws if OTP email fails', async () => {
    userService.findByEmail.mockResolvedValue(null);
    userService.create.mockResolvedValue(makeUser());
    userService.delete = jest.fn().mockResolvedValue({});
    mailService.sendVerificationOtp.mockRejectedValue(new Error('SMTP failure'));

    await expect(service.register({ name: 'X', email: 'x@x.com', password: 'p' } as any)).rejects.toThrow();
    expect(userService.delete).toHaveBeenCalledWith(MOCK_USER_ID);
  });

  it('throws BadRequestException if vendor registration has no storeName', async () => {
    userService.findByEmail.mockResolvedValue(null);
    await expect(
      service.register({ name: 'V', email: 'v@v.com', password: 'p', role: Role.VENDOR } as any),
    ).rejects.toThrow(BadRequestException);
  });
});

describe('AuthService — refresh', () => {
  let service: AuthService;
  let userService: ReturnType<typeof makeServices>['userService'];
  let jwtService: ReturnType<typeof makeServices>['jwtService'];

  beforeEach(async () => {
    const deps = makeServices();
    userService = deps.userService;
    jwtService = deps.jwtService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: deps.userService },
        { provide: JwtService, useValue: deps.jwtService },
        { provide: ConfigService, useValue: deps.configService },
        { provide: MailService, useValue: deps.mailService },
        { provide: VendorsService, useValue: deps.vendorsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('throws UnauthorizedException when no token provided', async () => {
    await expect(service.refresh('')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException for expired/invalid token', async () => {
    jwtService.verify.mockImplementation(() => { throw new Error('jwt expired'); });
    await expect(service.refresh('expired.token')).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user no longer exists', async () => {
    jwtService.verify.mockReturnValue({ sub: MOCK_USER_ID });
    userService.findById.mockResolvedValue(null);
    await expect(service.refresh('valid.token')).rejects.toThrow(UnauthorizedException);
  });

  it('returns new tokens for valid refresh token', async () => {
    jwtService.verify.mockReturnValue({ sub: MOCK_USER_ID });
    userService.findById.mockResolvedValue(makeUser());
    const result = await service.refresh('valid.token');
    expect(result).toHaveProperty('accessToken');
    expect(result).toHaveProperty('refreshToken');
  });
});

describe('AuthService — updateProfile', () => {
  let service: AuthService;
  let userService: ReturnType<typeof makeServices>['userService'];

  beforeEach(async () => {
    const deps = makeServices();
    userService = deps.userService;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: deps.userService },
        { provide: JwtService, useValue: deps.jwtService },
        { provide: ConfigService, useValue: deps.configService },
        { provide: MailService, useValue: deps.mailService },
        { provide: VendorsService, useValue: deps.vendorsService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('throws NotFoundException when user does not exist', async () => {
    userService.findById.mockResolvedValue(null);
    await expect(service.updateProfile(MOCK_USER_ID, { name: 'New Name' })).rejects.toThrow(NotFoundException);
  });

  it('throws BadRequestException when changing password without currentPassword', async () => {
    userService.findById.mockResolvedValue(makeUser());
    await expect(service.updateProfile(MOCK_USER_ID, { newPassword: 'new123' } as any)).rejects.toThrow(BadRequestException);
  });

  it('throws BadRequestException when currentPassword is wrong', async () => {
    userService.findById.mockResolvedValue(makeUser());
    await expect(
      service.updateProfile(MOCK_USER_ID, { currentPassword: 'wrong', newPassword: 'new123' } as any),
    ).rejects.toThrow(BadRequestException);
  });

  it('throws ConflictException when new email is already taken', async () => {
    const user = makeUser();
    userService.findById.mockResolvedValue(user);
    userService.findByEmail.mockResolvedValue(makeUser({ id: 'other-id', email: 'taken@x.com' }));
    await expect(
      service.updateProfile(MOCK_USER_ID, { email: 'taken@x.com' }),
    ).rejects.toThrow(ConflictException);
  });
});
