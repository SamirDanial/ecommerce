import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding delivery scope configuration...');

  try {
    // Create default delivery scope
    const deliveryScope = await prisma.deliveryScope.upsert({
      where: { businessId: 'default-business' },
      update: {
        primaryCurrency: 'USD'
      },
      create: {
        businessId: 'default-business',
        businessName: 'My T-Shirt Business',
        hasInternationalDelivery: false,
        primaryCountryCode: 'US',
        primaryCountryName: 'United States',
        primaryCurrency: 'USD',
        isActive: true
      }
    });

    console.log('✅ Delivery scope created:', deliveryScope);

    // Create some sample local shipping rates for US states
    const sampleShippingRates = [
      {
        businessId: 'default-business',
        cityName: 'New York',
        stateCode: 'NY',
        stateName: 'New York',
        shippingCost: 5.99,
        deliveryDays: 2
      },
      {
        businessId: 'default-business',
        cityName: 'Los Angeles',
        stateCode: 'CA',
        stateName: 'California',
        shippingCost: 6.99,
        deliveryDays: 3
      },
      {
        businessId: 'default-business',
        cityName: 'Chicago',
        stateCode: 'IL',
        stateName: 'Illinois',
        shippingCost: 5.49,
        deliveryDays: 2
      }
    ];

    for (const rate of sampleShippingRates) {
      await prisma.localShippingRate.create({
        data: rate
      });
    }

    console.log('✅ Sample local shipping rates created');

    // Create some sample local tax rates for US states
    const sampleTaxRates = [
      {
        businessId: 'default-business',
        stateCode: 'NY',
        stateName: 'New York',
        taxRate: 8.875,
        taxName: 'Sales Tax'
      },
      {
        businessId: 'default-business',
        stateCode: 'CA',
        stateName: 'California',
        taxRate: 7.25,
        taxName: 'Sales Tax'
      },
      {
        businessId: 'default-business',
        stateCode: 'IL',
        stateName: 'Illinois',
        taxRate: 6.25,
        taxName: 'Sales Tax'
      }
    ];

    for (const rate of sampleTaxRates) {
      await prisma.localTaxRate.create({
        data: rate
      });
    }

    console.log('✅ Sample local tax rates created');

    console.log('🎉 Delivery scope seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding delivery scope:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
