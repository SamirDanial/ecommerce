import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tax rates...');

  try {
    // Clear existing tax rates
    await prisma.taxRate.deleteMany();
    console.log('🗑️ Cleared existing tax rates');

    // Create sample tax rates
    const taxRates = [
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: 'CA',
        stateName: 'California',
        taxRate: 8.5, // 8.5%
        taxName: 'Standard Sales Tax',
        isActive: true
      },
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: null,
        stateName: null,
        taxRate: 5.0, // 5%
        taxName: 'Federal Tax',
        isActive: true
      },
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: 'NY',
        stateName: 'New York',
        taxRate: 2.5, // 2.5%
        taxName: 'Local Tax',
        isActive: true
      },
      {
        countryCode: 'US',
        countryName: 'United States',
        stateCode: null,
        stateName: null,
        taxRate: 15.0, // 15%
        taxName: 'Import Duty',
        isActive: true
      },
      {
        countryCode: 'GB',
        countryName: 'United Kingdom',
        stateCode: null,
        stateName: null,
        taxRate: 20.0, // 20%
        taxName: 'VAT',
        isActive: true
      }
    ];

    for (const taxRate of taxRates) {
      await prisma.taxRate.create({
        data: taxRate
      });
      console.log(`✅ Created tax rate: ${taxRate.taxName} (${taxRate.taxRate}%)`);
    }

    console.log('🎉 Tax rates seeded successfully!');
    console.log(`📊 Total tax rates created: ${taxRates.length}`);

  } catch (error) {
    console.error('❌ Error seeding tax rates:', error);
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
