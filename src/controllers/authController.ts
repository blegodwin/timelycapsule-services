import { Request, Response } from 'express';
import { User } from '../models/User';
import { PasswordUtils } from '../utils/password';
import { JWTUtils } from '../utils/jwt';
import { UserSessionService } from '../services/sessionService';
import { AuthenticatedRequest } from '../middleware/auth';

export class AuthController {
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, username, password, firstName, lastName } = req.body;


      if (!email || !username || !password || !firstName || !lastName) {
        res.status(400).json({
          error: 'Validation error',
          message: 'All required fields must be provided'
        });
        return;
      }

      const existingUser = await User.findOne({
        $or: [{ email: email.toLowerCase() }, { username }]
      });

      if (existingUser) {
        const field = existingUser.email === email.toLowerCase() ? 'Email' : 'Username';
        res.status(400).json({
          error: 'User already exists',
          message: `${field} already taken`
        });
        return;
      }

      
      const hashedPassword = await PasswordUtils.hash(password);

      
      const user = new User({
        email: email.toLowerCase(),
        username,
        password: hashedPassword,
        firstName,
        lastName,
      });

      await user.save();

      
      const { accessToken, refreshToken } = JWTUtils.generateTokenPair(user);

      
      const sessionId = UserSessionService.createSession(
        user,
        accessToken,
        refreshToken,
        req.ip,
        req.get('User-Agent')
      );

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            isVerified: user.isVerified,
          },
          tokens: {
            accessToken,
            refreshToken,
            sessionId,
          },
        },
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
        message: 'Internal server error'
      });
    }
  }

  static async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      
      if (!email || !password) {
        res.status(400).json({
          error: 'Validation error',
          message: 'Email and password are required'
        });
        return;
      }

      
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password incorrect'
        });
        return;
      }

      
      const isPasswordValid = await PasswordUtils.compare(password, user.password);
      if (!isPasswordValid) {
        res.status(401).json({
          error: 'Invalid credentials',
          message: 'Email or password incorrect'
        });
        return;
      }

      
      user.lastActive = new Date();
      await user.save();

      
      const { accessToken, refreshToken } = JWTUtils.generateTokenPair(user);

      
      const sessionId = UserSessionService.createSession(
        user,
        accessToken,
        refreshToken,
        req.ip,
        req.get('User-Agent')
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user._id,
            email: user.email,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: user.fullName,
            isVerified: user.isVerified,
            lastActive: user.lastActive,
          },
          tokens: {
            accessToken,
            refreshToken,
            sessionId,
          },
        },
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
        message: 'Internal server error'
      });
    }
  }

  static async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(401).json({
          error: 'Refresh token required',
          message: 'No refresh token provided'
        });
        return;
      }

      const decoded = JWTUtils.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);

      if (!user) {
        res.status(401).json({
          error: 'Invalid refresh token',
          message: 'User not found'
        });
        return;
      }

      const { accessToken, refreshToken: newRefreshToken } = JWTUtils.generateTokenPair(user);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens: {
            accessToken,
            refreshToken: newRefreshToken,
          },
        },
      });
    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({
        success: false,
        error: 'Invalid refresh token',
        message: 'Token verification failed'
      });
    }
  }

  static async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { sessionId } = req.body;

      if (sessionId) {
        UserSessionService.invalidateSession(sessionId);
      }

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: 'Internal server error'
      });
    }
  }

  static async logoutAll(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User ID not found'
        });
        return;
      }

      const sessionsInvalidated = UserSessionService.invalidateUserSessions(req.userId);

      res.json({
        success: true,
        message: 'Logged out from all devices successfully',
        data: {
          sessionsInvalidated,
        },
      });
    } catch (error) {
      console.error('Logout all error:', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
        message: 'Internal server error'
      });
    }
  }

  static async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User not found in request'
        });
        return;
      }

      res.json({
        success: true,
        data: {
          user: {
            id: req.user._id,
            email: req.user.email,
            username: req.user.username,
            firstName: req.user.firstName,
            lastName: req.user.lastName,
            fullName: req.user.fullName,
            avatar: req.user.avatar,
            bio: req.user.bio,
            isVerified: req.user.isVerified,
            preferences: req.user.preferences,
            stats: req.user.stats,
            lastActive: req.user.lastActive,
            createdAt: req.user.createdAt,
          },
        },
      });
    } catch (error) {
      console.error('Get current user error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get user',
        message: 'Internal server error'
      });
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User not found in request'
        });
        return;
      }

      const allowedUpdates = ['firstName', 'lastName', 'bio', 'avatar', 'preferences'];
      const updates: any = {};

      
      Object.keys(req.body).forEach(key => {
        if (allowedUpdates.includes(key)) {
          updates[key] = req.body[key];
        }
      });

      if (Object.keys(updates).length === 0) {
        res.status(400).json({
          error: 'No valid updates provided',
          message: 'At least one valid field must be provided for update'
        });
        return;
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        updates,
        { new: true, runValidators: true }
      ).select('-password');

      if (!updatedUser) {
        res.status(404).json({
          error: 'User not found',
          message: 'User could not be updated'
        });
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: updatedUser,
        },
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        error: 'Update failed',
        message: 'Internal server error'
      });
    }
  }

  static async getUserSessions(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.userId) {
        res.status(401).json({
          error: 'Authentication required',
          message: 'User ID not found'
        });
        return;
      }

      const sessions = UserSessionService.getUserSessions(req.userId);

      res.json({
        success: true,
        data: {
          sessions: sessions.map(session => ({
            createdAt: session.createdAt,
            lastActivity: session.lastActivity,
            ipAddress: session.ipAddress,
            userAgent: session.userAgent,
          })),
        },
      });
    } catch (error) {
      console.error('Get user sessions error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get sessions',
        message: 'Internal server error'
      });
    }
  }
}
