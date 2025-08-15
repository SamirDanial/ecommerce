import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import userRoutes from './routes/userRoutes';
import profileRoutes from './routes/profileRoutes';
import clerkWebhookRoutes from './routes/clerkWebhookRoutes';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import searchRoutes from './routes/searchRoutes';
import wishlistRoutes from './routes/wishlistRoutes';
import contactRoutes from './routes/contactRoutes';
import stripeRoutes from './routes/stripeRoutes';
import discountRoutes from './routes/discountRoutes';
import trackingRoutes from './routes/trackingRoutes';
import adminRoutes from './routes/adminRoutes';
import reviewRoutes from './routes/reviewRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware - exclude Stripe webhook from JSON parsing
app.use((req, res, next) => {
  if (req.path === '/api/stripe/webhook') {
    // Skip JSON parsing for Stripe webhook - it needs raw body
    next();
  } else {
    // Parse JSON for all other routes
    express.json()(req, res, next);
  }
});

app.use(express.urlencoded({ extended: true }));

// Log all requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Test database connection
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('Connected to PostgreSQL database with Prisma');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}

// Initialize database connection (non-blocking)
testDatabaseConnection().then(success => {
  if (!success) {
    console.warn('Warning: Database connection failed, but server will continue');
  }
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/clerk', clerkWebhookRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stripe', stripeRoutes);
app.use('/api/discounts', discountRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'E-commerce API is running!' });
});

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
