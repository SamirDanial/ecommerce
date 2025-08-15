import { prisma } from '../lib/prisma';

export interface ClerkUserData {
  id: string;
  email_addresses: Array<{
    email_address: string;
    id: string;
    verification: {
      status: string;
    };
  }>;
  first_name?: string;
  last_name?: string;
  image_url?: string;
  profile_image_url?: string;
  created_at?: number;
  updated_at?: number;
  external_accounts?: Array<{
    id: string;
    provider: string;
    avatar_url: string;
  }>;
}

export class ClerkService {
  /**
   * Verify session token with Clerk API
   */
  static async verifySessionToken(sessionToken: string): Promise<string | null> {
    try {
      const clerkSecretKey = process.env.CLERK_SECRET_KEY;
      if (!clerkSecretKey) {
        throw new Error('CLERK_SECRET_KEY not configured');
      }

      // Make request to Clerk's API to verify the session token
      const response = await fetch('https://api.clerk.com/v1/sessions/verify', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clerkSecretKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: sessionToken
        })
      });

      if (!response.ok) {
        console.error('Clerk API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json() as { user_id?: string };
      
      // Return the user ID from the verified session
      return data.user_id || null;
    } catch (error) {
      console.error('Error verifying session token:', error);
      return null;
    }
  }

  /**
   * Sync Clerk user data with local database
   */
  static async syncUser(clerkUserData: ClerkUserData) {
    try {
      console.log('=== SYNCING USER ===');
      console.log('Clerk User Data:', JSON.stringify(clerkUserData, null, 2));
      
      // Extract data from Clerk webhook format (snake_case)
      const emailAddresses = clerkUserData.email_addresses;
      const firstName = clerkUserData.first_name;
      const lastName = clerkUserData.last_name;
      
      // Prioritize Google OAuth avatar_url over Clerk processed images
      let imageUrl = null;
      if (clerkUserData.external_accounts && clerkUserData.external_accounts.length > 0) {
        const googleAccount = clerkUserData.external_accounts.find(acc => acc.provider === 'oauth_google');
        if (googleAccount && googleAccount.avatar_url) {
          imageUrl = googleAccount.avatar_url;
        }
      }
      
      // Fallback to Clerk images if no OAuth avatar found
      if (!imageUrl) {
        imageUrl = clerkUserData.profile_image_url || clerkUserData.image_url;
      }
      
      console.log('Extracted data:', {
        emailAddresses: emailAddresses,
        firstName,
        lastName,
        imageUrl
      });
      
      if (!emailAddresses || emailAddresses.length === 0) {
        throw new Error('No email addresses found in user data');
      }
      
      console.log('Email addresses found:', emailAddresses.length);
      
      const primaryEmail = emailAddresses.find(
        email => email.verification.status === 'verified'
      ) || emailAddresses[0];

      console.log('Primary email selected:', primaryEmail);
      console.log('Primary email structure:', {
        hasEmailAddress: 'email_address' in primaryEmail,
        emailAddressValue: primaryEmail.email_address,
        verificationStatus: primaryEmail.verification.status
      });

      if (!primaryEmail) {
        throw new Error('No valid email address found');
      }

      // Extract email value - Clerk uses 'email_address' key
      const emailValue = primaryEmail.email_address;
      console.log('Email value extracted:', emailValue);

      // Check if user exists in local database by clerkId first
      let user = await prisma.user.findUnique({
        where: { clerkId: clerkUserData.id }
      });

      if (!user) {
        // Fallback to email if clerkId not found
        user = await prisma.user.findUnique({
          where: { email: emailValue }
        });
      }

      if (user) {
        // Update existing user
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            clerkId: clerkUserData.id,
            name: `${firstName || ''} ${lastName || ''}`.trim() || 'User',
            avatar: imageUrl,
            isEmailVerified: primaryEmail.verification.status === 'verified',
            updatedAt: new Date()
          }
        });
      } else {
        // Create new user
        console.log('Creating new user in database...');
        user = await prisma.user.create({
          data: {
            clerkId: clerkUserData.id,
            name: `${firstName || ''} ${lastName || ''}`.trim() || 'User',
            email: emailValue,
            password: '', // Clerk handles authentication
            avatar: imageUrl,
            isEmailVerified: primaryEmail.verification.status === 'verified',
            role: 'USER'
          }
        });
        console.log('User created successfully:', user.id);

        // Create default profile and preferences
        await Promise.all([
          prisma.userProfile.create({
            data: {
              userId: user.id,
              firstName: firstName,
              lastName: lastName
            }
          }),
          prisma.userPreferences.create({
            data: {
              userId: user.id
            }
          })
        ]);
      }

      console.log('=== USER SYNC COMPLETE ===');
      return user;
    } catch (error) {
      console.error('Error syncing Clerk user:', error);
      throw error;
    }
  }

  /**
   * Get or create user profile from Clerk user ID
   */
  static async getUserByClerkId(clerkId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { clerkId },
        select: {
          id: true,
          clerkId: true,
          email: true,
          role: true,
          isEmailVerified: true
        }
      });

      return user;
    } catch (error) {
      console.error('Error getting user by Clerk ID:', error);
      throw error;
    }
  }

  /**
   * Create a user session for tracking
   */
  static async createUserSession(userId: number, sessionData: {
    sessionToken: string;
    deviceInfo?: string;
    ipAddress?: string;
    userAgent?: string;
    expiresAt: Date;
  }) {
    try {
      const session = await prisma.userSession.create({
        data: {
          userId,
          sessionToken: sessionData.sessionToken,
          deviceInfo: sessionData.deviceInfo,
          ipAddress: sessionData.ipAddress,
          userAgent: sessionData.userAgent,
          expiresAt: sessionData.expiresAt
        }
      });

      return session;
    } catch (error) {
      console.error('Error creating user session:', error);
      throw error;
    }
  }

  /**
   * Update user session activity
   */
  static async updateSessionActivity(sessionToken: string) {
    try {
      const session = await prisma.userSession.update({
        where: { sessionToken },
        data: { lastActivity: new Date() }
      });

      return session;
    } catch (error) {
      console.error('Error updating session activity:', error);
      throw error;
    }
  }

  /**
   * Revoke user session
   */
  static async revokeSession(sessionToken: string) {
    try {
      const session = await prisma.userSession.update({
        where: { sessionToken },
        data: { isActive: false }
      });

      return session;
    } catch (error) {
      console.error('Error revoking session:', error);
      throw error;
    }
  }

  /**
   * Update email verification status for a user
   */
  static async updateEmailVerificationStatus(
    clerkUserId: string, 
    emailAddress: string, 
    status: 'verified' | 'unverified'
  ) {
    try {
      console.log(`Updating email verification status for user ${clerkUserId}: ${emailAddress} -> ${status}`);
      
      // Find user by clerkId
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
      });

      if (!user) {
        console.log(`User not found for clerkId: ${clerkUserId}`);
        return null;
      }

      // Update user's email verification status
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          isEmailVerified: status === 'verified',
          updatedAt: new Date()
        }
      });

      console.log(`Email verification status updated successfully for user: ${updatedUser.id}`);
      return updatedUser;
    } catch (error) {
      console.error('Error updating email verification status:', error);
      throw error;
    }
  }

  /**
   * Track new email address for a user
   */
  static async trackEmailAddress(clerkUserId: string, emailAddress: string) {
    try {
      console.log(`Tracking new email address for user ${clerkUserId}: ${emailAddress}`);
      
      // Find user by clerkId
      const user = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
      });

      if (!user) {
        console.log(`User not found for clerkId: ${clerkUserId}`);
        return null;
      }

      // Check if this email is already associated with the user
      if (user.email === emailAddress) {
        console.log(`Email ${emailAddress} is already the primary email for user: ${user.id}`);
        return user;
      }

      // For now, we'll just log the new email address
      // In a more complex system, you might want to store multiple email addresses
      console.log(`New email address ${emailAddress} tracked for user: ${user.id}`);
      
      return user;
    } catch (error) {
      console.error('Error tracking email address:', error);
      throw error;
    }
  }
}
