import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding tax rates only...');

  try {
    // Clear existing tax rates
    await prisma.taxRate.deleteMany();
    console.log('🗑️ Cleared existing tax rates');

    // Tax Rates - Realistic values for common countries
    const taxRates = [
      // United States - State Sales Tax
      { countryCode: 'US', countryName: 'United States', stateCode: 'CA', stateName: 'California', taxRate: 7.25, taxName: 'California State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'TX', stateName: 'Texas', taxRate: 6.25, taxName: 'Texas State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'NY', stateName: 'New York', taxRate: 8.875, taxName: 'New York State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'FL', stateName: 'Florida', taxRate: 6.00, taxName: 'Florida State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'IL', stateName: 'Illinois', taxRate: 6.25, taxName: 'Illinois State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'PA', stateName: 'Pennsylvania', taxRate: 6.00, taxName: 'Pennsylvania State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'OH', stateName: 'Ohio', taxRate: 5.75, taxName: 'Ohio State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'GA', stateName: 'Georgia', taxRate: 4.00, taxName: 'Georgia State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'NC', stateName: 'North Carolina', taxRate: 4.75, taxName: 'North Carolina State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'MI', stateName: 'Michigan', taxRate: 6.00, taxName: 'Michigan State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'WA', stateName: 'Washington', taxRate: 6.50, taxName: 'Washington State Sales Tax' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'OR', stateName: 'Oregon', taxRate: 0.00, taxName: 'Oregon (No Sales Tax)' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'DE', stateName: 'Delaware', taxRate: 0.00, taxName: 'Delaware (No Sales Tax)' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'MT', stateName: 'Montana', taxRate: 0.00, taxName: 'Montana (No Sales Tax)' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'NH', stateName: 'New Hampshire', taxRate: 0.00, taxName: 'New Hampshire (No Sales Tax)' },
      { countryCode: 'US', countryName: 'United States', stateCode: 'AK', stateName: 'Alaska', taxRate: 0.00, taxName: 'Alaska (No Sales Tax)' },

      // Canada - GST/HST/PST
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'ON', stateName: 'Ontario', taxRate: 13.00, taxName: 'Ontario HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'BC', stateName: 'British Columbia', taxRate: 12.00, taxName: 'British Columbia HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'AB', stateName: 'Alberta', taxRate: 5.00, taxName: 'Alberta GST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'QC', stateName: 'Quebec', taxRate: 14.975, taxName: 'Quebec GST + QST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'NS', stateName: 'Nova Scotia', taxRate: 15.00, taxName: 'Nova Scotia HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'NB', stateName: 'New Brunswick', taxRate: 15.00, taxName: 'New Brunswick HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'NL', stateName: 'Newfoundland and Labrador', taxRate: 15.00, taxName: 'Newfoundland and Labrador HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'PE', stateName: 'Prince Edward Island', taxRate: 15.00, taxName: 'Prince Edward Island HST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'MB', stateName: 'Manitoba', taxRate: 12.00, taxName: 'Manitoba GST + PST' },
      { countryCode: 'CA', countryName: 'Canada', stateCode: 'SK', stateName: 'Saskatchewan', taxRate: 11.00, taxName: 'Saskatchewan GST + PST' },

      // United Kingdom
      { countryCode: 'GB', countryName: 'United Kingdom', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'UK VAT' },

      // European Union - VAT Rates
      { countryCode: 'DE', countryName: 'Germany', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'German VAT' },
      { countryCode: 'FR', countryName: 'France', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'French VAT' },
      { countryCode: 'IT', countryName: 'Italy', stateCode: null, stateName: null, taxRate: 22.00, taxName: 'Italian VAT' },
      { countryCode: 'ES', countryName: 'Spain', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Spanish VAT' },
      { countryCode: 'NL', countryName: 'Netherlands', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Dutch VAT' },
      { countryCode: 'BE', countryName: 'Belgium', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Belgian VAT' },
      { countryCode: 'AT', countryName: 'Austria', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Austrian VAT' },
      { countryCode: 'SE', countryName: 'Sweden', stateCode: null, stateName: null, taxRate: 25.00, taxName: 'Swedish VAT' },
      { countryCode: 'DK', countryName: 'Denmark', stateCode: null, stateName: null, taxRate: 25.00, taxName: 'Danish VAT' },
      { countryCode: 'FI', countryName: 'Finland', stateCode: null, stateName: null, taxRate: 24.00, taxName: 'Finnish VAT' },
      { countryCode: 'PL', countryName: 'Poland', stateCode: null, stateName: null, taxRate: 23.00, taxName: 'Polish VAT' },
      { countryCode: 'CZ', countryName: 'Czech Republic', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Czech VAT' },
      { countryCode: 'HU', countryName: 'Hungary', stateCode: null, stateName: null, taxRate: 27.00, taxName: 'Hungarian VAT' },
      { countryCode: 'RO', countryName: 'Romania', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Romanian VAT' },
      { countryCode: 'BG', countryName: 'Bulgaria', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Bulgarian VAT' },
      { countryCode: 'HR', countryName: 'Croatia', stateCode: null, stateName: null, taxRate: 25.00, taxName: 'Croatian VAT' },
      { countryCode: 'SI', countryName: 'Slovenia', stateCode: null, stateName: null, taxRate: 22.00, taxName: 'Slovenian VAT' },
      { countryCode: 'SK', countryName: 'Slovakia', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Slovak VAT' },
      { countryCode: 'EE', countryName: 'Estonia', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Estonian VAT' },
      { countryCode: 'LV', countryName: 'Latvia', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Latvian VAT' },
      { countryCode: 'LT', countryName: 'Lithuania', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Lithuanian VAT' },
      { countryCode: 'IE', countryName: 'Ireland', stateCode: null, stateName: null, taxRate: 23.00, taxName: 'Irish VAT' },
      { countryCode: 'PT', countryName: 'Portugal', stateCode: null, stateName: null, taxRate: 23.00, taxName: 'Portuguese VAT' },
      { countryCode: 'GR', countryName: 'Greece', stateCode: null, stateName: null, taxRate: 24.00, taxName: 'Greek VAT' },
      { countryCode: 'CY', countryName: 'Cyprus', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Cypriot VAT' },
      { countryCode: 'LU', countryName: 'Luxembourg', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Luxembourg VAT' },
      { countryCode: 'MT', countryName: 'Malta', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Maltese VAT' },

      // Asia Pacific
      { countryCode: 'JP', countryName: 'Japan', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Japanese Consumption Tax' },
      { countryCode: 'KR', countryName: 'South Korea', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Korean VAT' },
      { countryCode: 'AU', countryName: 'Australia', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Australian GST' },
      { countryCode: 'NZ', countryName: 'New Zealand', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'New Zealand GST' },
      { countryCode: 'SG', countryName: 'Singapore', stateCode: null, stateName: null, taxRate: 8.00, taxName: 'Singapore GST' },
      { countryCode: 'MY', countryName: 'Malaysia', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Malaysian SST' },
      { countryCode: 'TH', countryName: 'Thailand', stateCode: null, stateName: null, taxRate: 7.00, taxName: 'Thai VAT' },
      { countryCode: 'VN', countryName: 'Vietnam', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Vietnamese VAT' },
      { countryCode: 'ID', countryName: 'Indonesia', stateCode: null, stateName: null, taxRate: 11.00, taxName: 'Indonesian VAT' },
      { countryCode: 'PH', countryName: 'Philippines', stateCode: null, stateName: null, taxRate: 12.00, taxName: 'Philippine VAT' },
      { countryCode: 'IN', countryName: 'India', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Indian GST' },
      { countryCode: 'PK', countryName: 'Pakistan', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Pakistani GST' },
      { countryCode: 'BD', countryName: 'Bangladesh', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Bangladeshi VAT' },
      { countryCode: 'LK', countryName: 'Sri Lanka', stateCode: null, stateName: null, taxRate: 12.00, taxName: 'Sri Lankan VAT' },
      { countryCode: 'NP', countryName: 'Nepal', stateCode: null, stateName: null, taxRate: 13.00, taxName: 'Nepalese VAT' },
      { countryCode: 'MM', countryName: 'Myanmar', stateCode: null, stateName: null, taxRate: 5.00, taxName: 'Myanmar Commercial Tax' },
      { countryCode: 'KH', countryName: 'Cambodia', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Cambodian VAT' },
      { countryCode: 'LA', countryName: 'Laos', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Laotian VAT' },
      { countryCode: 'MN', countryName: 'Mongolia', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Mongolian VAT' },
      { countryCode: 'KZ', countryName: 'Kazakhstan', stateCode: null, stateName: null, taxRate: 12.00, taxName: 'Kazakhstan VAT' },
      { countryCode: 'UZ', countryName: 'Uzbekistan', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Uzbekistan VAT' },
      { countryCode: 'TJ', countryName: 'Tajikistan', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Tajikistan VAT' },
      { countryCode: 'TM', countryName: 'Turkmenistan', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Turkmenistan VAT' },
      { countryCode: 'AZ', countryName: 'Azerbaijan', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Azerbaijan VAT' },
      { countryCode: 'GE', countryName: 'Georgia', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Georgian VAT' },
      { countryCode: 'AM', countryName: 'Armenia', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Armenian VAT' },
      { countryCode: 'BY', countryName: 'Belarus', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Belarus VAT' },
      { countryCode: 'MD', countryName: 'Moldova', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Moldovan VAT' },
      { countryCode: 'UA', countryName: 'Ukraine', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Ukrainian VAT' },

      // Middle East
      { countryCode: 'AE', countryName: 'United Arab Emirates', stateCode: null, stateName: null, taxRate: 5.00, taxName: 'UAE VAT' },
      { countryCode: 'SA', countryName: 'Saudi Arabia', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Saudi VAT' },
      { countryCode: 'QA', countryName: 'Qatar', stateCode: null, stateName: null, taxRate: 0.00, taxName: 'Qatar (No VAT)' },
      { countryCode: 'KW', countryName: 'Kuwait', stateCode: null, stateName: null, taxRate: 0.00, taxName: 'Kuwait (No VAT)' },
      { countryCode: 'BH', countryName: 'Bahrain', stateCode: null, stateName: null, taxRate: 5.00, taxName: 'Bahrain VAT' },
      { countryCode: 'OM', countryName: 'Oman', stateCode: null, stateName: null, taxRate: 5.00, taxName: 'Oman VAT' },
      { countryCode: 'JO', countryName: 'Jordan', stateCode: null, stateName: null, taxRate: 16.00, taxName: 'Jordan VAT' },
      { countryCode: 'LB', countryName: 'Lebanon', stateCode: null, stateName: null, taxRate: 11.00, taxName: 'Lebanese VAT' },
      { countryCode: 'IL', countryName: 'Israel', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Israeli VAT' },
      { countryCode: 'IR', countryName: 'Iran', stateCode: null, stateName: null, taxRate: 9.00, taxName: 'Iranian VAT' },
      { countryCode: 'AF', countryName: 'Afghanistan', stateCode: null, stateName: null, taxRate: 0.00, taxName: 'Afghanistan (No VAT)' },

      // Africa
      { countryCode: 'ZA', countryName: 'South Africa', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'South African VAT' },
      { countryCode: 'EG', countryName: 'Egypt', stateCode: null, stateName: null, taxRate: 14.00, taxName: 'Egyptian VAT' },
      { countryCode: 'NG', countryName: 'Nigeria', stateCode: null, stateName: null, taxRate: 7.50, taxName: 'Nigerian VAT' },
      { countryCode: 'KE', countryName: 'Kenya', stateCode: null, stateName: null, taxRate: 16.00, taxName: 'Kenyan VAT' },
      { countryCode: 'GH', countryName: 'Ghana', stateCode: null, stateName: null, taxRate: 12.50, taxName: 'Ghanaian VAT' },
      { countryCode: 'MA', countryName: 'Morocco', stateCode: null, stateName: null, taxRate: 20.00, taxName: 'Moroccan VAT' },
      { countryCode: 'TN', countryName: 'Tunisia', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Tunisian VAT' },
      { countryCode: 'DZ', countryName: 'Algeria', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Algerian VAT' },
      { countryCode: 'LY', countryName: 'Libya', stateCode: null, stateName: null, taxRate: 0.00, taxName: 'Libya (No VAT)' },
      { countryCode: 'SD', countryName: 'Sudan', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Sudanese VAT' },
      { countryCode: 'ET', countryName: 'Ethiopia', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Ethiopian VAT' },
      { countryCode: 'TZ', countryName: 'Tanzania', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Tanzanian VAT' },
      { countryCode: 'UG', countryName: 'Uganda', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Ugandan VAT' },
      { countryCode: 'ZM', countryName: 'Zambia', stateCode: null, stateName: null, taxRate: 16.00, taxName: 'Zambian VAT' },
      { countryCode: 'ZW', countryName: 'Zimbabwe', stateCode: null, stateName: null, taxRate: 14.50, taxName: 'Zimbabwean VAT' },
      { countryCode: 'BW', countryName: 'Botswana', stateCode: null, stateName: null, taxRate: 12.00, taxName: 'Botswana VAT' },
      { countryCode: 'NA', countryName: 'Namibia', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Namibian VAT' },
      { countryCode: 'SZ', countryName: 'Eswatini', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Eswatini VAT' },
      { countryCode: 'LS', countryName: 'Lesotho', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Lesotho VAT' },
      { countryCode: 'MW', countryName: 'Malawi', stateCode: null, stateName: null, taxRate: 16.50, taxName: 'Malawian VAT' },
      { countryCode: 'MZ', countryName: 'Mozambique', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Mozambican VAT' },
      { countryCode: 'AO', countryName: 'Angola', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Angolan VAT' },
      { countryCode: 'CD', countryName: 'DR Congo', stateCode: null, stateName: null, taxRate: 16.00, taxName: 'DR Congo VAT' },
      { countryCode: 'CG', countryName: 'Congo', stateCode: null, stateName: null, taxRate: 18.90, taxName: 'Congo VAT' },
      { countryCode: 'GA', countryName: 'Gabon', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Gabonese VAT' },
      { countryCode: 'CM', countryName: 'Cameroon', stateCode: null, stateName: null, taxRate: 19.25, taxName: 'Cameroonian VAT' },
      { countryCode: 'TD', countryName: 'Chad', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Chadian VAT' },
      { countryCode: 'NE', countryName: 'Niger', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Niger VAT' },
      { countryCode: 'ML', countryName: 'Mali', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Malian VAT' },
      { countryCode: 'BF', countryName: 'Burkina Faso', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Burkina Faso VAT' },
      { countryCode: 'CI', countryName: 'Ivory Coast', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Ivorian VAT' },
      { countryCode: 'SN', countryName: 'Senegal', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Senegalese VAT' },
      { countryCode: 'GN', countryName: 'Guinea', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Guinean VAT' },
      { countryCode: 'SL', countryName: 'Sierra Leone', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Sierra Leone VAT' },
      { countryCode: 'LR', countryName: 'Liberia', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Liberian VAT' },
      { countryCode: 'GW', countryName: 'Guinea-Bissau', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Guinea-Bissau VAT' },
      { countryCode: 'CV', countryName: 'Cape Verde', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Cape Verdean VAT' },
      { countryCode: 'GM', countryName: 'Gambia', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Gambian VAT' },

      // Americas
      { countryCode: 'MX', countryName: 'Mexico', stateCode: null, stateName: null, taxRate: 16.00, taxName: 'Mexican VAT' },
      { countryCode: 'BR', countryName: 'Brazil', stateCode: null, stateName: null, taxRate: 17.00, taxName: 'Brazilian ICMS' },
      { countryCode: 'AR', countryName: 'Argentina', stateCode: null, stateName: null, taxRate: 21.00, taxName: 'Argentine VAT' },
      { countryCode: 'CL', countryName: 'Chile', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Chilean VAT' },
      { countryCode: 'CO', countryName: 'Colombia', stateCode: null, stateName: null, taxRate: 19.00, taxName: 'Colombian VAT' },
      { countryCode: 'PE', countryName: 'Peru', stateCode: null, stateName: null, taxRate: 18.00, taxName: 'Peruvian VAT' },
      { countryCode: 'UY', countryName: 'Uruguay', stateCode: null, stateName: null, taxRate: 22.00, taxName: 'Uruguayan VAT' },
      { countryCode: 'PY', countryName: 'Paraguay', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Paraguayan VAT' },
      { countryCode: 'GY', countryName: 'Guyana', stateCode: null, stateName: null, taxRate: 14.00, taxName: 'Guyanese VAT' },
      { countryCode: 'SR', countryName: 'Suriname', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Surinamese VAT' },
      { countryCode: 'FJ', countryName: 'Fiji', stateCode: null, stateName: null, taxRate: 9.00, taxName: 'Fijian VAT' },
      { countryCode: 'PG', countryName: 'Papua New Guinea', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Papua New Guinean VAT' },
      { countryCode: 'WS', countryName: 'Samoa', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Samoan VAT' },
      { countryCode: 'TO', countryName: 'Tonga', stateCode: null, stateName: null, taxRate: 15.00, taxName: 'Tongan VAT' },
      { countryCode: 'VU', countryName: 'Vanuatu', stateCode: null, stateName: null, taxRate: 12.50, taxName: 'Vanuatu VAT' },
      { countryCode: 'SB', countryName: 'Solomon Islands', stateCode: null, stateName: null, taxRate: 10.00, taxName: 'Solomon Islands VAT' },
      { countryCode: 'KI', countryName: 'Kiribati', stateCode: null, stateName: null, taxRate: 12.50, taxName: 'Kiribati VAT' },
      { countryCode: 'TV', countryName: 'Tuvalu', stateCode: null, stateName: null, taxRate: 0.00, taxName: 'Tuvalu (No VAT)' },
    ];

    // Insert tax rates
    console.log('📊 Inserting tax rates...');
    for (const taxRate of taxRates) {
      await prisma.taxRate.create({
        data: {
          countryCode: taxRate.countryCode,
          countryName: taxRate.countryName,
          stateCode: taxRate.stateCode,
          stateName: taxRate.stateName,
          taxRate: taxRate.taxRate,
          taxName: taxRate.taxName,
          isActive: true
        }
      });
    }

    console.log('✅ Tax rates seeded successfully!');
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
