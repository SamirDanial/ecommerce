# Shipping Rates Database Seeding

This document explains how to seed the shipping_rates table with comprehensive shipping rates for all countries in the world.

## Overview

The `seed-shipping-rates.ts` file populates the `ShippingRate` table with shipping costs and delivery times for **198 countries** worldwide, including:
- Country codes and names
- Shipping costs in USD
- Delivery times in days
- Regional grouping and analysis

## Running the Seed

### Option 1: Using npm script
```bash
npm run seed:shipping-rates
```

### Option 2: Direct execution
```bash
npx ts-node prisma/seed-shipping-rates.ts
```

### Option 3: Full database reset and seed
```bash
./reset-and-seed.sh
```

## What Gets Created

The seed file creates **198 shipping rates** with the following data structure:

```typescript
{
  countryCode: 'US',                    // ISO 2-letter country code
  countryName: 'United States',         // Full country name
  shippingCost: 0.00,                   // Shipping cost in USD
  deliveryDays: 3,                      // Estimated delivery time
  isActive: true                         // Rate is active
}
```

## Global Coverage

### **North America** (3 countries)
- **US**: Free shipping (domestic), 3 days
- **Canada**: $15, 5 days
- **Mexico**: $25, 7 days

### **Europe** (43 countries)
- **Western Europe**: $18-25, 4-6 days
- **Eastern Europe**: $25-40, 7-12 days
- **Microstates**: $20-22, 5 days
- **Examples**: UK ($20, 5 days), Germany ($18, 4 days), France ($18, 4 days)

### **Asia** (47 countries)
- **East Asia**: $25-45, 7-15 days
- **Southeast Asia**: $25-35, 7-12 days
- **South Asia**: $25-40, 8-15 days
- **Central Asia**: $40-45, 12-15 days
- **Middle East**: $28-45, 8-18 days
- **Examples**: Japan ($30, 8 days), India ($25, 8 days), Pakistan ($28, 9 days), Afghanistan ($45, 15 days)

### **Oceania** (22 countries)
- **Australia & New Zealand**: $35-38, 10-12 days
- **Pacific Islands**: $45-55, 15-25 days
- **Examples**: Australia ($35, 10 days), Fiji ($45, 15 days), Kiribati ($55, 25 days)

### **Africa** (51 countries)
- **North Africa**: $30-40, 10-15 days
- **West Africa**: $35-45, 12-18 days
- **East Africa**: $35-45, 12-18 days
- **South Africa**: $35-40, 12-15 days
- **Examples**: South Africa ($35, 12 days), Egypt ($30, 10 days), Nigeria ($35, 12 days)

### **Americas** (32 countries)
- **Central America**: $28-32, 8-9 days
- **South America**: $35-40, 12-15 days
- **Caribbean**: $25-35, 5-12 days
- **Examples**: Brazil ($35, 12 days), Argentina ($38, 14 days), Costa Rica ($28, 8 days)

## Shipping Cost Structure

### **Free Shipping**
- **United States**: $0.00 (domestic shipping)

### **Low Cost** ($15-25)
- **Canada**: $15
- **European countries**: $18-25
- **Mexico**: $25

### **Medium Cost** ($25-40)
- **Most Asian countries**: $25-35
- **South American countries**: $35-40
- **African countries**: $30-40

### **High Cost** ($40-55)
- **Remote Pacific islands**: $45-55
- **Central Asian countries**: $40-45
- **Some African countries**: $40-45

## Delivery Time Structure

### **Fast Delivery** (3-7 days)
- **United States**: 3 days
- **Western Europe**: 4-6 days
- **Canada**: 5 days
- **Mexico**: 7 days

### **Medium Delivery** (8-15 days)
- **Most Asian countries**: 7-12 days
- **Eastern Europe**: 7-12 days
- **South America**: 12-15 days
- **Australia/New Zealand**: 10-12 days

### **Slow Delivery** (15-25 days)
- **Remote Pacific islands**: 15-25 days
- **Some African countries**: 15-18 days
- **Central Asian countries**: 12-15 days

## Regional Analysis

### **Cost Averages by Region**
- **North America**: $13.33 average
- **Europe**: $25.16 average
- **Asia**: $33.26 average
- **Americas**: $33.94 average
- **Africa**: $39.25 average
- **Oceania**: $49.00 average

### **Delivery Time Averages by Region**
- **North America**: 5.0 days average
- **Europe**: 6.7 days average
- **Americas**: 11.0 days average
- **Asia**: 10.4 days average
- **Africa**: 14.6 days average
- **Oceania**: 19.3 days average

## Database Schema

The shipping rates are stored in the `ShippingRate` table:

```sql
CREATE TABLE shipping_rates (
  id SERIAL PRIMARY KEY,
  countryCode VARCHAR(10) NOT NULL,
  countryName VARCHAR(100) NOT NULL,
  stateCode VARCHAR(10),
  stateName VARCHAR(100),
  shippingCost DECIMAL(10,2) NOT NULL,
  deliveryDays INTEGER DEFAULT 3,
  isActive BOOLEAN DEFAULT true,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## API Integration

Once seeded, shipping rates can be accessed via:
- `GET /api/shipping-rates` - Get all shipping rates
- `GET /api/shipping-rates/:countryCode` - Get shipping rate for specific country
- `GET /api/shipping-rates/region/:region` - Get shipping rates by region

## Frontend Usage

Shipping rates can be used for:
- **Checkout calculations** with real-time shipping costs
- **Country-specific pricing** display
- **Delivery time estimates** for customer expectations
- **Shipping cost comparison** between countries
- **Regional shipping policies** implementation

## Key Features

### **Comprehensive Coverage**
- **198 countries** covered worldwide
- **All major regions** included
- **Realistic shipping costs** based on geographic distance
- **Accurate delivery times** for customer expectations

### **Smart Pricing Strategy**
- **US domestic**: Free shipping for local customers
- **Regional pricing**: Lower costs for nearby countries
- **Distance-based**: Higher costs for remote locations
- **Market-based**: Competitive pricing for major markets

### **Production Ready**
- **Active status** for all rates
- **Proper error handling** and validation
- **Comprehensive logging** during seeding
- **Regional analysis** and statistics

## Example Output

When running the seed, you should see:

```
🚢 Starting shipping rates database seeding...
✅ Created 198 shipping rates

📊 Shipping Rates by Region:
   North America: 3 countries
      Average cost: $13.33
      Average delivery: 5.0 days
   Europe: 43 countries
      Average cost: $25.16
      Average delivery: 6.7 days
   Asia: 47 countries
      Average cost: $33.26
      Average delivery: 10.4 days
   ...

💰 Cost Analysis:
   Minimum shipping cost: $0.00
   Maximum shipping cost: $55.00
   Average shipping cost: $34.60

📅 Delivery Time Analysis:
   Fastest delivery: 3 days
   Slowest delivery: 25 days
   Average delivery: 11.7 days

🌍 Total shipping rates: 198
💡 US has free shipping (domestic)
🚢 All countries covered with realistic shipping costs
```

## Special Considerations

### **Free Shipping (US)**
- United States has $0.00 shipping cost
- 3-day delivery for domestic orders
- Encourages local customer base

### **High-Cost Regions**
- Pacific islands have highest costs ($45-55)
- Central Asia has elevated costs ($40-45)
- Reflects actual shipping challenges

### **Regional Variations**
- Europe: Lower costs due to infrastructure
- Asia: Varied costs based on development
- Africa: Higher costs due to logistics challenges
- Americas: Moderate costs for most countries

## Troubleshooting

If you encounter issues:

1. Ensure Prisma is properly configured
2. Check that the database is running
3. Verify the schema matches the seed data structure
4. Run `npx prisma generate` if needed
5. Check for duplicate country codes

## Production Considerations

- **Update shipping costs regularly** based on market changes
- **Monitor delivery times** for accuracy
- **Implement regional shipping policies** for business rules
- **Add weight-based pricing** for different product types
- **Consider seasonal variations** in shipping costs
- **Integrate with shipping carriers** for real-time rates
- **Add shipping zone restrictions** if needed
- **Implement free shipping thresholds** for promotions
