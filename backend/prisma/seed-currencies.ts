import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const currencies = [
  {
    code: 'USD',
    name: 'US Dollar',
    symbol: '$',
    rate: 1.000000, // Base currency
    isActive: true,
    isDefault: true,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'EUR',
    name: 'Euro',
    symbol: '€',
    rate: 0.920000, // 1 USD = 0.92 EUR
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'GBP',
    name: 'British Pound',
    symbol: '£',
    rate: 0.790000, // 1 USD = 0.79 GBP
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'JPY',
    name: 'Japanese Yen',
    symbol: '¥',
    rate: 150.000000, // 1 USD = 150 JPY
    isActive: true,
    isDefault: false,
    decimals: 0,
    position: 'before'
  },
  {
    code: 'CNY',
    name: 'Chinese Yuan',
    symbol: '¥',
    rate: 7.200000, // 1 USD = 7.2 CNY
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'CAD',
    name: 'Canadian Dollar',
    symbol: 'C$',
    rate: 1.350000, // 1 USD = 1.35 CAD
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'AUD',
    name: 'Australian Dollar',
    symbol: 'A$',
    rate: 1.520000, // 1 USD = 1.52 AUD
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  },
  {
    code: 'PKR',
    name: 'Pakistani Rupee',
    symbol: '₨',
    rate: 280.000000, // 1 USD = 280 PKR
    isActive: true,
    isDefault: false,
    decimals: 2,
    position: 'before'
  }
];

async function main() {
  console.log('💰 Starting currencies database seeding...');

  // Clear existing currency data
  await prisma.currencyConfig.deleteMany();

  // Create currencies
  const createdCurrencies = await Promise.all(
    currencies.map((currency) =>
      prisma.currencyConfig.create({
        data: currency
      })
    )
  );

  console.log(`✅ Created ${createdCurrencies.length} currencies`);
  
  // Log currency details
  console.log('\n📊 Currencies created:');
  createdCurrencies.forEach(currency => {
    const defaultMark = currency.isDefault ? ' (DEFAULT)' : '';
    console.log(`   ${currency.symbol} ${currency.code} - ${currency.name}${defaultMark}`);
    console.log(`      Rate: 1 USD = ${currency.rate} ${currency.code}`);
    console.log(`      Decimals: ${currency.decimals}, Position: ${currency.position}`);
  });

  // Show exchange rate examples
  console.log('\n💱 Exchange Rate Examples:');
  console.log('   1 USD = 0.92 EUR');
  console.log('   1 USD = 0.79 GBP');
  console.log('   1 USD = 150 JPY');
  console.log('   1 USD = 7.2 CNY');
  console.log('   1 USD = 1.35 CAD');
  console.log('   1 USD = 1.52 AUD');
  console.log('   1 USD = 280 PKR');

  console.log(`\n🌍 Total currencies: ${createdCurrencies.length}`);
  console.log('💡 USD is set as the base currency (rate = 1.000000)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding currencies:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
