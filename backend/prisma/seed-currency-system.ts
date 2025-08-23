import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding currency system...');

  // 1. Create business config with USD as default base currency
  const businessConfig = await prisma.businessConfig.upsert({
    where: { businessId: 'default-business' },
    update: {},
    create: {
      businessId: 'default-business',
      baseCurrency: 'USD',
      businessName: 'My E-commerce Business',
      isActive: true
    }
  });

  console.log(`✅ Business config created: ${businessConfig.baseCurrency}`);

  // 2. Create exchange rates for USD base
  const currencies = ['USD', 'EUR', 'GBP', 'PKR', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR'];
  
  for (const currency of currencies) {
    if (currency === 'USD') {
      // Base currency rate is always 1
      await prisma.exchangeRate.upsert({
        where: { 
          fromCurrency_toCurrency: {
            fromCurrency: 'USD',
            toCurrency: 'USD'
          }
        },
        update: {},
        create: {
          fromCurrency: 'USD',
          toCurrency: 'USD',
          rate: 1.0,
          isBase: true,
          isActive: true,
          source: 'System'
        }
      });
    } else {
      // Create placeholder rates (these should be updated with real rates)
      const placeholderRate = getPlaceholderRate('USD', currency);
      
      await prisma.exchangeRate.upsert({
        where: { 
          fromCurrency_toCurrency: {
            fromCurrency: 'USD',
            toCurrency: currency
          }
        },
        update: {},
        create: {
          fromCurrency: 'USD',
          toCurrency: currency,
          rate: placeholderRate,
          isBase: false,
          isActive: true,
          source: 'Placeholder'
        }
      });
    }
  }

  console.log(`✅ Created ${currencies.length} exchange rates`);

  // 3. Display current setup
  const allRates = await prisma.exchangeRate.findMany({
    where: { fromCurrency: 'USD' },
    orderBy: { toCurrency: 'asc' }
  });

  console.log('\n📊 Current Exchange Rates (USD Base):');
  allRates.forEach(rate => {
    console.log(`  ${rate.fromCurrency} → ${rate.toCurrency}: ${rate.rate} (${rate.source})`);
  });

  console.log('\n🎉 Currency system seeding completed!');
  console.log('💡 You can now change the base currency from the admin panel');
}

function getPlaceholderRate(fromCurrency: string, toCurrency: string): number {
  const rates: { [key: string]: { [key: string]: number } } = {
    'USD': {
      'EUR': 0.85,    // 1 USD = 0.85 EUR
      'GBP': 0.75,    // 1 USD = 0.75 GBP
      'PKR': 280,     // 1 USD = 280 PKR
      'CAD': 1.35,    // 1 USD = 1.35 CAD
      'AUD': 1.52,    // 1 USD = 1.52 AUD
      'JPY': 150,     // 1 USD = 150 JPY
      'CHF': 0.90,    // 1 USD = 0.90 CHF
      'CNY': 7.20,    // 1 USD = 7.20 CNY
      'INR': 83       // 1 USD = 83 INR
    }
  };

  return rates[fromCurrency]?.[toCurrency] || 1.0;
}

main()
  .catch((e) => {
    console.error('❌ Error seeding currency system:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
