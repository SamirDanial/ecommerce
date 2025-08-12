import jwt from 'jsonwebtoken';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export interface ClerkJWTPayload {
  azp: string;
  exp: number;
  iat: number;
  iss: string;
  nbf: number;
  sid: string;
  sub: string;
  [key: string]: any;
}

export class JWTService {
  private static jwks: any = null;
  private static jwksUrl: string = '';

  /**
   * Initialize JWT service with Clerk configuration
   */
  static async initialize() {
    try {
      const clerkIssuerUrl = process.env.CLERK_ISSUER_URL;
      
      if (!clerkIssuerUrl) {
        throw new Error('CLERK_ISSUER_URL environment variable is required');
      }

      this.jwksUrl = `${clerkIssuerUrl}/.well-known/jwks.json`;
      this.jwks = createRemoteJWKSet(new URL(this.jwksUrl));
      
    } catch (error) {
      console.error('Failed to initialize JWT service:', error);
      throw error;
    }
  }

  /**
   * Verify Clerk JWT token
   */
  static async verifyToken(token: string): Promise<ClerkJWTPayload | null> {
    try {
      if (!this.jwks) {
        await this.initialize();
      }

      const { payload } = await jwtVerify(token, this.jwks, {
        issuer: process.env.CLERK_ISSUER_URL,
        // Remove audience validation since Clerk JWT template doesn't include it
        clockTolerance: 10, // 10 seconds tolerance for clock skew
      });

      return payload as ClerkJWTPayload;
    } catch (error) {
      console.error('JWT verification failed:', error);
      return null;
    }
  }

  /**
   * Extract user ID from Clerk JWT token
   */
  static async extractUserId(token: string): Promise<string | null> {
    try {
      const payload = await this.verifyToken(token);
      return payload?.sub || null;
    } catch (error) {
      console.error('Failed to extract user ID from token:', error);
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(payload: ClerkJWTPayload): boolean {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp < now;
  }

  /**
   * Get token expiration time
   */
  static getTokenExpiration(payload: ClerkJWTPayload): Date {
    return new Date(payload.exp * 1000);
  }
}

