#!/bin/bash

echo "🚀 Starting database reset and seeding process..."

# Navigate to backend directory
cd "$(dirname "$0")"

echo "📦 Installing dependencies..."
npm install

echo "🗄️  Resetting database..."
npx prisma migrate reset --force

echo "🔄 Creating new migration..."
npx prisma migrate dev --name add_color_to_images

echo "🌱 Seeding database with realistic products..."
npx ts-node prisma/seed-realistic-products.ts

echo "✅ Database reset and seeding completed!"
echo "🚀 You can now start the backend server with: npm start"


