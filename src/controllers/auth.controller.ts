import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/user.model';
import RefreshToken from '../models/refresh_token.model';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, generateToken } from '../utils/jwt';
import {
  generateResetToken,
  generateResetTokenExpiry,
} from '../utils/token.utils';
import logger from '../config/logger';
import { sendEmail } from '../services/email.service';

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

// POST /auth/register
export const register = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password, displayName } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already exists" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      passwordHash,
      displayName,
      roles: ["user"],
      guest: false,
      isVerified: false,
    });

    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await RefreshToken.create({
      user: newUser.id,
      token: hashedRefreshToken,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(201).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// POST /auth/login
export const login = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.guest) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash!);
    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    user.lastLoginAt = new Date();
    await user.save();

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await RefreshToken.create({
      user: user.id,
      token: hashedRefreshToken,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshTokenCookie(res, refreshToken);

    res.json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// POST /auth/refresh
export const refresh = async (req: Request, res: Response): Promise<void> => {
  let token = req.cookies.refreshToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ message: 'No refresh token provided' });
    return;
  }

  try {
    const payload = verifyRefreshToken(token) as { id: string };
    const userId = payload.id;

    const storedTokens = await RefreshToken.find({ user: userId });

    let validStoredToken = null;
    for (const stored of storedTokens) {
      const match = await bcrypt.compare(token, stored.token);
      if (match) {
        validStoredToken = stored;
        break;
      }
    }

    if (!validStoredToken) {
      res.status(403).json({ message: 'Invalid refresh token' });
      return;
    }

    await RefreshToken.deleteOne({ _id: validStoredToken._id });

    const newAccessToken = generateAccessToken(userId);
    const newRefreshToken = generateRefreshToken(userId);

    const hashedNewRefreshToken = await bcrypt.hash(newRefreshToken, 10);
    await RefreshToken.create({
      user: userId,
      token: hashedNewRefreshToken,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error(error);
    res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
};

// POST /auth/logout
export const logout = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const payload = verifyRefreshToken(token) as { id: string };
      await RefreshToken.deleteMany({ user: payload.id });
    } catch (error) {
      console.error('Error verifying refresh token during logout');
    }
  }

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/auth/refresh',
  });

  res.status(200).json({ message: 'Logged out' });
};

// POST /auth/guest
export const guest = async (_req: Request, res: Response): Promise<void> => {
  try {
    const guestUser = await User.create({
      email: null,
      passwordHash: null,
      displayName: `Guest_${Date.now()}`,
      roles: ["guest"],
      guest: true,
      isVerified: false,
    });

    const accessToken = generateAccessToken(guestUser.id);

    res.status(201).json({ accessToken });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// POST /auth/forgot-password
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.guest) {
      res.status(200).json({
        message: "If an account exists, a password reset email has been sent",
      });
      return;
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = generateResetTokenExpiry();

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const mailOptions = `
      <h1>Password Reset Request</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: mailOptions,
    });

    res.status(200).json({
      message: "If an account exists, a password reset email has been sent",
    });
  } catch (error) {
    logger.error("Error in forgotPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/reset-password
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ message: "Invalid or expired reset token" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.passwordHash = passwordHash;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Password has been reset successfully" });
  } catch (error) {
    logger.error("Error in resetPassword:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// POST /auth/upgrade
export const upgradeGuest = async (req: Request, res: Response): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;
  const userId = req.user?.id;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: "Email already in use" });
      return;
    }

    const user = await User.findById(userId);
    if (!user || !user.guest) {
      res.status(400).json({ message: "Invalid guest user" });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.email = email;
    user.passwordHash = passwordHash;
    user.guest = false;
    user.roles = ["user"];
    await user.save();

    const token = generateToken(user.id);
    res.status(200).json({ token, message: "Guest account upgraded successfully" });
  } catch (error) {
    logger.error("Error in upgradeGuest:", error);
    res.status(500).json({ message: "Server error" });
  }
};
