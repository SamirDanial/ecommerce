import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding shipping rates...');

  try {
    // Clear existing shipping rates
    await prisma.shippingRate.deleteMany();
    console.log('🗑️ Cleared existing shipping rates');

    // Create sample shipping rates
    const shippingRates = [
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: 'CA',
        stateName: 'California',
        shippingCost: 5.99, // $5.99
        deliveryDays: 3,
        isActive: true
      },
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: 'NY',
        stateName: 'New York',
        shippingCost: 7.99, // $7.99
        deliveryDays: 4,
        isActive: true
      },
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: null,
        stateName: null,
        shippingCost: 12.99, // $12.99
        deliveryDays: 5,
        isActive: true
      },
      {
        countryCode: 'GB',
        countryName: 'United Kingdom',
        stateCode: null,
        stateName: null,
        shippingCost: 15.99, // $15.99
        deliveryDays: 7,
        isActive: true
      },
      {
        countryCode: 'CA',
        countryName: 'Canada',
        stateCode: null,
        stateName: null,
        shippingCost: 14.99, // $14.99
        deliveryDays: 6,
        isActive: true
      }
    ];

    for (const shippingRate of shippingRates) {
      await prisma.shippingRate.create({
        data: shippingRate
      });
      console.log(`✅ Created shipping rate: ${shippingRate.countryName} (${shippingRate.countryCode}) - $${shippingRate.shippingCost}`);
    }

    console.log('🎉 Shipping rates seeded successfully!');
    console.log(`📊 Total shipping rates created: ${shippingRates.length}`);

  } catch (error) {
    console.error('❌ Error seeding shipping rates:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
