# Currencies Database Seeding

This document explains how to seed the currencies table with the 7 most important world currencies plus Pakistan's PKR.

## Overview

The `seed-currencies.ts` file populates the `CurrencyConfig` table with major world currencies including:
- Currency codes (3-letter ISO codes)
- Full currency names
- Currency symbols
- Exchange rates (relative to USD)
- Formatting preferences (decimals, position)

## Running the Seed

### Option 1: Using npm script
```bash
npm run seed:currencies
```

### Option 2: Direct execution
```bash
npx ts-node prisma/seed-currencies.ts
```

### Option 3: Full database reset and seed
```bash
./reset-and-seed.sh
```

## What Gets Created

The seed file creates **8 currencies** with the following data structure:

```typescript
{
  code: 'USD',                    // ISO 3-letter code
  name: 'US Dollar',              // Full currency name
  symbol: '$',                    // Currency symbol
  rate: 1.000000,                 // Exchange rate (USD is base)
  isActive: true,                 // Currency is active
  isDefault: true,                // USD is set as default
  decimals: 2,                    // Decimal places to show
  position: 'before'              // Symbol position (before/after)
}
```

## Currencies Included

### Major World Currencies
1. **USD** - US Dollar (Base currency, rate: 1.000000)
2. **EUR** - Euro (Rate: 0.920000)
3. **GBP** - British Pound (Rate: 0.790000)
4. **JPY** - Japanese Yen (Rate: 150.000000)
5. **CNY** - Chinese Yuan (Rate: 7.200000)
6. **CAD** - Canadian Dollar (Rate: 1.350000)
7. **AUD** - Australian Dollar (Rate: 1.520000)

### Regional Currency
8. **PKR** - Pakistani Rupee (Rate: 280.000000)

## Exchange Rate System

- **USD is the base currency** with rate 1.000000
- All other rates are relative to USD
- Rates are approximate and should be updated regularly in production
- Example: 1 USD = 0.92 EUR, 1 USD = 280 PKR

## Currency Formatting

### Decimal Places
- **USD, EUR, GBP, CNY, CAD, AUD, PKR**: 2 decimal places
- **JPY**: 0 decimal places (whole numbers only)

### Symbol Position
- All currencies use **"before"** positioning
- Examples: $100, €100, £100, ¥100, ₨100

## Database Schema

The currencies are stored in the `CurrencyConfig` table:

```sql
CREATE TABLE currency_configs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  symbol VARCHAR(10) NOT NULL,
  rate DECIMAL(20,6) DEFAULT 1,
  isActive BOOLEAN DEFAULT true,
  isDefault BOOLEAN DEFAULT false,
  decimals INTEGER DEFAULT 2,
  position VARCHAR(10) DEFAULT 'before',
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## API Integration

Once seeded, currencies can be accessed via the currency routes:
- `GET /api/currencies` - Get all active currencies
- `GET /api/currencies/:code` - Get specific currency by code

## Frontend Usage

Currencies can be used for:
- Price display in multiple currencies
- Currency conversion
- Multi-currency checkout
- Regional pricing strategies

## Updating Exchange Rates

In production, exchange rates should be updated regularly:
1. Use external API (e.g., Fixer.io, ExchangeRate-API)
2. Update the `rate` field in the database
3. Consider implementing automatic rate updates

## Example Output

When running the seed, you should see:

```
💰 Starting currencies database seeding...
✅ Created 8 currencies

📊 Currencies created:
   $ USD - US Dollar (DEFAULT)
      Rate: 1 USD = 1 USD
      Decimals: 2, Position: before
   € EUR - Euro
      Rate: 1 USD = 0.92 EUR
      Decimals: 2, Position: before
   ...

💱 Exchange Rate Examples:
   1 USD = 0.92 EUR
   1 USD = 0.79 GBP
   1 USD = 150 JPY
   1 USD = 7.2 CNY
   1 USD = 1.35 CAD
   1 USD = 1.52 AUD
   1 USD = 280 PKR

🌍 Total currencies: 8
💡 USD is set as the base currency (rate = 1.000000)
```

## Troubleshooting

If you encounter issues:

1. Ensure Prisma is properly configured
2. Check that the database is running
3. Verify the schema matches the seed data structure
4. Run `npx prisma generate` if needed
5. Check for duplicate currency codes

## Production Considerations

- **Update exchange rates regularly** (daily/weekly)
- **Implement rate caching** for performance
- **Add rate validation** to prevent invalid values
- **Consider timezone-based rate updates**
- **Monitor exchange rate APIs** for reliability
