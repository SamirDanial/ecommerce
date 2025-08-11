#!/bin/bash

echo "🚀 Starting E-commerce Backend with Clerk Integration"
echo "=================================================="

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env file with your configuration first."
    echo "See SETUP_COMPLETE.md for details."
    exit 1
fi

# Check if DATABASE_URL is configured
if ! grep -q "DATABASE_URL=" .env || grep -q "username:password" .env; then
    echo "❌ DATABASE_URL not properly configured in .env file!"
    echo "Please update with your actual database credentials."
    exit 1
fi

# Check if Clerk configuration is set
if ! grep -q "CLERK_ISSUER_URL=" .env || grep -q "clerk.your-domain.com" .env; then
    echo "❌ Clerk configuration not properly set in .env file!"
    echo "Please update with your actual Clerk configuration."
    exit 1
fi

echo "✅ Environment configuration looks good!"

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push database schema
echo "🗄️  Pushing database schema..."
npx prisma db push

# Start the server
echo "🚀 Starting development server..."
npm run dev

