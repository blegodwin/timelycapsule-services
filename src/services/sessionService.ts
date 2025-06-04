import { IUser } from '../models/User';

interface UserSession {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;
  lastActivity: Date;
  ipAddress?: string;
  userAgent?: string;
}

export class UserSessionService {
  private static sessions = new Map<string, UserSession>();

  static createSession(
    user: IUser, 
    accessToken: string, 
    refreshToken: string,
    ipAddress?: string,
    userAgent?: string
  ): string {
    const sessionId = this.generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); 

    const session: UserSession = {
      userId: user._id.toString(),
      accessToken,
      refreshToken,
      expiresAt,
      createdAt: new Date(),
      lastActivity: new Date(),
      ipAddress,
      userAgent,
    };

    this.sessions.set(sessionId, session);
    return sessionId;
  }

  static getSession(sessionId: string): UserSession | undefined {
    const session = this.sessions.get(sessionId);
    
    if (session && session.expiresAt > new Date()) {

      session.lastActivity = new Date();
      return session;
    }
    

    if (session) {
      this.sessions.delete(sessionId);
    }
    
    return undefined;
  }

  static updateSessionActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
    }
  }

  static invalidateSession(sessionId: string): boolean {
    return this.sessions.delete(sessionId);
  }

  static invalidateUserSessions(userId: string): number {
    let count = 0;
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    return count;
  }

  static getUserSessions(userId: string): UserSession[] {
    const userSessions: UserSession[] = [];
    for (const session of this.sessions.values()) {
      if (session.userId === userId && session.expiresAt > new Date()) {
        userSessions.push(session);
      }
    }
    return userSessions;
  }

  static cleanupExpiredSessions(): number {
    let count = 0;
    const now = new Date();
    
    for (const [sessionId, session] of this.sessions.entries()) {
      if (session.expiresAt <= now) {
        this.sessions.delete(sessionId);
        count++;
      }
    }
    
    return count;
  }

  private static generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex');
  }
}
