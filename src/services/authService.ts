import jwt, { SignOptions } from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { config } from '../config/environment';
import { UserModel, User, CreateUserInput } from '../models/User';
import { WorkerProfileModel } from '../models/WorkerProfile';
import { ContractorProfileModel } from '../models/ContractorProfile';
import { cache } from '../config/redis';
import { UnauthorizedError, BadRequestError, ConflictError } from '../utils/errors';
import { generateToken, generateVerificationCode } from '../utils/helpers';

interface TokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface RegisterInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role: 'worker' | 'contractor';
  latitude?: number;
  longitude?: number;
}

export class AuthService {
  static generateAccessToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: config.jwt.accessExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, config.jwt.secret, options);
  }

  static generateRefreshToken(user: User): string {
    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const options: SignOptions = {
      expiresIn: config.jwt.refreshExpiresIn as SignOptions['expiresIn'],
    };
    return jwt.sign(payload, config.jwt.refreshSecret, options);
  }

  static async generateTokens(user: User): Promise<AuthTokens> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    // Store refresh token in Redis for validation
    await cache.set(
      `refresh_token:${user.id}:${refreshToken}`,
      { userId: user.id },
      7 * 24 * 60 * 60 // 7 days
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
    };
  }

  static async register(input: RegisterInput): Promise<{ user: Omit<User, 'password_hash'>; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError('User with this email already exists');
    }

    if (input.phoneNumber) {
      const existingPhone = await UserModel.findByPhone(input.phoneNumber);
      if (existingPhone) {
        throw new ConflictError('User with this phone number already exists');
      }
    }

    // Hash password
    const passwordHash = await UserModel.hashPassword(input.password);

    // Create user
    const userInput: CreateUserInput = {
      email: input.email,
      password_hash: passwordHash,
      first_name: input.firstName,
      last_name: input.lastName,
      phone_number: input.phoneNumber || null,
      role: input.role,
      status: 'pending_verification',
      profile_picture_url: null,
      email_verified: false,
      phone_verified: false,
    };

    const user = await UserModel.create(userInput);

    // Create profile based on role
    const workerProfileBase = {
      user_id: user.id,
      bio: null,
      hourly_rate_min: null,
      hourly_rate_max: null,
      years_of_experience: 0,
      available_for_work: true,
      service_radius_km: 50,
      response_time_hours: null,
      verification_status: 'pending' as const,
      verification_documents: null,
    };

    const contractorProfileBase = {
      user_id: user.id,
      company_name: null,
      company_description: null,
      company_size: null,
      industry: null,
      website_url: null,
      tax_id: null,
      total_jobs_posted: 0,
      total_spent: 0,
      average_rating: 0,
      rating_count: 0,
      verification_status: 'pending' as const,
      verification_documents: null,
    };

    if (input.role === 'worker') {
      if (input.latitude && input.longitude) {
        await WorkerProfileModel.createWithLocation(
          workerProfileBase,
          input.latitude,
          input.longitude
        );
      } else {
        await WorkerProfileModel.create({
          ...workerProfileBase,
          location: null,
        });
      }
    } else if (input.role === 'contractor') {
      if (input.latitude && input.longitude) {
        await ContractorProfileModel.createWithLocation(
          contractorProfileBase,
          input.latitude,
          input.longitude
        );
      } else {
        await ContractorProfileModel.create({
          ...contractorProfileBase,
          location: null,
          verification_status: 'pending',
          verification_documents: null,
        });
      }
    }

    const tokens = await this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }

  static async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; tokens: AuthTokens }> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'suspended') {
      throw new UnauthorizedError('Your account has been suspended');
    }

    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    await UserModel.updateLastLogin(user.id);
    const tokens = await this.generateTokens(user);

    return {
      user: UserModel.sanitize(user),
      tokens,
    };
  }

  static async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = jwt.verify(refreshToken, config.jwt.refreshSecret) as TokenPayload;

      // Check if refresh token is in Redis
      const stored = await cache.get(`refresh_token:${payload.sub}:${refreshToken}`);
      if (!stored) {
        throw new UnauthorizedError('Invalid refresh token');
      }

      const user = await UserModel.findById(payload.sub);
      if (!user || user.status !== 'active') {
        throw new UnauthorizedError('User not found or inactive');
      }

      // Invalidate old refresh token
      await cache.del(`refresh_token:${payload.sub}:${refreshToken}`);

      return this.generateTokens(user);
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  static async logout(userId: string, refreshToken: string): Promise<void> {
    await cache.del(`refresh_token:${userId}:${refreshToken}`);
  }

  static async logoutAll(userId: string): Promise<void> {
    await cache.delPattern(`refresh_token:${userId}:*`);
  }

  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    try {
      return jwt.verify(token, config.jwt.secret) as TokenPayload;
    } catch {
      throw new UnauthorizedError('Invalid access token');
    }
  }

  static async requestPasswordReset(email: string): Promise<string> {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return 'If the email exists, a reset link will be sent';
    }

    const resetToken = generateToken();
    await cache.set(`password_reset:${resetToken}`, { userId: user.id }, 3600); // 1 hour

    // TODO: Send email with reset link
    return resetToken; // In production, don't return this
  }

  static async resetPassword(token: string, newPassword: string): Promise<void> {
    const data = await cache.get<{ userId: string }>(`password_reset:${token}`);
    if (!data) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const passwordHash = await UserModel.hashPassword(newPassword);
    await UserModel.update(data.userId, { password_hash: passwordHash });
    await cache.del(`password_reset:${token}`);

    // Invalidate all refresh tokens
    await this.logoutAll(data.userId);
  }

  static async generateEmailVerificationCode(userId: string): Promise<string> {
    const code = generateVerificationCode();
    await cache.set(`email_verification:${userId}`, { code }, 600); // 10 minutes
    return code;
  }

  static async verifyEmail(userId: string, code: string): Promise<void> {
    const data = await cache.get<{ code: string }>(`email_verification:${userId}`);
    if (!data || data.code !== code) {
      throw new BadRequestError('Invalid or expired verification code');
    }

    await UserModel.update(userId, { email_verified: true, status: 'active' });
    await cache.del(`email_verification:${userId}`);
  }

  static async setupTOTP(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new BadRequestError('User not found');
    }

    const secret = speakeasy.generateSecret({
      name: `HomeDepot Paisano (${user.email})`,
      issuer: 'HomeDepot Paisano',
    });

    // Store secret temporarily until verified
    await cache.set(`totp_setup:${userId}`, { secret: secret.base32 }, 600);

    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    return {
      secret: secret.base32,
      qrCode,
    };
  }

  static async verifyAndEnableTOTP(userId: string, token: string): Promise<void> {
    const data = await cache.get<{ secret: string }>(`totp_setup:${userId}`);
    if (!data) {
      throw new BadRequestError('TOTP setup not initiated');
    }

    const verified = speakeasy.totp.verify({
      secret: data.secret,
      encoding: 'base32',
      token,
    });

    if (!verified) {
      throw new BadRequestError('Invalid TOTP token');
    }

    // TODO: Store TOTP secret in user record or separate MFA table
    await cache.del(`totp_setup:${userId}`);
  }
}
