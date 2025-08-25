# Countries Database Seeding

This document explains how to seed the countries table with all 195 countries in the world.

## Overview

The `seed-countries.ts` file populates the `CountryConfig` table with comprehensive country data including:
- ISO country codes (2-letter)
- Full country names
- Flag emojis
- International phone codes
- Delivery availability
- Shipping costs
- Delivery times

## Running the Seed

### Option 1: Using npm script
```bash
npm run seed:countries
```

### Option 2: Direct execution
```bash
npx ts-node prisma/seed-countries.ts
```

### Option 3: Full database reset and seed
```bash
./reset-and-seed.sh
```

## What Gets Created

The seed file creates **195 countries** with the following data structure:

```typescript
{
  code: 'US',                    // ISO 2-letter code
  name: 'United States',         // Full country name
  flagEmoji: '🇺🇸',             // Country flag emoji
  phoneCode: '+1',               // International calling code
  hasDelivery: true,             // Whether shipping is available
  deliveryCost: 20.00,           // Shipping cost (USD)
  deliveryDays: 5,               // Estimated delivery time
  isActive: true,                // Country is active
  isDefault: true,               // US is set as default
  sortOrder: 1                   // Display order
}
```

## Delivery Coverage

- **Countries with delivery**: ~140 countries
- **Countries without delivery**: ~55 countries
- **Total countries**: 195

### Countries without delivery include:
- Afghanistan, Cuba, North Korea
- Somalia, some Pacific island nations
- Some smaller African countries

## Database Schema

The countries are stored in the `CountryConfig` table:

```sql
CREATE TABLE country_configs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  flagEmoji VARCHAR(10) NOT NULL,
  phoneCode VARCHAR(10),
  isActive BOOLEAN DEFAULT true,
  isDefault BOOLEAN DEFAULT false,
  hasDelivery BOOLEAN DEFAULT true,
  deliveryCost DECIMAL(10,2),
  deliveryDays INTEGER,
  sortOrder INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

Once seeded, countries are accessible via:

- `GET /api/countries` - Get all active countries
- `GET /api/countries/:code` - Get specific country by ISO code

## Frontend Integration

The frontend currently has a hardcoded country selector in `AddressForm.tsx` with only 9 countries. This can be enhanced to use the full country list from the API.

## Troubleshooting

If you encounter issues:

1. Ensure Prisma is properly configured
2. Check that the database is running
3. Verify the schema matches the seed data structure
4. Run `npx prisma generate` if needed

## Example Output

When running the seed, you should see:

```
🌍 Starting countries database seeding...
✅ Created 195 countries
🚚 Countries with delivery: 140
❌ Countries without delivery: 55
🌍 Total countries: 195
```
