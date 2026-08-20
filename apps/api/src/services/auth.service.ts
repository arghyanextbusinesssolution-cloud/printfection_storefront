import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { Admin, IAdmin } from '../models/Admin';
import { ApiError } from '../utils/ApiError';
import { logger } from '../utils/logger';

const SALT_ROUNDS = 12;
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  admin: Omit<IAdmin, 'passwordHash'>;
  tokens: TokenPair;
}

function generateTokens(admin: IAdmin): TokenPair {
  const payload = { id: admin._id.toString(), email: admin.email, role: admin.role };
  const accessToken = jwt.sign(payload, env.JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
  const refreshToken = jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
  return { accessToken, refreshToken };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!admin || !admin.isActive) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  admin.lastLoginAt = new Date();
  await admin.save();

  const tokens = generateTokens(admin);
  logger.info('Admin login successful', { email: admin.email });

  const adminObj = admin.toObject();
  delete (adminObj as unknown as Record<string, unknown>).passwordHash;

  return { admin: adminObj as Omit<IAdmin, 'passwordHash'>, tokens };
}

export async function refreshAccessToken(refreshToken: string): Promise<TokenPair> {
  try {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { id: string };
    const admin = await Admin.findById(payload.id);
    if (!admin || !admin.isActive) {
      throw ApiError.unauthorized('Invalid refresh token');
    }
    return generateTokens(admin);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function createAdmin(
  email: string,
  password: string,
  name: string,
  role: 'admin' | 'superadmin' = 'admin'
): Promise<IAdmin> {
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict('Admin with this email already exists');
  }
  const passwordHash = await hashPassword(password);
  return Admin.create({ email: email.toLowerCase(), passwordHash, name, role });
}

export async function getMe(adminId: string): Promise<IAdmin | null> {
  return Admin.findById(adminId);
}
