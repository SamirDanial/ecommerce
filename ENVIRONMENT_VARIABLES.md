# 🌟 Environment Variables Setup Guide

This document contains all the environment variables needed to run the e-commerce application with Stripe integration, multi-currency support, and multi-language features.

## 📁 File Locations

Create `.env` files in these directories:
- `backend/.env` - Backend environment variables
- `frontend/.env` - Frontend environment variables

## 🔑 Backend Environment Variables (`backend/.env`)

```bash
# ========================================
# DATABASE CONFIGURATION
# ========================================
DATABASE_URL="postgresql://username:password@localhost:5432/ecommerce_db"

# ========================================
# SERVER CONFIGURATION
# ========================================
PORT=5000
NODE_ENV=development

# ========================================
# CLERK AUTHENTICATION
# ========================================
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key_here
CLERK_WEBHOOK_SECRET=whsec_your_clerk_webhook_secret_here

# ========================================
# STRIPE PAYMENT GATEWAY
# ========================================
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret_here

# ========================================
# SHIPPING & TAX CONFIGURATION
# ========================================
DEFAULT_TAX_RATE=0.085
STANDARD_SHIPPING_COST=5.99
EXPRESS_SHIPPING_COST=12.99
OVERNIGHT_SHIPPING_COST=24.99

# ========================================
# SECURITY & ENCRYPTION
# ========================================
JWT_SECRET=your_jwt_secret_key_here
SESSION_SECRET=your_session_secret_here

# ========================================
# CORS CONFIGURATION
# ========================================
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

## 🌐 Frontend Environment Variables (`frontend/.env`)

```bash
# ========================================
# CLERK AUTHENTICATION
# ========================================
REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key_here

# ========================================
# STRIPE PAYMENT GATEWAY
# ========================================
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# ========================================
# FEATURE FLAGS
# ========================================
REACT_APP_ENABLE_MULTI_CURRENCY=true
REACT_APP_ENABLE_MULTI_LANGUAGE=true
REACT_APP_ENABLE_STRIPE_PAYMENTS=true
REACT_APP_ENABLE_CASH_ON_DELIVERY=true
REACT_APP_ENABLE_DISCOUNT_CODES=true
REACT_APP_ENABLE_ORDER_TRACKING=true
```

## 🚀 Getting Started

### 1. Stripe Setup
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Create a new account or sign in
3. Get your API keys from the Developers section
4. Set up webhooks for payment events

### 2. Clerk Setup
1. Go to [Clerk Dashboard](https://dashboard.clerk.com/)
2. Create a new application
3. Get your publishable and secret keys
4. Configure authentication methods

### 3. Database Setup
1. Install PostgreSQL
2. Create a new database
3. Update the DATABASE_URL with your credentials

## 🔒 Security Notes

- **Never commit `.env` files to version control**
- Use different keys for development, staging, and production
- Regularly rotate your API keys and secrets
- Test all integrations in development before deploying

## 📋 Required Variables

### For Basic Functionality:
- `DATABASE_URL` - Database connection string
- `STRIPE_SECRET_KEY` - Stripe secret key for backend
- `REACT_APP_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key for frontend
- `REACT_APP_CLERK_PUBLISHABLE_KEY` - Clerk publishable key for frontend

### For Production:
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signature verification
- `CLERK_WEBHOOK_SECRET` - Clerk webhook signature verification
- `NODE_ENV=production` - Production environment flag

## 🧪 Testing

1. Use Stripe test keys for development
2. Test payment flows with test card numbers
3. Verify webhook endpoints are working
4. Test multi-currency and multi-language features

## 🆘 Troubleshooting

### Common Issues:
1. **Stripe errors**: Check API keys and webhook configuration
2. **Database connection**: Verify DATABASE_URL format
3. **CORS errors**: Check ALLOWED_ORIGINS configuration
4. **Authentication issues**: Verify Clerk configuration

### Support:
- Check the console for error messages
- Verify all environment variables are set
- Ensure services (Stripe, Clerk) are properly configured
