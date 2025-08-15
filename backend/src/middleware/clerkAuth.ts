import { Request, Response, NextFunction } from 'express';
import { ClerkService } from '../services/clerkService';
import { JWTService } from '../services/jwtService';

// Rate limiting for failed authentication attempts
const failedAuthAttempts = new Map<string, { count: number; lastAttempt: number; blockedUntil?: number }>();

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        clerkId: string;
        email: string;
        role: string;
        isEmailVerified: boolean;
      };
    }
  }
}

export const authenticateClerkToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Rate limiting check
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (failedAuthAttempts.has(clientIP)) {
      const { count, lastAttempt } = failedAuthAttempts.get(clientIP)!;
      const timeWindow = 15 * 60 * 1000; // 15 minutes
      
      if (lastAttempt && now - lastAttempt < timeWindow) {
        if (count >= 5) {
          const remainingTime = Math.ceil((timeWindow - (now - lastAttempt)) / 1000);
          return res.status(429).json({ 
            message: `Too many failed authentication attempts. Try again in ${remainingTime} seconds.`,
            retryAfter: remainingTime 
          });
        }
      } else {
        // Reset if outside time window
        failedAuthAttempts.delete(clientIP);
      }
    }

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count++;
      attempts.lastAttempt = now;
      failedAuthAttempts.set(clientIP, attempts);
      return res.status(401).json({ message: 'No valid authorization header' });
    }

    const token = authHeader.substring(7);
    
    try {
      // Verify JWT token
      const payload = await JWTService.verifyToken(token);
      
      if (!payload) {
        const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = now;
        failedAuthAttempts.set(clientIP, attempts);
        return res.status(401).json({ message: 'Invalid token' });
      }

      // Get user data from Clerk API
      let clerkUserEmail: string | undefined;
      
      try {
        const clerkUser = await ClerkService.getUserByClerkId(payload.sub);
        if (clerkUser && clerkUser.email) {
          clerkUserEmail = clerkUser.email;
        }
      } catch (clerkError) {
        // Continue without Clerk API data if there's an error
      }

      // Extract clerk user ID
      const clerkUserId = payload.sub;
      if (!clerkUserId) {
        const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = now;
        failedAuthAttempts.set(clientIP, attempts);
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      // Look up user in database
      let user = await ClerkService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        // User doesn't exist in database - we'll continue without creating them for now
        // The user will need to be created through the Clerk webhook or registration flow
        console.log('User not found in database:', clerkUserId);
        const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = now;
        failedAuthAttempts.set(clientIP, attempts);
        return res.status(401).json({ message: 'User account not found. Please complete registration first.' });
      }

      // Create user object for request
      const userObject = {
        id: user.id, // user is guaranteed to exist at this point
        clerkId: clerkUserId,
        email: clerkUserEmail || payload.email || user.email,
        role: user.role || 'USER',
        isEmailVerified: user.isEmailVerified || false
      };

      // Set user in request
      (req as any).user = userObject;
      
      // Clear failed attempts on success
      failedAuthAttempts.delete(clientIP);
      
      next();
    } catch (jwtError: any) {
      const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count++;
      attempts.lastAttempt = now;
      failedAuthAttempts.set(clientIP, attempts);
      return res.status(401).json({ message: 'Token verification failed' });
    }
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Authentication failed' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
};

export const requireVerifiedEmail = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (!req.user.isEmailVerified) {
    return res.status(403).json({ message: 'Email verification required' });
  }

  next();
};
