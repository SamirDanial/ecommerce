# Clerk Authentication Setup Guide

This guide will help you set up Clerk authentication for your e-commerce application.

## 🚀 Quick Start

### 1. Create Clerk Account
1. Go to [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Single Page Application" as your app type

### 2. Get Your API Keys
1. In your Clerk dashboard, go to **API Keys**
2. Copy your **Publishable Key** and **Secret Key**
3. Keep these keys secure and never commit them to version control

### 3. Environment Variables
Create a `.env` file in your `frontend` directory:

```bash
# Clerk Authentication
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
REACT_APP_CLERK_SECRET_KEY=sk_test_your_secret_key_here

# Optional: Custom URLs
REACT_APP_CLERK_SIGN_IN_URL=/login
REACT_APP_CLERK_SIGN_UP_URL=/register
REACT_APP_CLERK_AFTER_SIGN_IN_URL=/
REACT_APP_CLERK_AFTER_SIGN_UP_URL=/
REACT_APP_CLERK_AFTER_SIGN_OUT_URL=/
```

### 4. Social Login Setup

#### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client IDs**
5. Set Application Type to "Web application"
6. Add authorized redirect URIs from your Clerk dashboard
7. Copy the Client ID and Client Secret
8. In Clerk dashboard: **User & Authentication** → **Social Connections** → **Google**
9. Paste your Google OAuth credentials

#### Facebook OAuth
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth settings
5. Copy App ID and App Secret
6. In Clerk dashboard: **User & Authentication** → **Social Connections** → **Facebook**
7. Paste your Facebook OAuth credentials

#### Apple Sign In
1. Go to [Apple Developer](https://developer.apple.com/)
2. Create a new App ID
3. Enable "Sign In with Apple"
4. Create a Services ID
5. Configure domains and redirect URLs
6. In Clerk dashboard: **User & Authentication** → **Social Connections** → **Apple**
7. Paste your Apple Sign In credentials

## 🔧 Configuration

### Clerk Provider
The app is wrapped with `ClerkProvider` in `App.tsx`:

```tsx
<ClerkProvider>
  <ThemeProvider>
    <Router>
      {/* Your app content */}
    </Router>
  </ThemeProvider>
</ClerkProvider>
```

### Protected Routes
Routes that require authentication are wrapped with `ProtectedRoute`:

```tsx
<Route path="/wishlist" element={
  <ProtectedRoute>
    <Wishlist />
  </ProtectedRoute>
} />
```

### Authentication Hook
Use `useClerkAuth()` hook to access authentication state:

```tsx
const { user, isAuthenticated, isLoaded, signOut } = useClerkAuth();
```

## 📱 Features Implemented

### ✅ Authentication
- JWT-based authentication via Clerk
- Social login (Google, Facebook, Apple)
- Email/password authentication
- Secure session management

### ✅ User Management
- User profile with editable details
- Profile picture support
- Email verification
- Password reset flow

### ✅ Security
- Protected routes
- Automatic redirects
- Secure token handling
- Cross-tab session sync

### ✅ UI Components
- Styled login/register forms
- User profile management
- Responsive design
- Theme integration

## 🎨 Customization

### Styling
All Clerk components are styled to match your app's theme using the `appearance` prop:

```tsx
<SignIn 
  appearance={{
    elements: {
      formButtonPrimary: 'bg-primary hover:bg-primary/90 text-primary-foreground',
      // ... more styling options
    }
  }}
/>
```

### Routing
Customize authentication flow URLs in your `.env` file:

```bash
REACT_APP_CLERK_SIGN_IN_URL=/auth/login
REACT_APP_CLERK_SIGN_UP_URL=/auth/register
REACT_APP_CLERK_AFTER_SIGN_IN_URL=/dashboard
```

## 🚨 Troubleshooting

### Common Issues

1. **"Missing Clerk Publishable Key" error**
   - Check your `.env` file exists
   - Verify the key name is correct
   - Restart your development server

2. **Social login not working**
   - Verify OAuth credentials in Clerk dashboard
   - Check redirect URIs match exactly
   - Ensure social providers are enabled

3. **Protected routes redirecting to login**
   - Check if user is properly authenticated
   - Verify Clerk is loaded (`isLoaded` state)
   - Check browser console for errors

### Debug Mode
Enable Clerk debug mode by adding to your `.env`:

```bash
REACT_APP_CLERK_DEBUG=true
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [React Integration Guide](https://clerk.com/docs/quickstarts/get-started-with-react)
- [Social Connections Setup](https://clerk.com/docs/authentication/social-connections)
- [User Profile Management](https://clerk.com/docs/users/user-profile)

## 🔒 Security Notes

- Never commit `.env` files to version control
- Use environment variables for all sensitive data
- Regularly rotate your API keys
- Monitor authentication logs in Clerk dashboard
- Implement rate limiting for production use

## 🚀 Deployment

### Production Environment
1. Update your production environment variables
2. Use production Clerk keys (not test keys)
3. Configure production domains in Clerk dashboard
4. Test authentication flow in production environment

### Environment Variables
Ensure your hosting platform (Vercel, Netlify, etc.) has the required environment variables:

```bash
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_live_your_production_key
```

---

**Need Help?** Check the [Clerk Community](https://community.clerk.com/) or [contact support](https://clerk.com/support).
