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

echo "🌍 Seeding countries database..."
npx ts-node prisma/seed-countries.ts

echo "💰 Seeding currencies database..."
npx ts-node prisma/seed-currencies.ts

echo "🌍 Seeding languages database..."
npx ts-node prisma/seed-languages.ts

echo "🚢 Seeding shipping rates database..."
npx ts-node prisma/seed-shipping-rates.ts

echo "💱 Seeding exchange rates database..."
npx ts-node prisma/seed-exchange-rates.ts

echo "🌱 Seeding database with realistic products..."
npx ts-node prisma/seed-realistic-products.ts

echo "✅ Database reset and seeding completed!"
echo "🚀 You can now start the backend server with: npm start"


