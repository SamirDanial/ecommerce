# Email Verification Setup Guide

This guide explains how email verification works in your e-commerce application using Clerk authentication.

## 🚀 How It Works

### 1. User Registration Flow
1. User signs up with email and password at `/register`
2. Clerk automatically sends a verification code to the user's email
3. User is redirected to `/register/verify-email-address`
4. User enters the verification code
5. Upon successful verification, user is redirected to the home page

### 2. Verification Process
- **Automatic Code Sending**: Clerk handles sending verification codes automatically
- **Code Input**: Users enter the 6-digit code in the verification page
- **Resend Functionality**: Users can request a new code if needed (with 60-second cooldown)
- **Error Handling**: Proper error messages for expired/invalid codes

## 🔧 Clerk Configuration

### Required Webhook Events
Make sure these webhook events are enabled in your Clerk dashboard:

1. **`email_address.verified`** - Triggered when a user verifies their email
2. **`email_address.created`** - Triggered when a new email is added to a user
3. **`user.created`** - Triggered when a new user signs up
4. **`user.updated`** - Triggered when user data is updated

### Webhook URL
Set your webhook endpoint in Clerk dashboard:
```
https://your-domain.com/api/clerk/webhook
```

### Environment Variables
Ensure these are set in your `.env` file:
```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_key_here
CLERK_SECRET_KEY=sk_test_your_secret_key_here
```

## 📱 Frontend Components

### VerifyEmail Page (`/register/verify-email-address`)
- **Location**: `frontend/src/pages/VerifyEmail.tsx`
- **Features**:
  - Verification code input
  - Resend code functionality
  - Error handling and user feedback
  - Responsive design with proper styling

### Routing Configuration
- **Route**: `/register/verify-email-address`
- **Component**: `VerifyEmail`
- **Access**: Public (no authentication required)

## 🔒 Backend Webhooks

### Webhook Endpoint
- **URL**: `/api/clerk/webhook`
- **File**: `backend/src/routes/clerkWebhookRoutes.ts`

### Handled Events
1. **`email_address.verified`**: Updates user's email verification status
2. **`email_address.created`**: Tracks new email addresses
3. **`user.created`**: Syncs new user data
4. **`user.updated`**: Updates existing user data

### Database Updates
- Email verification status is automatically updated in your database
- User records are synced with Clerk data
- Verification status is tracked for security purposes

## 🎨 UI/UX Features

### Visual Design
- Clean, modern interface matching your app's theme
- Proper loading states and animations
- Responsive design for all screen sizes
- Accessible form elements with proper labels

### User Experience
- Clear instructions and feedback
- Helpful error messages
- Resend functionality with cooldown timer
- Easy navigation back to signup

## 🚨 Troubleshooting

### Common Issues

1. **Verification code not received**
   - Check spam/junk folder
   - Verify email address is correct
   - Wait a few minutes for delivery
   - Use resend functionality if needed

2. **Webhook not working**
   - Verify webhook URL is correct in Clerk dashboard
   - Check webhook events are enabled
   - Monitor backend logs for errors
   - Ensure webhook endpoint is accessible

3. **Verification fails**
   - Check if code has expired
   - Ensure code is entered correctly
   - Verify user account status in Clerk

### Debug Mode
Enable Clerk debug mode in your `.env`:
```bash
REACT_APP_CLERK_DEBUG=true
```

## 🔒 Security Considerations

### Webhook Verification
- Webhook signature verification is currently disabled for local testing
- **Enable signature verification in production** by uncommenting the verification code
- Use environment variables for webhook secrets

### Rate Limiting
- Resend functionality has a 60-second cooldown
- Consider implementing additional rate limiting for production

### Data Privacy
- Only necessary user data is stored
- Email verification status is tracked for security
- User data is synced securely with Clerk

## 🚀 Production Deployment

### Checklist
- [ ] Enable webhook signature verification
- [ ] Set production Clerk keys
- [ ] Configure production webhook URL
- [ ] Test verification flow in production
- [ ] Monitor webhook delivery and processing
- [ ] Set up error monitoring and logging

### Monitoring
- Monitor webhook delivery success rates
- Track email verification completion rates
- Log and alert on verification failures
- Monitor user signup completion rates

## 📚 Additional Resources

- [Clerk Email Verification Documentation](https://clerk.com/docs/authentication/email-verification)
- [Clerk Webhooks Guide](https://clerk.com/docs/webhooks)
- [React Integration Best Practices](https://clerk.com/docs/quickstarts/get-started-with-react)

---

**Need Help?** Check the [Clerk Community](https://community.clerk.com/) or [contact support](https://clerk.com/support).
