import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const shippingRates = [
  // North America
  { countryCode: 'US', countryName: 'United States', shippingCost: 0.00, deliveryDays: 3 },
  { countryCode: 'CA', countryName: 'Canada', shippingCost: 15.00, deliveryDays: 5 },
  { countryCode: 'MX', countryName: 'Mexico', shippingCost: 25.00, deliveryDays: 7 },

  // Europe - Western
  { countryCode: 'GB', countryName: 'United Kingdom', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'DE', countryName: 'Germany', shippingCost: 18.00, deliveryDays: 4 },
  { countryCode: 'FR', countryName: 'France', shippingCost: 18.00, deliveryDays: 4 },
  { countryCode: 'IT', countryName: 'Italy', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'ES', countryName: 'Spain', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'NL', countryName: 'Netherlands', shippingCost: 18.00, deliveryDays: 4 },
  { countryCode: 'BE', countryName: 'Belgium', shippingCost: 18.00, deliveryDays: 4 },
  { countryCode: 'AT', countryName: 'Austria', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'CH', countryName: 'Switzerland', shippingCost: 22.00, deliveryDays: 5 },
  { countryCode: 'SE', countryName: 'Sweden', shippingCost: 22.00, deliveryDays: 5 },
  { countryCode: 'NO', countryName: 'Norway', shippingCost: 25.00, deliveryDays: 6 },
  { countryCode: 'DK', countryName: 'Denmark', shippingCost: 22.00, deliveryDays: 5 },
  { countryCode: 'FI', countryName: 'Finland', shippingCost: 25.00, deliveryDays: 6 },
  { countryCode: 'IE', countryName: 'Ireland', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'PT', countryName: 'Portugal', shippingCost: 22.00, deliveryDays: 6 },

  // Europe - Eastern
  { countryCode: 'PL', countryName: 'Poland', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'CZ', countryName: 'Czech Republic', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'HU', countryName: 'Hungary', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'RO', countryName: 'Romania', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'BG', countryName: 'Bulgaria', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'HR', countryName: 'Croatia', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'SI', countryName: 'Slovenia', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'SK', countryName: 'Slovakia', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'EE', countryName: 'Estonia', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'LV', countryName: 'Latvia', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'LT', countryName: 'Lithuania', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'MT', countryName: 'Malta', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'CY', countryName: 'Cyprus', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'GR', countryName: 'Greece', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'AL', countryName: 'Albania', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'MK', countryName: 'North Macedonia', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'ME', countryName: 'Montenegro', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'RS', countryName: 'Serbia', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'BA', countryName: 'Bosnia and Herzegovina', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'UA', countryName: 'Ukraine', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'BY', countryName: 'Belarus', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'MD', countryName: 'Moldova', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'RU', countryName: 'Russia', shippingCost: 40.00, deliveryDays: 12 },

  // Asia - East
  { countryCode: 'JP', countryName: 'Japan', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'KR', countryName: 'South Korea', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'CN', countryName: 'China', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'TW', countryName: 'Taiwan', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'HK', countryName: 'Hong Kong', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'MO', countryName: 'Macau', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'MN', countryName: 'Mongolia', shippingCost: 45.00, deliveryDays: 15 },

  // Asia - Southeast
  { countryCode: 'SG', countryName: 'Singapore', shippingCost: 25.00, deliveryDays: 7 },
  { countryCode: 'MY', countryName: 'Malaysia', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'TH', countryName: 'Thailand', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'VN', countryName: 'Vietnam', shippingCost: 30.00, deliveryDays: 9 },
  { countryCode: 'ID', countryName: 'Indonesia', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'PH', countryName: 'Philippines', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'MM', countryName: 'Myanmar', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'LA', countryName: 'Laos', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'KH', countryName: 'Cambodia', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'BN', countryName: 'Brunei', shippingCost: 30.00, deliveryDays: 9 },

  // Asia - South
  { countryCode: 'IN', countryName: 'India', shippingCost: 25.00, deliveryDays: 8 },
  { countryCode: 'PK', countryName: 'Pakistan', shippingCost: 28.00, deliveryDays: 9 },
  { countryCode: 'BD', countryName: 'Bangladesh', shippingCost: 30.00, deliveryDays: 10 },
  { countryCode: 'LK', countryName: 'Sri Lanka', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'NP', countryName: 'Nepal', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'BT', countryName: 'Bhutan', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'MV', countryName: 'Maldives', shippingCost: 35.00, deliveryDays: 12 },

  // Asia - Central
  { countryCode: 'KZ', countryName: 'Kazakhstan', shippingCost: 40.00, deliveryDays: 12 },
  { countryCode: 'KG', countryName: 'Kyrgyzstan', shippingCost: 42.00, deliveryDays: 14 },
  { countryCode: 'TJ', countryName: 'Tajikistan', shippingCost: 42.00, deliveryDays: 14 },
  { countryCode: 'TM', countryName: 'Turkmenistan', shippingCost: 42.00, deliveryDays: 14 },
  { countryCode: 'UZ', countryName: 'Uzbekistan', shippingCost: 40.00, deliveryDays: 12 },
  { countryCode: 'AF', countryName: 'Afghanistan', shippingCost: 45.00, deliveryDays: 15 },

  // Asia - West (Middle East)
  { countryCode: 'SA', countryName: 'Saudi Arabia', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'AE', countryName: 'United Arab Emirates', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'QA', countryName: 'Qatar', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'KW', countryName: 'Kuwait', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'BH', countryName: 'Bahrain', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'OM', countryName: 'Oman', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'JO', countryName: 'Jordan', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'LB', countryName: 'Lebanon', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'IL', countryName: 'Israel', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'TR', countryName: 'Turkey', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'IR', countryName: 'Iran', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'IQ', countryName: 'Iraq', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'SY', countryName: 'Syria', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'YE', countryName: 'Yemen', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'GE', countryName: 'Georgia', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'AM', countryName: 'Armenia', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'AZ', countryName: 'Azerbaijan', shippingCost: 35.00, deliveryDays: 10 },

  // Oceania
  { countryCode: 'AU', countryName: 'Australia', shippingCost: 35.00, deliveryDays: 10 },
  { countryCode: 'NZ', countryName: 'New Zealand', shippingCost: 38.00, deliveryDays: 12 },
  { countryCode: 'FJ', countryName: 'Fiji', shippingCost: 45.00, deliveryDays: 15 },
  { countryCode: 'PG', countryName: 'Papua New Guinea', shippingCost: 50.00, deliveryDays: 18 },
  { countryCode: 'SB', countryName: 'Solomon Islands', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'VU', countryName: 'Vanuatu', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'NC', countryName: 'New Caledonia', shippingCost: 45.00, deliveryDays: 15 },
  { countryCode: 'PF', countryName: 'French Polynesia', shippingCost: 45.00, deliveryDays: 15 },

  // Africa - North
  { countryCode: 'EG', countryName: 'Egypt', shippingCost: 30.00, deliveryDays: 10 },
  { countryCode: 'MA', countryName: 'Morocco', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'TN', countryName: 'Tunisia', shippingCost: 32.00, deliveryDays: 10 },
  { countryCode: 'DZ', countryName: 'Algeria', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'LY', countryName: 'Libya', shippingCost: 40.00, deliveryDays: 15 },

  // Africa - West
  { countryCode: 'NG', countryName: 'Nigeria', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'GH', countryName: 'Ghana', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'CI', countryName: 'Ivory Coast', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'SN', countryName: 'Senegal', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'ML', countryName: 'Mali', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'BF', countryName: 'Burkina Faso', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'NE', countryName: 'Niger', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'TD', countryName: 'Chad', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'CM', countryName: 'Cameroon', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'CF', countryName: 'Central African Republic', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'CG', countryName: 'Congo', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'GA', countryName: 'Gabon', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'GQ', countryName: 'Equatorial Guinea', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'ST', countryName: 'Sao Tome and Principe', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'CV', countryName: 'Cape Verde', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'GM', countryName: 'Gambia', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'GN', countryName: 'Guinea', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'GW', countryName: 'Guinea-Bissau', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'SL', countryName: 'Sierra Leone', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'LR', countryName: 'Liberia', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'TG', countryName: 'Togo', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'BJ', countryName: 'Benin', shippingCost: 38.00, deliveryDays: 14 },

  // Africa - East
  { countryCode: 'KE', countryName: 'Kenya', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'TZ', countryName: 'Tanzania', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'UG', countryName: 'Uganda', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'RW', countryName: 'Rwanda', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'BI', countryName: 'Burundi', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'ET', countryName: 'Ethiopia', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'ER', countryName: 'Eritrea', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'DJ', countryName: 'Djibouti', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'SO', countryName: 'Somalia', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'SS', countryName: 'South Sudan', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'MG', countryName: 'Madagascar', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'MU', countryName: 'Mauritius', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'SC', countryName: 'Seychelles', shippingCost: 42.00, deliveryDays: 16 },
  { countryCode: 'KM', countryName: 'Comoros', shippingCost: 45.00, deliveryDays: 18 },
  { countryCode: 'MW', countryName: 'Malawi', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'ZM', countryName: 'Zambia', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'ZW', countryName: 'Zimbabwe', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'BW', countryName: 'Botswana', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'NA', countryName: 'Namibia', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'SZ', countryName: 'Eswatini', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'LS', countryName: 'Lesotho', shippingCost: 38.00, deliveryDays: 14 },

  // Africa - South
  { countryCode: 'ZA', countryName: 'South Africa', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'AO', countryName: 'Angola', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'MZ', countryName: 'Mozambique', shippingCost: 40.00, deliveryDays: 15 },

  // Americas - Central
  { countryCode: 'GT', countryName: 'Guatemala', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'BZ', countryName: 'Belize', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'SV', countryName: 'El Salvador', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'HN', countryName: 'Honduras', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'NI', countryName: 'Nicaragua', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'CR', countryName: 'Costa Rica', shippingCost: 28.00, deliveryDays: 8 },
  { countryCode: 'PA', countryName: 'Panama', shippingCost: 28.00, deliveryDays: 8 },

  // Americas - South
  { countryCode: 'BR', countryName: 'Brazil', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'AR', countryName: 'Argentina', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'CL', countryName: 'Chile', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'PE', countryName: 'Peru', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'CO', countryName: 'Colombia', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'VE', countryName: 'Venezuela', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'EC', countryName: 'Ecuador', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'BO', countryName: 'Bolivia', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'PY', countryName: 'Paraguay', shippingCost: 38.00, deliveryDays: 14 },
  { countryCode: 'UY', countryName: 'Uruguay', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'GY', countryName: 'Guyana', shippingCost: 40.00, deliveryDays: 15 },
  { countryCode: 'SR', countryName: 'Suriname', shippingCost: 40.00, deliveryDays: 15 },

  // Americas - Caribbean
  { countryCode: 'CU', countryName: 'Cuba', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'JM', countryName: 'Jamaica', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'HT', countryName: 'Haiti', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'DO', countryName: 'Dominican Republic', shippingCost: 30.00, deliveryDays: 8 },
  { countryCode: 'PR', countryName: 'Puerto Rico', shippingCost: 25.00, deliveryDays: 5 },
  { countryCode: 'AG', countryName: 'Antigua and Barbuda', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'BB', countryName: 'Barbados', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'GD', countryName: 'Grenada', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'KN', countryName: 'Saint Kitts and Nevis', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'LC', countryName: 'Saint Lucia', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'VC', countryName: 'Saint Vincent and the Grenadines', shippingCost: 35.00, deliveryDays: 12 },
  { countryCode: 'TT', countryName: 'Trinidad and Tobago', shippingCost: 32.00, deliveryDays: 9 },
  { countryCode: 'BS', countryName: 'Bahamas', shippingCost: 30.00, deliveryDays: 8 },

  // Europe - Microstates
  { countryCode: 'LI', countryName: 'Liechtenstein', shippingCost: 22.00, deliveryDays: 5 },
  { countryCode: 'MC', countryName: 'Monaco', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'SM', countryName: 'San Marino', shippingCost: 22.00, deliveryDays: 5 },
  { countryCode: 'VA', countryName: 'Vatican City', shippingCost: 20.00, deliveryDays: 5 },
  { countryCode: 'AD', countryName: 'Andorra', shippingCost: 22.00, deliveryDays: 5 },

  // Pacific Islands
  { countryCode: 'KI', countryName: 'Kiribati', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'TV', countryName: 'Tuvalu', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'NR', countryName: 'Nauru', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'PW', countryName: 'Palau', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'MH', countryName: 'Marshall Islands', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'FM', countryName: 'Micronesia', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'TO', countryName: 'Tonga', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'WS', countryName: 'Samoa', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'CK', countryName: 'Cook Islands', shippingCost: 50.00, deliveryDays: 20 },
  { countryCode: 'NU', countryName: 'Niue', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'TK', countryName: 'Tokelau', shippingCost: 55.00, deliveryDays: 25 },
  { countryCode: 'AS', countryName: 'American Samoa', shippingCost: 45.00, deliveryDays: 15 },
  { countryCode: 'GU', countryName: 'Guam', shippingCost: 45.00, deliveryDays: 15 },
  { countryCode: 'MP', countryName: 'Northern Mariana Islands', shippingCost: 45.00, deliveryDays: 15 }
];

async function main() {
  console.log('🚢 Starting shipping rates database seeding...');

  // Clear existing shipping rate data
  await prisma.shippingRate.deleteMany();

  // Create shipping rates
  const createdShippingRates = await Promise.all(
    shippingRates.map((rate) =>
      prisma.shippingRate.create({
        data: {
          ...rate,
          isActive: true
        }
      })
    )
  );

  console.log(`✅ Created ${createdShippingRates.length} shipping rates`);
  
  // Group by region for better organization
  const regions = {
    'North America': createdShippingRates.filter(r => ['US', 'CA', 'MX'].includes(r.countryCode)),
    'Europe': createdShippingRates.filter(r => ['GB', 'DE', 'FR', 'IT', 'ES', 'NL', 'BE', 'AT', 'CH', 'SE', 'NO', 'DK', 'FI', 'IE', 'PT', 'PL', 'CZ', 'HU', 'RO', 'BG', 'HR', 'SI', 'SK', 'EE', 'LV', 'LT', 'MT', 'CY', 'GR', 'AL', 'MK', 'ME', 'RS', 'BA', 'UA', 'BY', 'MD', 'RU', 'LI', 'MC', 'SM', 'VA', 'AD'].includes(r.countryCode)),
    'Asia': createdShippingRates.filter(r => ['JP', 'KR', 'CN', 'TW', 'HK', 'MO', 'MN', 'SG', 'MY', 'TH', 'VN', 'ID', 'PH', 'MM', 'LA', 'KH', 'BN', 'IN', 'PK', 'BD', 'LK', 'NP', 'BT', 'MV', 'KZ', 'KG', 'TJ', 'TM', 'UZ', 'AF', 'SA', 'AE', 'QA', 'KW', 'BH', 'OM', 'JO', 'LB', 'IL', 'TR', 'IR', 'IQ', 'SY', 'YE', 'GE', 'AM', 'AZ'].includes(r.countryCode)),
    'Oceania': createdShippingRates.filter(r => ['AU', 'NZ', 'FJ', 'PG', 'SB', 'VU', 'NC', 'PF', 'KI', 'TV', 'NR', 'PW', 'MH', 'FM', 'TO', 'WS', 'CK', 'NU', 'TK', 'AS', 'GU', 'MP'].includes(r.countryCode)),
    'Africa': createdShippingRates.filter(r => ['EG', 'MA', 'TN', 'DZ', 'LY', 'NG', 'GH', 'CI', 'SN', 'ML', 'BF', 'NE', 'TD', 'CM', 'CF', 'CG', 'GA', 'GQ', 'ST', 'CV', 'GM', 'GN', 'GW', 'SL', 'LR', 'TG', 'BJ', 'KE', 'TZ', 'UG', 'RW', 'BI', 'ET', 'ER', 'DJ', 'SO', 'SS', 'MG', 'MU', 'SC', 'KM', 'MW', 'ZM', 'ZW', 'BW', 'NA', 'SZ', 'LS', 'ZA', 'AO', 'MZ'].includes(r.countryCode)),
    'Americas': createdShippingRates.filter(r => ['GT', 'BZ', 'SV', 'HN', 'NI', 'CR', 'PA', 'BR', 'AR', 'CL', 'PE', 'CO', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'CU', 'JM', 'HT', 'DO', 'PR', 'AG', 'BB', 'GD', 'KN', 'LC', 'VC', 'TT', 'BS'].includes(r.countryCode))
  };

  // Show statistics by region
  console.log('\n📊 Shipping Rates by Region:');
  Object.entries(regions).forEach(([region, rates]) => {
    if (rates.length > 0) {
      const avgCost = rates.reduce((sum, r) => sum + Number(r.shippingCost), 0) / rates.length;
      const avgDays = rates.reduce((sum, r) => sum + r.deliveryDays, 0) / rates.length;
      console.log(`   ${region}: ${rates.length} countries`);
      console.log(`      Average cost: $${avgCost.toFixed(2)}`);
      console.log(`      Average delivery: ${avgDays.toFixed(1)} days`);
    }
  });

  // Show cost ranges
  const costs = createdShippingRates.map(r => Number(r.shippingCost));
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const avgCost = costs.reduce((sum, cost) => sum + cost, 0) / costs.length;

  console.log('\n💰 Cost Analysis:');
  console.log(`   Minimum shipping cost: $${minCost.toFixed(2)}`);
  console.log(`   Maximum shipping cost: $${maxCost.toFixed(2)}`);
  console.log(`   Average shipping cost: $${avgCost.toFixed(2)}`);

  // Show delivery time ranges
  const days = createdShippingRates.map(r => r.deliveryDays);
  const minDays = Math.min(...days);
  const maxDays = Math.max(...days);
  const avgDays = days.reduce((sum, day) => sum + day, 0) / days.length;

  console.log('\n📅 Delivery Time Analysis:');
  console.log(`   Fastest delivery: ${minDays} days`);
  console.log(`   Slowest delivery: ${maxDays} days`);
  console.log(`   Average delivery: ${avgDays.toFixed(1)} days`);

  // Show some examples
  console.log('\n📋 Sample Shipping Rates:');
  const samples = ['US', 'GB', 'DE', 'JP', 'AU', 'ZA', 'BR', 'IN', 'PK', 'AF'];
  samples.forEach(code => {
    const rate = createdShippingRates.find(r => r.countryCode === code);
    if (rate) {
      console.log(`   ${rate.countryCode} - ${rate.countryName}: $${rate.shippingCost} (${rate.deliveryDays} days)`);
    }
  });

  console.log(`\n🌍 Total shipping rates: ${createdShippingRates.length}`);
  console.log('💡 US has free shipping (domestic)');
  console.log('🚢 All countries covered with realistic shipping costs');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding shipping rates:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
