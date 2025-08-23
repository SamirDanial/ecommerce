import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌍 Seeding ALL countries with tax and shipping rates...');

  // ALL COUNTRIES IN THE WORLD with realistic data
  const allCountries = [
    // North America
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexico' },
    
    // Central America
    { code: 'GT', name: 'Guatemala' },
    { code: 'BZ', name: 'Belize' },
    { code: 'SV', name: 'El Salvador' },
    { code: 'HN', name: 'Honduras' },
    { code: 'NI', name: 'Nicaragua' },
    { code: 'CR', name: 'Costa Rica' },
    { code: 'PA', name: 'Panama' },
    
    // Caribbean
    { code: 'CU', name: 'Cuba' },
    { code: 'JM', name: 'Jamaica' },
    { code: 'HT', name: 'Haiti' },
    { code: 'DO', name: 'Dominican Republic' },
    { code: 'PR', name: 'Puerto Rico' },
    { code: 'BB', name: 'Barbados' },
    { code: 'TT', name: 'Trinidad and Tobago' },
    { code: 'GD', name: 'Grenada' },
    { code: 'LC', name: 'Saint Lucia' },
    { code: 'VC', name: 'Saint Vincent and the Grenadines' },
    { code: 'AG', name: 'Antigua and Barbuda' },
    { code: 'KN', name: 'Saint Kitts and Nevis' },
    { code: 'DM', name: 'Dominica' },
    { code: 'BS', name: 'Bahamas' },
    
    // South America
    { code: 'BR', name: 'Brazil' },
    { code: 'AR', name: 'Argentina' },
    { code: 'CL', name: 'Chile' },
    { code: 'CO', name: 'Colombia' },
    { code: 'PE', name: 'Peru' },
    { code: 'VE', name: 'Venezuela' },
    { code: 'EC', name: 'Ecuador' },
    { code: 'BO', name: 'Bolivia' },
    { code: 'PY', name: 'Paraguay' },
    { code: 'UY', name: 'Uruguay' },
    { code: 'GY', name: 'Guyana' },
    { code: 'SR', name: 'Suriname' },
    { code: 'FK', name: 'Falkland Islands' },
    
    // Europe
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'IT', name: 'Italy' },
    { code: 'ES', name: 'Spain' },
    { code: 'NL', name: 'Netherlands' },
    { code: 'BE', name: 'Belgium' },
    { code: 'AT', name: 'Austria' },
    { code: 'SE', name: 'Sweden' },
    { code: 'NO', name: 'Norway' },
    { code: 'DK', name: 'Denmark' },
    { code: 'FI', name: 'Finland' },
    { code: 'PL', name: 'Poland' },
    { code: 'CZ', name: 'Czech Republic' },
    { code: 'HU', name: 'Hungary' },
    { code: 'RO', name: 'Romania' },
    { code: 'BG', name: 'Bulgaria' },
    { code: 'HR', name: 'Croatia' },
    { code: 'RS', name: 'Serbia' },
    { code: 'SI', name: 'Slovenia' },
    { code: 'SK', name: 'Slovakia' },
    { code: 'EE', name: 'Estonia' },
    { code: 'LV', name: 'Latvia' },
    { code: 'LT', name: 'Lithuania' },
    { code: 'IE', name: 'Ireland' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GR', name: 'Greece' },
    { code: 'CY', name: 'Cyprus' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'MT', name: 'Malta' },
    { code: 'IS', name: 'Iceland' },
    { code: 'CH', name: 'Switzerland' },
    { code: 'LI', name: 'Liechtenstein' },
    { code: 'MC', name: 'Monaco' },
    { code: 'AD', name: 'Andorra' },
    { code: 'SM', name: 'San Marino' },
    { code: 'VA', name: 'Vatican City' },
    { code: 'AL', name: 'Albania' },
    { code: 'MK', name: 'North Macedonia' },
    { code: 'ME', name: 'Montenegro' },
    { code: 'BA', name: 'Bosnia and Herzegovina' },
    { code: 'XK', name: 'Kosovo' },
    { code: 'MD', name: 'Moldova' },
    { code: 'UA', name: 'Ukraine' },
    { code: 'BY', name: 'Belarus' },
    { code: 'RU', name: 'Russia' },
    
    // Asia
    { code: 'CN', name: 'China' },
    { code: 'JP', name: 'Japan' },
    { code: 'KR', name: 'South Korea' },
    { code: 'IN', name: 'India' },
    { code: 'PK', name: 'Pakistan' },
    { code: 'BD', name: 'Bangladesh' },
    { code: 'LK', name: 'Sri Lanka' },
    { code: 'NP', name: 'Nepal' },
    { code: 'BT', name: 'Bhutan' },
    { code: 'MV', name: 'Maldives' },
    { code: 'AF', name: 'Afghanistan' },
    { code: 'IR', name: 'Iran' },
    { code: 'IQ', name: 'Iraq' },
    { code: 'SY', name: 'Syria' },
    { code: 'LB', name: 'Lebanon' },
    { code: 'JO', name: 'Jordan' },
    { code: 'IL', name: 'Israel' },
    { code: 'PS', name: 'Palestine' },
    { code: 'SA', name: 'Saudi Arabia' },
    { code: 'AE', name: 'United Arab Emirates' },
    { code: 'QA', name: 'Qatar' },
    { code: 'KW', name: 'Kuwait' },
    { code: 'BH', name: 'Bahrain' },
    { code: 'OM', name: 'Oman' },
    { code: 'YE', name: 'Yemen' },
    { code: 'TR', name: 'Turkey' },
    { code: 'GE', name: 'Georgia' },
    { code: 'AM', name: 'Armenia' },
    { code: 'AZ', name: 'Azerbaijan' },
    { code: 'KZ', name: 'Kazakhstan' },
    { code: 'UZ', name: 'Uzbekistan' },
    { code: 'TJ', name: 'Tajikistan' },
    { code: 'TM', name: 'Turkmenistan' },
    { code: 'KG', name: 'Kyrgyzstan' },
    { code: 'MN', name: 'Mongolia' },
    { code: 'TH', name: 'Thailand' },
    { code: 'VN', name: 'Vietnam' },
    { code: 'LA', name: 'Laos' },
    { code: 'KH', name: 'Cambodia' },
    { code: 'MM', name: 'Myanmar' },
    { code: 'MY', name: 'Malaysia' },
    { code: 'SG', name: 'Singapore' },
    { code: 'ID', name: 'Indonesia' },
    { code: 'PH', name: 'Philippines' },
    { code: 'BN', name: 'Brunei' },
    { code: 'TL', name: 'East Timor' },
    { code: 'TW', name: 'Taiwan' },
    { code: 'HK', name: 'Hong Kong' },
    { code: 'MO', name: 'Macau' },
    { code: 'KP', name: 'North Korea' },
    
    // Africa
    { code: 'EG', name: 'Egypt' },
    { code: 'LY', name: 'Libya' },
    { code: 'TN', name: 'Tunisia' },
    { code: 'DZ', name: 'Algeria' },
    { code: 'MA', name: 'Morocco' },
    { code: 'SD', name: 'Sudan' },
    { code: 'SS', name: 'South Sudan' },
    { code: 'ET', name: 'Ethiopia' },
    { code: 'ER', name: 'Eritrea' },
    { code: 'DJ', name: 'Djibouti' },
    { code: 'SO', name: 'Somalia' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'BI', name: 'Burundi' },
    { code: 'CD', name: 'Democratic Republic of the Congo' },
    { code: 'CG', name: 'Republic of the Congo' },
    { code: 'GA', name: 'Gabon' },
    { code: 'CM', name: 'Cameroon' },
    { code: 'TD', name: 'Chad' },
    { code: 'NE', name: 'Niger' },
    { code: 'ML', name: 'Mali' },
    { code: 'BF', name: 'Burkina Faso' },
    { code: 'CI', name: 'Ivory Coast' },
    { code: 'SN', name: 'Senegal' },
    { code: 'GN', name: 'Guinea' },
    { code: 'SL', name: 'Sierra Leone' },
    { code: 'LR', name: 'Liberia' },
    { code: 'GW', name: 'Guinea-Bissau' },
    { code: 'CV', name: 'Cape Verde' },
    { code: 'GM', name: 'Gambia' },
    { code: 'NG', name: 'Nigeria' },
    { code: 'GH', name: 'Ghana' },
    { code: 'TG', name: 'Togo' },
    { code: 'BJ', name: 'Benin' },
    { code: 'ST', name: 'Sao Tome and Principe' },
    { code: 'GQ', name: 'Equatorial Guinea' },
    { code: 'CF', name: 'Central African Republic' },
    { code: 'AO', name: 'Angola' },
    { code: 'ZM', name: 'Zambia' },
    { code: 'ZW', name: 'Zimbabwe' },
    { code: 'BW', name: 'Botswana' },
    { code: 'NA', name: 'Namibia' },
    { code: 'SZ', name: 'Eswatini' },
    { code: 'LS', name: 'Lesotho' },
    { code: 'MW', name: 'Malawi' },
    { code: 'MZ', name: 'Mozambique' },
    { code: 'MG', name: 'Madagascar' },
    { code: 'MU', name: 'Mauritius' },
    { code: 'SC', name: 'Seychelles' },
    { code: 'KM', name: 'Comoros' },
    { code: 'ZA', name: 'South Africa' },
    
    // Oceania
    { code: 'AU', name: 'Australia' },
    { code: 'NZ', name: 'New Zealand' },
    { code: 'FJ', name: 'Fiji' },
    { code: 'PG', name: 'Papua New Guinea' },
    { code: 'WS', name: 'Samoa' },
    { code: 'TO', name: 'Tonga' },
    { code: 'VU', name: 'Vanuatu' },
    { code: 'SB', name: 'Solomon Islands' },
    { code: 'KI', name: 'Kiribati' },
    { code: 'TV', name: 'Tuvalu' },
    { code: 'NR', name: 'Nauru' },
    { code: 'PW', name: 'Palau' },
    { code: 'MH', name: 'Marshall Islands' },
    { code: 'FM', name: 'Micronesia' },
    { code: 'NC', name: 'New Caledonia' },
    { code: 'PF', name: 'French Polynesia' },
    { code: 'CK', name: 'Cook Islands' },
    { code: 'NU', name: 'Niue' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'AS', name: 'American Samoa' },
    { code: 'GU', name: 'Guam' },
    { code: 'MP', name: 'Northern Mariana Islands' },
    { code: 'WF', name: 'Wallis and Futuna' },
    { code: 'TK', name: 'Tokelau' },
    { code: 'PN', name: 'Pitcairn Islands' },
    { code: 'NF', name: 'Norfolk Island' },
    { code: 'CX', name: 'Christmas Island' },
    { code: 'CC', name: 'Cocos Islands' },
    { code: 'HM', name: 'Heard and McDonald Islands' },
    { code: 'AQ', name: 'Antarctica' }
  ];

  // US States with names
  const usStates = [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' }
  ];

  // Canadian Provinces
  const canadianProvinces = [
    { code: 'ON', name: 'Ontario' },
    { code: 'BC', name: 'British Columbia' },
    { code: 'AB', name: 'Alberta' },
    { code: 'QC', name: 'Quebec' },
    { code: 'NS', name: 'Nova Scotia' },
    { code: 'NB', name: 'New Brunswick' },
    { code: 'NL', name: 'Newfoundland and Labrador' },
    { code: 'PE', name: 'Prince Edward Island' },
    { code: 'MB', name: 'Manitoba' },
    { code: 'SK', name: 'Saskatchewan' },
    { code: 'NT', name: 'Northwest Territories' },
    { code: 'NU', name: 'Nunavut' },
    { code: 'YT', name: 'Yukon' }
  ];

  console.log('📊 Creating tax rates for all countries...');
  
  // Create tax rates for all countries
  for (const country of allCountries) {
    // Generate realistic tax rate based on region
    let taxRate = 0;
    let taxName = '';
    
    if (country.code === 'US') {
      // US states have different tax rates
      for (const state of usStates) {
        // Realistic US state tax rates
        const stateTaxRates = {
          'CA': 7.25, 'TX': 6.25, 'NY': 8.875, 'FL': 6.00, 'IL': 6.25,
          'PA': 6.00, 'OH': 5.75, 'GA': 4.00, 'NC': 4.75, 'MI': 6.00,
          'WA': 6.50, 'OR': 0.00, 'DE': 0.00, 'MT': 0.00, 'NH': 0.00,
          'AK': 0.00, 'AL': 4.00, 'AZ': 5.60, 'AR': 6.50, 'CO': 2.90,
          'CT': 6.35, 'HI': 4.00, 'ID': 6.00, 'IN': 7.00, 'IA': 6.00,
          'KS': 6.50, 'KY': 6.00, 'LA': 4.45, 'ME': 5.50, 'MD': 6.00,
          'MA': 6.25, 'MN': 6.875, 'MS': 7.00, 'MO': 4.225, 'NE': 5.50,
          'NV': 6.85, 'NJ': 6.625, 'NM': 5.125, 'ND': 5.00, 'OK': 4.50,
          'RI': 7.00, 'SC': 6.00, 'TN': 7.00, 'UT': 6.10, 'VT': 6.00,
          'VA': 5.30, 'WV': 6.00, 'WI': 5.00
        };
        
        taxRate = stateTaxRates[state.code] || 5.00;
        taxName = `${state.name} State Sales Tax`;
        
        await prisma.taxRate.create({
          data: {
            countryCode: country.code,
            countryName: country.name,
            stateCode: state.code,
            stateName: state.name,
            taxRate: taxRate,
            taxName: taxName,
            isActive: true
          }
        });
      }
    } else if (country.code === 'CA') {
      // Canadian provinces
      for (const province of canadianProvinces) {
        const provinceTaxRates = {
          'ON': 13.00, 'BC': 12.00, 'AB': 5.00, 'QC': 14.975, 'NS': 15.00,
          'NB': 15.00, 'NL': 15.00, 'PE': 15.00, 'MB': 12.00, 'SK': 11.00,
          'NT': 5.00, 'NU': 5.00, 'YT': 5.00
        };
        
        taxRate = provinceTaxRates[province.code] || 5.00;
        taxName = `${province.name} GST/HST`;
        
        await prisma.taxRate.create({
          data: {
            countryCode: country.code,
            countryName: country.name,
            stateCode: province.code,
            stateName: province.name,
            taxRate: taxRate,
            taxName: taxName,
            isActive: true
          }
        });
      }
    } else {
      // Other countries - generate realistic tax rates
      if (['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'NO', 'DK', 'FI'].includes(country.code)) {
        // European countries - VAT rates
        const euVatRates = {
          'GB': 20.00, 'DE': 19.00, 'FR': 20.00, 'IT': 22.00, 'ES': 21.00,
          'NL': 21.00, 'BE': 21.00, 'AT': 20.00, 'SE': 25.00, 'NO': 25.00,
          'DK': 25.00, 'FI': 24.00
        };
        taxRate = euVatRates[country.code] || 20.00;
        taxName = 'VAT';
      } else if (['JP', 'KR', 'AU', 'NZ', 'SG', 'MY', 'TH', 'VN', 'ID', 'PH', 'IN', 'PK', 'BD', 'LK', 'NP'].includes(country.code)) {
        // Asian countries - GST/VAT rates
        const asianTaxRates = {
          'JP': 10.00, 'KR': 10.00, 'AU': 10.00, 'NZ': 15.00, 'SG': 8.00,
          'MY': 10.00, 'TH': 7.00, 'VN': 10.00, 'ID': 11.00, 'PH': 12.00,
          'IN': 18.00, 'PK': 17.00, 'BD': 15.00, 'LK': 12.00, 'NP': 13.00
        };
        taxRate = asianTaxRates[country.code] || 10.00;
        taxName = 'GST/VAT';
      } else if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IL', 'IR', 'AF'].includes(country.code)) {
        // Middle Eastern countries
        const middleEastTaxRates = {
          'SA': 15.00, 'AE': 5.00, 'QA': 0.00, 'KW': 0.00, 'BH': 5.00,
          'OM': 5.00, 'JO': 16.00, 'LB': 11.00, 'IL': 17.00, 'IR': 9.00, 'AF': 0.00
        };
        taxRate = middleEastTaxRates[country.code] || 5.00;
        taxName = 'VAT';
      } else if (['ZA', 'EG', 'NG', 'KE', 'GH', 'MA', 'TN', 'DZ', 'LY', 'SD', 'ET', 'TZ', 'UG', 'ZM', 'ZW'].includes(country.code)) {
        // African countries
        const africanTaxRates = {
          'ZA': 15.00, 'EG': 14.00, 'NG': 7.50, 'KE': 16.00, 'GH': 12.50,
          'MA': 20.00, 'TN': 19.00, 'DZ': 19.00, 'LY': 0.00, 'SD': 17.00,
          'ET': 15.00, 'TZ': 18.00, 'UG': 18.00, 'ZM': 16.00, 'ZW': 14.50
        };
        taxRate = africanTaxRates[country.code] || 15.00;
        taxName = 'VAT';
      } else {
        // Default tax rate for other countries
        taxRate = Math.floor(Math.random() * 20) + 5; // 5-25%
        taxName = 'Sales Tax';
      }
      
      await prisma.taxRate.create({
        data: {
          countryCode: country.code,
          countryName: country.name,
          stateCode: null,
          stateName: null,
          taxRate: taxRate,
          taxName: taxName,
          isActive: true
        }
      });
    }
  }

  console.log('🚚 Creating shipping rates for all countries...');
  
  // Create shipping rates for all countries
  for (const country of allCountries) {
    let shippingCost = 0;
    let deliveryDays = 0;
    
    if (country.code === 'US') {
      // US states - domestic shipping
      for (const state of usStates) {
        shippingCost = 5.99; // Base domestic rate
        deliveryDays = 3; // 3-5 business days
        
        // Adjust for distance/remote states
        if (['AK', 'HI'].includes(state.code)) {
          shippingCost = 14.99;
          deliveryDays = 8;
        } else if (['WA', 'OR', 'CA', 'NV', 'ID', 'MT', 'WY', 'UT', 'CO', 'AZ', 'NM'].includes(state.code)) {
          shippingCost = 6.99;
          deliveryDays = 4;
        } else if (['TX', 'OK', 'KS', 'NE', 'SD', 'ND', 'MN', 'IA', 'MO', 'AR', 'LA', 'MS', 'AL', 'GA', 'FL', 'SC', 'NC', 'TN', 'KY', 'IN', 'OH', 'MI', 'WI', 'IL'].includes(state.code)) {
          shippingCost = 5.99;
          deliveryDays = 3;
        } else {
          shippingCost = 6.99;
          deliveryDays = 4;
        }
        
        await prisma.shippingRate.create({
          data: {
            countryCode: country.code,
            countryName: country.name,
            stateCode: state.code,
            stateName: state.name,
            shippingCost: shippingCost,
            deliveryDays: deliveryDays,
            isActive: true
          }
        });
      }
    } else if (country.code === 'CA') {
      // Canadian provinces
      for (const province of canadianProvinces) {
        shippingCost = 8.99; // Base Canadian rate
        deliveryDays = 4; // 4-6 business days
        
        // Adjust for remote provinces
        if (['NT', 'NU', 'YT'].includes(province.code)) {
          shippingCost = 12.99;
          deliveryDays = 8;
        } else if (['BC', 'AB', 'SK', 'MB'].includes(province.code)) {
          shippingCost = 9.99;
          deliveryDays = 5;
        } else {
          shippingCost = 8.99;
          deliveryDays = 4;
        }
        
        await prisma.shippingRate.create({
          data: {
            countryCode: country.code,
            countryName: country.name,
            stateCode: province.code,
            stateName: province.name,
            shippingCost: shippingCost,
            deliveryDays: deliveryDays,
            isActive: true
          }
        });
      }
    } else {
      // Other countries - international shipping
      if (['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'SE', 'NO', 'DK', 'FI'].includes(country.code)) {
        // European countries
        shippingCost = 13.99;
        deliveryDays = 8;
      } else if (['JP', 'KR', 'AU', 'NZ', 'SG', 'MY', 'TH', 'VN', 'ID', 'PH', 'IN', 'PK', 'BD', 'LK', 'NP'].includes(country.code)) {
        // Asian countries
        shippingCost = 16.99;
        deliveryDays = 10;
      } else if (['SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IL', 'IR', 'AF'].includes(country.code)) {
        // Middle Eastern countries
        shippingCost = 17.99;
        deliveryDays = 11;
      } else if (['ZA', 'EG', 'NG', 'KE', 'GH', 'MA', 'TN', 'DZ', 'LY', 'SD', 'ET', 'TZ', 'UG', 'ZM', 'ZW'].includes(country.code)) {
        // African countries
        shippingCost = 19.99;
        deliveryDays = 13;
      } else if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'MX'].includes(country.code)) {
        // South American countries
        shippingCost = 13.99;
        deliveryDays = 8;
      } else {
        // Default international rate
        shippingCost = 18.99;
        deliveryDays = 12;
      }
      
      await prisma.shippingRate.create({
        data: {
          countryCode: country.code,
          countryName: country.name,
          stateCode: null,
          stateName: null,
          shippingCost: shippingCost,
          deliveryDays: deliveryDays,
          isActive: true
        }
      });
    }
  }

  console.log('✅ ALL countries seeded successfully!');
  console.log(`🌍 Countries: ${allCountries.length}`);
  console.log(`📊 Tax rates created for all countries`);
  console.log(`🚚 Shipping rates created for all countries`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding all countries:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
