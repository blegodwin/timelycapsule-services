import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { validationResult } from "express-validator";
import { User } from "../models/user.model";
import { generateToken } from "../utils/jwt";
// import { sendPasswordResetEmail } from '../services/email.service';
import {
  generateResetToken,
  generateResetTokenExpiry,
} from "../utils/token.utils";
import logger from "../config/logger";
import { sendEmail } from "../services/email.service";

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

    const token = generateToken(newUser.id);
    res.status(201).json({ token });
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

    const token = generateToken(user.id);
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server error");
  }
};

// POST /auth/logout
export const logout = async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({ message: "Logged out" });
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

    const token = generateToken(guestUser.id);
    res.status(201).json({ token });
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
    console.log("User:", user);
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
      html :mailOptions,
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
export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
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
export const upgradeGuest = async (
  req: Request,
  res: Response
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }

  const { email, password } = req.body;
  const userId = req.user?.id; 

  try {
    // Check if email is already in use
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
    res
      .status(200)
      .json({ token, message: "Guest account upgraded successfully" });
  } catch (error) {
    logger.error("Error in upgradeGuest:", error);
    res.status(500).json({ message: "Server error" });
  }
};
