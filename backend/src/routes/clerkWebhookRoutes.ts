import express from 'express';
import { ClerkService } from '../services/clerkService';
import crypto from 'crypto';

const router = express.Router();

// Clerk webhook endpoint
router.post('/webhook', async (req, res) => {
  try {
    // Verify webhook signature (disabled for local testing)
    // const signature = req.headers['svix-signature'] as string;
    // const timestamp = req.headers['svix-timestamp'] as string;
    // const svixId = req.headers['svix-id'] as string;
    
    // if (!signature || !timestamp || !svixId) {
    //   console.log('Missing webhook headers');
    //   return res.status(400).json({ error: 'Missing webhook headers' });
    // }

    const { type, data } = req.body;

    console.log('=== CLERK WEBHOOK RECEIVED ===');
    console.log('Type:', type);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('Headers:', req.headers);
    console.log('================================');

    switch (type) {
      case 'user.created':
        await handleUserCreated(data);
        break;
      
      case 'user.updated':
        await handleUserUpdated(data);
        break;
      
      case 'user.deleted':
        await handleUserDeleted(data);
        break;
      
      case 'session.created':
        await handleSessionCreated(data);
        break;
      
      case 'session.revoked':
        await handleSessionRevoked(data);
        break;
      
      case 'email_address.verified':
        await handleEmailVerified(data);
        break;
      
      case 'email_address.created':
        await handleEmailCreated(data);
        break;
      
      default:
        console.log('Unhandled webhook type:', type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error processing Clerk webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

async function handleUserCreated(userData: any) {
  try {
    console.log('Handling user.created webhook for:', userData.id);
    await ClerkService.syncUser(userData);
    console.log('User created successfully:', userData.id);
  } catch (error) {
    console.error('Error handling user.created:', error);
  }
}

async function handleUserUpdated(userData: any) {
  try {
    console.log('Handling user.updated webhook for:', userData.id);
    await ClerkService.syncUser(userData);
    console.log('User updated successfully:', userData.id);
  } catch (error) {
    console.error('Error handling user.updated:', error);
  }
}

async function handleUserDeleted(userData: any) {
  try {
    console.log('Handling user.deleted webhook for:', userData.id);
    // You might want to mark the user as inactive instead of deleting
    // await prisma.user.update({
    //   where: { clerkId: userData.id },
    //   data: { isActive: false }
    // });
    console.log('User deleted successfully:', userData.id);
  } catch (error) {
    console.error('Error handling user.deleted:', error);
  }
}

async function handleSessionCreated(sessionData: any) {
  try {
    console.log('Handling session.created webhook for:', sessionData.id);
    // You can create a session record if needed
    // await ClerkService.createUserSession(userId, sessionData);
    console.log('Session created successfully:', sessionData.id);
  } catch (error) {
    console.error('Error handling session.created:', error);
  }
}

async function handleSessionRevoked(sessionData: any) {
  try {
    console.log('Handling session.revoked webhook for:', sessionData.id);
    // You can mark the session as inactive if needed
    // await ClerkService.revokeSession(sessionData.id);
    console.log('Session revoked successfully:', sessionData.id);
  } catch (error) {
    console.error('Error handling session.revoked:', error);
  }
}

async function handleEmailVerified(emailData: any) {
  try {
    console.log('Handling email_address.verified webhook for:', emailData.id);
    
    // Update user's email verification status in your database
    if (emailData.user_id) {
      await ClerkService.updateEmailVerificationStatus(
        emailData.user_id, 
        emailData.email_address, 
        'verified'
      );
    }
    
    console.log('Email verification status updated successfully:', emailData.id);
  } catch (error) {
    console.error('Error handling email_address.verified:', error);
  }
}

async function handleEmailCreated(emailData: any) {
  try {
    console.log('Handling email_address.created webhook for:', emailData.id);
    
    // Track new email addresses for users
    if (emailData.user_id) {
      await ClerkService.trackEmailAddress(
        emailData.user_id, 
        emailData.email_address
      );
    }
    
    console.log('Email address tracked successfully:', emailData.id);
  } catch (error) {
    console.error('Error handling email_address.created:', error);
  }
}

export default router;

