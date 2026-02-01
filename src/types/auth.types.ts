export interface User {
  id: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  role: UserRole;
  status: UserStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  profileCompleted: boolean;
  identityVerified: boolean;
  backgroundCheckStatus?: BackgroundCheckStatus;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  lastLoginDevice?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkerProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  ssn?: string; // Encrypted
  skills: string[];
  experience: number; // Years
  hourlyRate: number;
  availability: Availability;
  rating: number;
  reviewCount: number;
  documentsVerified: boolean;
  insuranceVerified: boolean;
  licenseNumber?: string;
  licenseState?: string;
  licenseExpiry?: Date;
  backgroundCheckId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContractorProfile {
  id: string;
  userId: string;
  companyName: string;
  companyType: CompanyType;
  ein?: string; // Encrypted
  businessLicense?: string;
  insurancePolicyNumber?: string;
  insuranceExpiry?: Date;
  bondNumber?: string;
  bondAmount?: number;
  yearsInBusiness: number;
  employeeCount: number;
  rating: number;
  reviewCount: number;
  verificationStatus: VerificationStatus;
  stripeAccountId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  WORKER = 'WORKER',
  CONTRACTOR = 'CONTRACTOR',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR'
}

export enum UserStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DEACTIVATED = 'DEACTIVATED'
}

export enum BackgroundCheckStatus {
  NOT_STARTED = 'NOT_STARTED',
  PENDING = 'PENDING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED'
}

export enum VerificationStatus {
  UNVERIFIED = 'UNVERIFIED',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED'
}

export enum CompanyType {
  SOLE_PROPRIETOR = 'SOLE_PROPRIETOR',
  LLC = 'LLC',
  CORPORATION = 'CORPORATION',
  PARTNERSHIP = 'PARTNERSHIP'
}

export interface Availability {
  monday: TimeSlot[];
  tuesday: TimeSlot[];
  wednesday: TimeSlot[];
  thursday: TimeSlot[];
  friday: TimeSlot[];
  saturday: TimeSlot[];
  sunday: TimeSlot[];
}

export interface TimeSlot {
  start: string; // HH:MM format
  end: string; // HH:MM format
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'Bearer';
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  deviceFingerprint: string;
  iat?: number;
  exp?: number;
}

export interface RefreshTokenPayload extends JWTPayload {
  tokenFamily: string;
}

export interface Session {
  id: string;
  userId: string;
  refreshToken: string;
  tokenFamily: string;
  deviceFingerprint: string;
  userAgent: string;
  ipAddress: string;
  isActive: boolean;
  lastActivityAt: Date;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface MFAChallenge {
  id: string;
  userId: string;
  type: MFAType;
  secret?: string;
  code?: string;
  verified: boolean;
  expiresAt: Date;
  attempts: number;
  createdAt: Date;
}

export enum MFAType {
  TOTP = 'TOTP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  BACKUP_CODE = 'BACKUP_CODE'
}

export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export enum AuditAction {
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  LOGIN_FAILED = 'LOGIN_FAILED',
  PASSWORD_RESET = 'PASSWORD_RESET',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  PROFILE_UPDATED = 'PROFILE_UPDATED',
  DOCUMENT_UPLOADED = 'DOCUMENT_UPLOADED',
  DOCUMENT_VERIFIED = 'DOCUMENT_VERIFIED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  JOB_POSTED = 'JOB_POSTED',
  JOB_APPLIED = 'JOB_APPLIED',
  BACKGROUND_CHECK_INITIATED = 'BACKGROUND_CHECK_INITIATED',
  ACCOUNT_SUSPENDED = 'ACCOUNT_SUSPENDED',
  ACCOUNT_REACTIVATED = 'ACCOUNT_REACTIVATED'
}

export interface LoginRequest {
  email: string;
  password: string;
  deviceFingerprint: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  phone?: string;
  role: UserRole.WORKER | UserRole.CONTRACTOR;
  acceptTerms: boolean;
  deviceFingerprint: string;
}

export interface OAuth2Profile {
  provider: 'google' | 'facebook' | 'linkedin';
  providerId: string;
  email: string;
  emailVerified: boolean;
  name?: string;
  picture?: string;
}

export interface DocumentUpload {
  id: string;
  userId: string;
  type: DocumentType;
  fileName: string;
  fileSize: number;
  mimeType: string;
  s3Key: string;
  s3Url: string;
  verified: boolean;
  verificationResult?: any;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export enum DocumentType {
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  PASSPORT = 'PASSPORT',
  SSN_CARD = 'SSN_CARD',
  INSURANCE_CERTIFICATE = 'INSURANCE_CERTIFICATE',
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  W9_FORM = 'W9_FORM',
  PROFESSIONAL_LICENSE = 'PROFESSIONAL_LICENSE',
  CERTIFICATION = 'CERTIFICATION'
}

export interface SecurityHeaders {
  'X-Content-Type-Options': 'nosniff';
  'X-Frame-Options': 'DENY';
  'X-XSS-Protection': '1; mode=block';
  'Strict-Transport-Security': string;
  'Content-Security-Policy': string;
  'Referrer-Policy': 'strict-origin-when-cross-origin';
  'Permissions-Policy': string;
}