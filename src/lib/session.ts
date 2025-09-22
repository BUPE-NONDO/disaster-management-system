import { User } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export interface UserSession {
  uid: string;
  email: string;
  lastLogin: Date;
  lastActivity: Date;
  loginCount: number;
  isActive: boolean;
  deviceInfo?: {
    userAgent: string;
    platform: string;
    language: string;
  };
  ipAddress?: string;
}

export interface SecurityEvent {
  id: string;
  userId: string;
  eventType: 'LOGIN' | 'LOGOUT' | 'PASSWORD_CHANGE' | 'EMAIL_VERIFICATION' | 'ROLE_CHANGE' | 'SUSPICIOUS_ACTIVITY';
  description: string;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export const sessionService = {
  // Track user login
  async trackLogin(user: User, ipAddress?: string) {
    try {
      const sessionData: Omit<UserSession, 'uid'> = {
        email: user.email || '',
        lastLogin: new Date(),
        lastActivity: new Date(),
        loginCount: 1,
        isActive: true,
        deviceInfo: {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          language: navigator.language
        },
        ipAddress
      };

      // Get existing session to increment login count
      const sessionRef = doc(db, 'userSessions', user.uid);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const existingSession = sessionDoc.data() as UserSession;
        sessionData.loginCount = (existingSession.loginCount || 0) + 1;
      }

      await setDoc(sessionRef, {
        ...sessionData,
        lastLogin: serverTimestamp(),
        lastActivity: serverTimestamp()
      }, { merge: true });

      // Log security event
      await this.logSecurityEvent(user.uid, 'LOGIN', 'User logged in successfully', {
        ipAddress,
        userAgent: navigator.userAgent
      });

    } catch (error) {
      console.error('Error tracking login:', error);
    }
  },

  // Track user activity
  async trackActivity(user: User) {
    try {
      const sessionRef = doc(db, 'userSessions', user.uid);
      await updateDoc(sessionRef, {
        lastActivity: serverTimestamp()
      });
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  },

  // Track user logout
  async trackLogout(user: User) {
    try {
      const sessionRef = doc(db, 'userSessions', user.uid);
      await updateDoc(sessionRef, {
        isActive: false,
        lastActivity: serverTimestamp()
      });

      // Log security event
      await this.logSecurityEvent(user.uid, 'LOGOUT', 'User logged out');
    } catch (error) {
      console.error('Error tracking logout:', error);
    }
  },

  // Get user session
  async getUserSession(uid: string): Promise<UserSession | null> {
    try {
      const sessionRef = doc(db, 'userSessions', uid);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        return { uid, ...sessionDoc.data() } as UserSession;
      }
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  },

  // Get all active sessions
  async getActiveSessions(): Promise<UserSession[]> {
    try {
      // This would require a query in a real implementation
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting active sessions:', error);
      return [];
    }
  },

  // Log security event
  async logSecurityEvent(
    userId: string, 
    eventType: SecurityEvent['eventType'], 
    description: string, 
    metadata?: Record<string, any>
  ) {
    try {
      const eventData: Omit<SecurityEvent, 'id'> = {
        userId,
        eventType,
        description,
        timestamp: new Date(),
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
        metadata
      };

      const eventRef = doc(db, 'securityEvents', `${userId}_${Date.now()}`);
      await setDoc(eventRef, {
        ...eventData,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging security event:', error);
    }
  },

  // Get security events for a user
  async getUserSecurityEvents(uid: string, limit = 50): Promise<SecurityEvent[]> {
    try {
      // This would require a query in a real implementation
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting security events:', error);
      return [];
    }
  },

  // Check for suspicious activity
  async checkSuspiciousActivity(user: User, ipAddress?: string): Promise<boolean> {
    try {
      const session = await this.getUserSession(user.uid);
      if (!session) return false;

      // Check for multiple IP addresses
      if (session.ipAddress && session.ipAddress !== ipAddress) {
        await this.logSecurityEvent(user.uid, 'SUSPICIOUS_ACTIVITY', 'Login from different IP address', {
          previousIp: session.ipAddress,
          currentIp: ipAddress
        });
        return true;
      }

      // Check for unusual login times (simplified check)
      const now = new Date();
      const lastLogin = session.lastLogin;
      if (lastLogin) {
        const hoursSinceLastLogin = (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60);
        if (hoursSinceLastLogin < 1 && session.loginCount > 5) {
          await this.logSecurityEvent(user.uid, 'SUSPICIOUS_ACTIVITY', 'Multiple rapid logins detected', {
            loginCount: session.loginCount,
            hoursSinceLastLogin
          });
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Error checking suspicious activity:', error);
      return false;
    }
  },

  // Force logout all sessions for a user
  async forceLogoutAllSessions(uid: string) {
    try {
      const sessionRef = doc(db, 'userSessions', uid);
      await updateDoc(sessionRef, {
        isActive: false,
        lastActivity: serverTimestamp()
      });

      await this.logSecurityEvent(uid, 'LOGOUT', 'All sessions terminated by admin');
    } catch (error) {
      console.error('Error forcing logout:', error);
    }
  }
};
