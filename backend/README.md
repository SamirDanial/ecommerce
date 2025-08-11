# E-commerce Backend

A comprehensive Node.js backend for the e-commerce application with Clerk authentication integration.

## Features

- **Authentication & Authorization**: JWT-based authentication with Clerk integration
- **User Management**: Complete user profiles, preferences, and session management
- **Database**: PostgreSQL with Prisma ORM
- **API**: RESTful API with comprehensive endpoints
- **Security**: Role-based access control and email verification

## Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- Clerk account and application

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd e-commerce/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

4. **Set up database**
   ```bash
   # Update DATABASE_URL in .env
   npx prisma db push
   npx prisma generate
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

## Environment Variables

### Required Variables

```env
# Clerk Configuration
CLERK_ISSUER_URL=https://clerk.your-domain.com
CLERK_AUDIENCE=your-app
CLERK_SECRET_KEY=your_clerk_secret_key_here

# Database
DATABASE_URL="postgresql://username:password@localhost:5434/ecommerce"

# JWT
JWT_SECRET=your_jwt_secret_here

# Server
PORT=5000
NODE_ENV=development
```

### Clerk Setup

1. **Create a Clerk application** at [clerk.com](https://clerk.com)
2. **Get your Issuer URL** from the Clerk dashboard
3. **Set up JWT templates** for authentication
4. **Configure webhooks** for user synchronization

## Database Schema

The application uses the following main models:

- **User**: Core user information and authentication
- **UserProfile**: Extended user profile data
- **UserPreferences**: User preferences and settings
- **Address**: User addresses (shipping/billing)
- **PaymentMethod**: User payment methods
- **Order**: User orders and order items
- **Product**: Product catalog
- **Category**: Product categories

## API Endpoints

### Authentication
- `POST /api/clerk/webhook` - Clerk webhook handler

### User Profile
- `GET /api/profile` - Get complete user profile
- `PUT /api/profile/profile` - Update user profile
- `PUT /api/profile/preferences` - Update user preferences
- `GET /api/profile/addresses` - Get user addresses
- `POST /api/profile/addresses` - Add new address
- `PUT /api/profile/addresses/:id` - Update address
- `DELETE /api/profile/addresses/:id` - Delete address
- `GET /api/profile/payment-methods` - Get payment methods
- `POST /api/profile/payment-methods` - Add payment method
- `PUT /api/profile/payment-methods/:id` - Update payment method
- `DELETE /api/profile/payment-methods/:id` - Delete payment method
- `GET /api/profile/sessions` - Get active sessions
- `DELETE /api/profile/sessions/:id` - Revoke session
- `PUT /api/profile/change-password` - Change password
- `GET /api/profile/orders` - Get order history
- `GET /api/profile/orders/:id` - Get specific order

### Products & Categories
- `GET /api/products` - Get products
- `GET /api/categories` - Get categories
- `GET /api/search` - Search products

## Authentication Flow

1. **User signs in** through Clerk frontend
2. **Clerk sends JWT token** to frontend
3. **Frontend includes token** in Authorization header
4. **Backend verifies token** using Clerk's public keys
5. **User is authenticated** and can access protected routes

## Webhook Integration

The backend automatically syncs user data with Clerk through webhooks:

- `user.created` - Creates new user in database
- `user.updated` - Updates existing user
- `user.deleted` - Marks user as inactive
- `session.created` - Tracks user sessions
- `session.revoked` - Revokes user sessions

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Migrations
```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

### Prisma Studio
```bash
npx prisma studio
```

## Production Deployment

1. **Set production environment variables**
2. **Use production database**
3. **Enable HTTPS**
4. **Set up proper logging**
5. **Configure monitoring**

## Security Considerations

- All profile routes require authentication
- JWT tokens are verified with Clerk's public keys
- Role-based access control implemented
- Email verification required for sensitive operations
- Session management and revocation

## Troubleshooting

### Common Issues

1. **Database connection errors**
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify database exists

2. **Clerk authentication errors**
   - Verify CLERK_ISSUER_URL
   - Check JWT token format
   - Ensure webhook endpoints are accessible

3. **Prisma errors**
   - Run `npx prisma generate`
   - Check database schema
   - Verify migrations are up to date

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

