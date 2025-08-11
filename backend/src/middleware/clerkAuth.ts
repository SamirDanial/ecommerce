import { Request, Response, NextFunction } from 'express';
import { ClerkService } from '../services/clerkService';
import { JWTService } from '../services/jwtService';

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

export const authenticateClerkToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    // Verify JWT token with Clerk
    const payload = await JWTService.verifyToken(token);
    
    if (!payload) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Check if token is expired
    if (JWTService.isTokenExpired(payload)) {
      return res.status(401).json({ message: 'Token expired' });
    }

    // Extract user ID from token
    const clerkUserId = payload.sub;
    
    if (!clerkUserId) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Get user from database using Clerk ID
    let user = await ClerkService.getUserByClerkId(clerkUserId);

    if (!user) {
      // User doesn't exist in database, try to sync from Clerk
      try {
        console.log(`User ${clerkUserId} not found in database, attempting to sync from Clerk...`);
        
        // Get user data from Clerk using the JWT payload
        const clerkUserData = {
          id: clerkUserId,
          email_addresses: [{ 
            email_address: payload.email || '', 
            id: 'temp', 
            verification: { status: 'verified' } 
          }],
          first_name: payload.given_name || '',
          last_name: payload.family_name || '',
          image_url: payload.picture || '',
          created_at: Date.now(),
          updated_at: Date.now()
        };

        // Sync user data
        user = await ClerkService.syncUser(clerkUserData);
        console.log(`Successfully synced user ${clerkUserId} from Clerk`);
      } catch (syncError) {
        console.error('Failed to sync user from Clerk:', syncError);
        return res.status(401).json({ message: 'User not found and sync failed' });
      }
    }

    // Add user info to request
    req.user = {
      id: user.id,
      clerkId: user.clerkId || '',
      email: user.email,
      role: user.role,
      isEmailVerified: user.isEmailVerified
    };

    next();
  } catch (error) {
    console.error('Clerk authentication error:', error);
    return res.status(500).json({ message: 'Authentication error' });
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
