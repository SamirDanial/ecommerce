import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Exchange rates relative to USD (base currency)
// Rates are approximate and should be updated regularly in production
const exchangeRates = [
  // USD to major currencies (base currency conversions)
  { fromCurrency: 'USD', toCurrency: 'EUR', rate: 0.92, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'GBP', rate: 0.79, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'JPY', rate: 150.25, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'CNY', rate: 7.23, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'PKR', rate: 278.50, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'CAD', rate: 1.35, isBase: false, source: 'manual' },
  { fromCurrency: 'USD', toCurrency: 'AUD', rate: 1.52, isBase: false, source: 'manual' },

  // Reverse conversions (other currencies to USD)
  { fromCurrency: 'EUR', toCurrency: 'USD', rate: 1.09, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'USD', rate: 1.27, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'USD', rate: 0.0067, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'USD', rate: 0.138, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'USD', rate: 0.0036, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'USD', rate: 0.74, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'USD', rate: 0.66, isBase: false, source: 'manual' },

  // Cross-currency conversions (non-USD pairs)
  // EUR cross-rates
  { fromCurrency: 'EUR', toCurrency: 'GBP', rate: 0.86, isBase: false, source: 'manual' },
  { fromCurrency: 'EUR', toCurrency: 'JPY', rate: 163.32, isBase: false, source: 'manual' },
  { fromCurrency: 'EUR', toCurrency: 'CNY', rate: 7.86, isBase: false, source: 'manual' },
  { fromCurrency: 'EUR', toCurrency: 'PKR', rate: 302.72, isBase: false, source: 'manual' },
  { fromCurrency: 'EUR', toCurrency: 'CAD', rate: 1.47, isBase: false, source: 'manual' },
  { fromCurrency: 'EUR', toCurrency: 'AUD', rate: 1.65, isBase: false, source: 'manual' },

  // GBP cross-rates
  { fromCurrency: 'GBP', toCurrency: 'EUR', rate: 1.16, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'JPY', rate: 190.19, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'CNY', rate: 9.15, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'PKR', rate: 352.53, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'CAD', rate: 1.71, isBase: false, source: 'manual' },
  { fromCurrency: 'GBP', toCurrency: 'AUD', rate: 1.92, isBase: false, source: 'manual' },

  // JPY cross-rates
  { fromCurrency: 'JPY', toCurrency: 'EUR', rate: 0.0061, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'GBP', rate: 0.0053, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'CNY', rate: 0.048, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'PKR', rate: 1.85, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'CAD', rate: 0.009, isBase: false, source: 'manual' },
  { fromCurrency: 'JPY', toCurrency: 'AUD', rate: 0.010, isBase: false, source: 'manual' },

  // CNY cross-rates
  { fromCurrency: 'CNY', toCurrency: 'EUR', rate: 0.127, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'GBP', rate: 0.109, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'JPY', rate: 20.78, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'PKR', rate: 38.52, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'CAD', rate: 0.187, isBase: false, source: 'manual' },
  { fromCurrency: 'CNY', toCurrency: 'AUD', rate: 0.210, isBase: false, source: 'manual' },

  // PKR cross-rates
  { fromCurrency: 'PKR', toCurrency: 'EUR', rate: 0.0033, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'GBP', rate: 0.0028, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'JPY', rate: 0.54, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'CNY', rate: 0.026, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'CAD', rate: 0.0048, isBase: false, source: 'manual' },
  { fromCurrency: 'PKR', toCurrency: 'AUD', rate: 0.0054, isBase: false, source: 'manual' },

  // CAD cross-rates
  { fromCurrency: 'CAD', toCurrency: 'EUR', rate: 0.68, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'GBP', rate: 0.58, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'JPY', rate: 111.30, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'CNY', rate: 5.36, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'PKR', rate: 206.30, isBase: false, source: 'manual' },
  { fromCurrency: 'CAD', toCurrency: 'AUD', rate: 1.13, isBase: false, source: 'manual' },

  // AUD cross-rates
  { fromCurrency: 'AUD', toCurrency: 'EUR', rate: 0.60, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'GBP', rate: 0.52, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'JPY', rate: 98.85, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'CNY', rate: 4.76, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'PKR', rate: 183.22, isBase: false, source: 'manual' },
  { fromCurrency: 'AUD', toCurrency: 'CAD', rate: 0.89, isBase: false, source: 'manual' }
];

async function main() {
  console.log('💱 Starting exchange rates database seeding...');

  // Clear existing exchange rate data
  await prisma.exchangeRate.deleteMany();

  // Create exchange rates
  const createdExchangeRates = await Promise.all(
    exchangeRates.map((rate) =>
      prisma.exchangeRate.create({
        data: {
          ...rate,
          isActive: true,
          lastUpdated: new Date()
        }
      })
    )
  );

  console.log(`✅ Created ${createdExchangeRates.length} exchange rates`);
  
  // Group by currency pairs for better organization
  const usdRates = createdExchangeRates.filter(r => r.fromCurrency === 'USD');
  const crossRates = createdExchangeRates.filter(r => r.fromCurrency !== 'USD' && r.toCurrency !== 'USD');
  const reverseRates = createdExchangeRates.filter(r => r.toCurrency === 'USD');

  console.log('\n📊 Exchange Rates Summary:');
  console.log(`   USD Base Rates: ${usdRates.length} pairs`);
  console.log(`   Cross Currency: ${crossRates.length} pairs`);
  console.log(`   Reverse Rates: ${reverseRates.length} pairs`);
  console.log(`   Total Pairs: ${createdExchangeRates.length}`);

  // Show USD base rates (most important)
  console.log('\n💵 USD Base Rates (1 USD = X):');
  usdRates.forEach(rate => {
    console.log(`   USD → ${rate.toCurrency}: ${rate.rate} ${rate.toCurrency}`);
  });

  // Show reverse rates (X = 1 USD)
  console.log('\n🔄 Reverse Rates (X = 1 USD):');
  reverseRates.forEach(rate => {
    console.log(`   ${rate.fromCurrency} → USD: ${rate.rate} USD`);
  });

  // Show some cross-currency examples
  console.log('\n🌐 Cross-Currency Examples:');
  const crossExamples = ['EUR → GBP', 'JPY → CNY', 'PKR → CAD', 'AUD → EUR'];
  crossExamples.forEach(pair => {
    const [from, to] = pair.split(' → ');
    const rate = createdExchangeRates.find(r => r.fromCurrency === from && r.toCurrency === to);
    if (rate) {
      console.log(`   ${pair}: ${rate.rate} ${to}`);
    }
  });

  // Currency strength analysis
  console.log('\n💪 Currency Strength Analysis (vs USD):');
  const currencyStrength = [
    { currency: 'EUR', rate: 0.92, strength: 'Strong' },
    { currency: 'GBP', rate: 0.79, strength: 'Strong' },
    { currency: 'JPY', rate: 150.25, strength: 'Weak' },
    { currency: 'CNY', rate: 7.23, strength: 'Weak' },
    { currency: 'PKR', rate: 278.50, strength: 'Very Weak' },
    { currency: 'CAD', rate: 1.35, strength: 'Weak' },
    { currency: 'AUD', rate: 1.52, strength: 'Weak' }
  ];

  currencyStrength.forEach(curr => {
    const status = curr.rate < 1 ? 'Stronger than USD' : 'Weaker than USD';
    console.log(`   ${curr.currency}: ${curr.rate} (${status})`);
  });

  // Show PKR specific information
  console.log('\n🇵🇰 Pakistani Rupee (PKR) Details:');
  const pkrRates = createdExchangeRates.filter(r => r.fromCurrency === 'PKR' || r.toCurrency === 'PKR');
  console.log(`   PKR pairs: ${pkrRates.length}`);
  console.log(`   1 USD = ${usdRates.find(r => r.toCurrency === 'PKR')?.rate} PKR`);
  console.log(`   1 PKR = ${reverseRates.find(r => r.fromCurrency === 'PKR')?.rate} USD`);
  console.log(`   1 EUR = ${crossRates.find(r => r.fromCurrency === 'EUR' && r.toCurrency === 'PKR')?.rate} PKR`);
  console.log(`   1 GBP = ${crossRates.find(r => r.fromCurrency === 'GBP' && r.toCurrency === 'PKR')?.rate} PKR`);

  // Show conversion examples
  console.log('\n🧮 Conversion Examples:');
  console.log('   $100 USD = €92 EUR');
  console.log('   $100 USD = £79 GBP');
  console.log('   $100 USD = ¥15,025 JPY');
  console.log('   $100 USD = ¥723 CNY');
  console.log('   $100 USD = ₨27,850 PKR');
  console.log('   $100 USD = C$135 CAD');
  console.log('   $100 USD = A$152 AUD');

  // Show some cross-conversions
  console.log('\n🌍 Cross-Conversion Examples:');
  console.log('   €100 EUR = £86 GBP');
  console.log('   £100 GBP = ¥19,019 JPY');
  console.log('   ¥10,000 JPY = ₨18,500 PKR');
  console.log('   ₨10,000 PKR = €33 EUR');

  console.log(`\n💱 Total exchange rate pairs: ${createdExchangeRates.length}`);
  console.log('💡 USD is the base currency for all conversions');
  console.log('🌍 Covers 7 major world currencies including PKR');
  console.log('📈 Rates are approximate and should be updated regularly');
  console.log('🔗 All currencies have bidirectional conversion pairs');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding exchange rates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
