import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const languages = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    isActive: true,
    isDefault: true,
    isRTL: false
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    nativeName: '中文 (简体)',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'zh-TW',
    name: 'Chinese (Traditional)',
    nativeName: '中文 (繁體)',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    isActive: true,
    isDefault: false,
    isRTL: true
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    isActive: true,
    isDefault: false,
    isRTL: true
  },
  {
    code: 'fa',
    name: 'Persian (Farsi)',
    nativeName: 'فارسی',
    isActive: true,
    isDefault: false,
    isRTL: true
  },
  {
    code: 'ps',
    name: 'Dari',
    nativeName: 'دری',
    isActive: true,
    isDefault: false,
    isRTL: true
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    isActive: true,
    isDefault: false,
    isRTL: true
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'uk',
    name: 'Ukrainian',
    nativeName: 'Українська',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'mt',
    name: 'Maltese',
    nativeName: 'Malti',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ga',
    name: 'Irish',
    nativeName: 'Gaeilge',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'cy',
    name: 'Welsh',
    nativeName: 'Cymraeg',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'is',
    name: 'Icelandic',
    nativeName: 'Íslenska',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'fo',
    name: 'Faroese',
    nativeName: 'Føroyskt',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sq',
    name: 'Albanian',
    nativeName: 'Shqip',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'mk',
    name: 'Macedonian',
    nativeName: 'Македонски',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sr',
    name: 'Serbian',
    nativeName: 'Српски',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'bs',
    name: 'Bosnian',
    nativeName: 'Bosanski',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'me',
    name: 'Montenegrin',
    nativeName: 'Crnogorski',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ka',
    name: 'Georgian',
    nativeName: 'ქართული',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'hy',
    name: 'Armenian',
    nativeName: 'Հայերեն',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'az',
    name: 'Azerbaijani',
    nativeName: 'Azərbaycan',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'kk',
    name: 'Kazakh',
    nativeName: 'Қазақ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ky',
    name: 'Kyrgyz',
    nativeName: 'Кыргызча',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'uz',
    name: 'Uzbek',
    nativeName: 'O\'zbek',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'tk',
    name: 'Turkmen',
    nativeName: 'Türkmençe',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'tg',
    name: 'Tajik',
    nativeName: 'Тоҷикӣ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'mn',
    name: 'Mongolian',
    nativeName: 'Монгол',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ne',
    name: 'Nepali',
    nativeName: 'नेपाली',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'si',
    name: 'Sinhala',
    nativeName: 'සිංහල',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'my',
    name: 'Burmese',
    nativeName: 'မြန်မာ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'km',
    name: 'Khmer',
    nativeName: 'ខ្មែរ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'lo',
    name: 'Lao',
    nativeName: 'ລາວ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'am',
    name: 'Amharic',
    nativeName: 'አማርኛ',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'sw',
    name: 'Swahili',
    nativeName: 'Kiswahili',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'yo',
    name: 'Yoruba',
    nativeName: 'Yorùbá',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ig',
    name: 'Igbo',
    nativeName: 'Igbo',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'ha',
    name: 'Hausa',
    nativeName: 'Hausa',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'zu',
    name: 'Zulu',
    nativeName: 'isiZulu',
    isActive: true,
    isDefault: false,
    isRTL: false
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nativeName: 'Afrikaans',
    isActive: true,
    isDefault: false,
    isRTL: false
  }
];

async function main() {
  console.log('🌍 Starting languages database seeding...');

  // Clear existing language data
  await prisma.languageConfig.deleteMany();

  // Create languages
  const createdLanguages = await Promise.all(
    languages.map((language) =>
      prisma.languageConfig.create({
        data: language
      })
    )
  );

  console.log(`✅ Created ${createdLanguages.length} languages`);
  
  // Log language details
  console.log('\n📊 Languages created:');
  createdLanguages.forEach(language => {
    const defaultMark = language.isDefault ? ' (DEFAULT)' : '';
    const rtlMark = language.isRTL ? ' [RTL]' : '';
    console.log(`   ${language.code} - ${language.name}${defaultMark}${rtlMark}`);
    console.log(`      Native: ${language.nativeName}`);
  });

  // Show statistics
  const rtlLanguages = createdLanguages.filter(l => l.isRTL);
  const ltrLanguages = createdLanguages.filter(l => !l.isRTL);
  
  console.log('\n📈 Language Statistics:');
  console.log(`   Total languages: ${createdLanguages.length}`);
  console.log(`   Left-to-Right (LTR): ${ltrLanguages.length}`);
  console.log(`   Right-to-Left (RTL): ${rtlLanguages.length}`);
  console.log(`   Default language: ${createdLanguages.find(l => l.isDefault)?.name} (${createdLanguages.find(l => l.isDefault)?.code})`);

  // Show RTL languages specifically
  if (rtlLanguages.length > 0) {
    console.log('\n🔄 Right-to-Left Languages:');
    rtlLanguages.forEach(lang => {
      console.log(`   ${lang.code} - ${lang.name} (${lang.nativeName})`);
    });
  }

  // Show some key languages
  const keyLanguages = ['en', 'es', 'fr', 'de', 'zh', 'ja', 'ar', 'hi', 'ps'];
  console.log('\n⭐ Key Languages:');
  keyLanguages.forEach(code => {
    const lang = createdLanguages.find(l => l.code === code);
    if (lang) {
      console.log(`   ${lang.code} - ${lang.name} (${lang.nativeName})`);
    }
  });

  console.log(`\n🌍 Total languages: ${createdLanguages.length}`);
  console.log('💡 English is set as the default language');
  console.log('🔍 Special note: Dari (ps) is included for Afghanistan');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding languages:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
