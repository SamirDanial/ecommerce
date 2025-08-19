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
    console.log('=== AUTHENTICATION ATTEMPT ===');
    console.log('Headers:', req.headers);
    console.log('IP:', req.ip || req.connection.remoteAddress || 'unknown');
    
    // Rate limiting check
    const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    if (failedAuthAttempts.has(clientIP)) {
      const { count, lastAttempt } = failedAuthAttempts.get(clientIP)!;
      const timeWindow = 15 * 60 * 1000; // 15 minutes
      
      if (lastAttempt && now - lastAttempt < timeWindow) {
        if (count >= 5) {
          const remainingTime = Math.ceil((timeWindow - (now - lastAttempt)) / 1000);
          console.log(`Rate limited IP: ${clientIP}, attempts: ${count}`);
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
      console.log('No valid authorization header found');
      const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
      attempts.count++;
      attempts.lastAttempt = now;
      failedAuthAttempts.set(clientIP, attempts);
      return res.status(401).json({ message: 'No valid authorization header' });
    }

    const token = authHeader.substring(7);
    console.log('Token received (first 20 chars):', token.substring(0, 20) + '...');
    
    try {
      // Verify JWT token
      console.log('Verifying JWT token...');
      const payload = await JWTService.verifyToken(token);
      
      if (!payload) {
        console.log('JWT verification failed - no payload returned');
        const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = now;
        failedAuthAttempts.set(clientIP, attempts);
        return res.status(401).json({ message: 'Invalid token' });
      }

      console.log('JWT payload:', JSON.stringify(payload, null, 2));

      // Get user data from Clerk API
      let clerkUserEmail: string | undefined;
      
      try {
        console.log('Getting Clerk user data for ID:', payload.sub);
        const clerkUser = await ClerkService.getUserByClerkId(payload.sub);
        if (clerkUser && clerkUser.email) {
          clerkUserEmail = clerkUser.email;
          console.log('Found Clerk user email:', clerkUserEmail);
        } else {
          console.log('No Clerk user email found');
        }
      } catch (clerkError) {
        console.log('Clerk API error (continuing):', clerkError);
        // Continue without Clerk API data if there's an error
      }

      // Extract clerk user ID
      const clerkUserId = payload.sub;
      if (!clerkUserId) {
        console.log('No clerkUserId in JWT payload');
        const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
        attempts.count++;
        attempts.lastAttempt = now;
        failedAuthAttempts.set(clientIP, attempts);
        return res.status(401).json({ message: 'Invalid token payload' });
      }

      console.log('Looking up user in database with clerkId:', clerkUserId);
      
      // Look up user in database
      let user = await ClerkService.getUserByClerkId(clerkUserId);
      
      if (!user) {
        console.log('User not found in database. Checking if we should create them...');
        console.log('Available payload data:', {
          sub: payload.sub,
          email: payload.email,
          clerkId: clerkUserId
        });
        
        // For now, let's create a basic user if they don't exist
        // This is a temporary fix - normally this should happen via webhook
        try {
          console.log('Attempting to create user in database...');
          const { prisma } = await import('../lib/prisma');
          
          user = await prisma.user.create({
            data: {
              clerkId: clerkUserId,
              name: payload.name || 'User',
              email: payload.email || 'user@example.com',
              password: '', // Clerk handles authentication
              role: 'USER',
              isEmailVerified: payload.email_verified || false
            }
          });
          
          console.log('User created successfully:', user.id);
          
          // Create default profile and preferences
          await Promise.all([
            prisma.userProfile.create({
              data: {
                userId: user.id,
                firstName: payload.given_name || '',
                lastName: payload.family_name || ''
              }
            }),
            prisma.userPreferences.create({
              data: {
                userId: user.id
              }
            })
          ]);
          
          console.log('User profile and preferences created');
        } catch (createError) {
          console.error('Failed to create user:', createError);
          const attempts = failedAuthAttempts.get(clientIP) || { count: 0, lastAttempt: 0 };
          attempts.count++;
          attempts.lastAttempt = now;
          failedAuthAttempts.set(clientIP, attempts);
          return res.status(401).json({ message: 'User account not found. Please complete registration first.' });
        }
      } else {
        console.log('User found in database:', user.id);
      }

      // Create user object for request
      const userObject = {
        id: user.id, // user is guaranteed to exist at this point
        clerkId: clerkUserId,
        email: clerkUserEmail || payload.email || user.email,
        role: user.role || 'USER',
        isEmailVerified: user.isEmailVerified || false
      };

      console.log('Setting user in request:', userObject);

      // Set user in request
      (req as any).user = userObject;
      
      // Clear failed attempts on success
      failedAuthAttempts.delete(clientIP);
      
      console.log('=== AUTHENTICATION SUCCESS ===');
      next();
    } catch (jwtError: any) {
      console.error('JWT verification error:', jwtError);
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
