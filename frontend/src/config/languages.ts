export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  isRTL: boolean;
  backendCode: 'ENGLISH' | 'URDU' | 'ARABIC';
}

export const languages: LanguageOption[] = [
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: 'GB',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: 'ES',
    isRTL: false,
    backendCode: 'ENGLISH' // Using English backend for now
  },
  {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: 'FR',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: 'DE',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: 'IT',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: 'PT',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: 'RU',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: 'CN',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: 'JP',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: 'KR',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: 'IN',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    flag: 'BD',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'tr',
    name: 'Turkish',
    nativeName: 'Türkçe',
    flag: 'TR',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'nl',
    name: 'Dutch',
    nativeName: 'Nederlands',
    flag: 'NL',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'pl',
    name: 'Polish',
    nativeName: 'Polski',
    flag: 'PL',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'sv',
    name: 'Swedish',
    nativeName: 'Svenska',
    flag: 'SE',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'da',
    name: 'Danish',
    nativeName: 'Dansk',
    flag: 'DK',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'no',
    name: 'Norwegian',
    nativeName: 'Norsk',
    flag: 'NO',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'fi',
    name: 'Finnish',
    nativeName: 'Suomi',
    flag: 'FI',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'cs',
    name: 'Czech',
    nativeName: 'Čeština',
    flag: 'CZ',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'hu',
    name: 'Hungarian',
    nativeName: 'Magyar',
    flag: 'HU',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ro',
    name: 'Romanian',
    nativeName: 'Română',
    flag: 'RO',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'bg',
    name: 'Bulgarian',
    nativeName: 'Български',
    flag: 'BG',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'hr',
    name: 'Croatian',
    nativeName: 'Hrvatski',
    flag: 'HR',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'sk',
    name: 'Slovak',
    nativeName: 'Slovenčina',
    flag: 'SK',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'sl',
    name: 'Slovenian',
    nativeName: 'Slovenščina',
    flag: 'SI',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'et',
    name: 'Estonian',
    nativeName: 'Eesti',
    flag: 'EE',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'lv',
    name: 'Latvian',
    nativeName: 'Latviešu',
    flag: 'LV',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'lt',
    name: 'Lithuanian',
    nativeName: 'Lietuvių',
    flag: 'LT',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'mt',
    name: 'Maltese',
    nativeName: 'Malti',
    flag: 'MT',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'el',
    name: 'Greek',
    nativeName: 'Ελληνικά',
    flag: 'GR',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'he',
    name: 'Hebrew',
    nativeName: 'עברית',
    flag: 'IL',
    isRTL: true,
    backendCode: 'ENGLISH'
  },
  {
    code: 'fa',
    name: 'Persian',
    nativeName: 'فارسی',
    flag: 'IR',
    isRTL: true,
    backendCode: 'ENGLISH'
  },
  {
    code: 'th',
    name: 'Thai',
    nativeName: 'ไทย',
    flag: 'TH',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'vi',
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: 'VN',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'id',
    name: 'Indonesian',
    nativeName: 'Bahasa Indonesia',
    flag: 'ID',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ms',
    name: 'Malay',
    nativeName: 'Bahasa Melayu',
    flag: 'MY',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'fil',
    name: 'Filipino',
    nativeName: 'Filipino',
    flag: 'PH',
    isRTL: false,
    backendCode: 'ENGLISH'
  },
  {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: 'SA',
    isRTL: true,
    backendCode: 'ARABIC'
  },
  {
    code: 'ur',
    name: 'Urdu',
    nativeName: 'اردو',
    flag: 'PK',
    isRTL: true,
    backendCode: 'URDU'
  }
];

// Map browser language codes to our language options
export const languageMap: Record<string, string> = {
  // English variants
  'en': 'en', 'en-US': 'en', 'en-GB': 'en', 'en-CA': 'en', 'en-AU': 'en', 'en-NZ': 'en', 'en-IE': 'en',
  
  // Spanish variants
  'es': 'es', 'es-ES': 'es', 'es-MX': 'es', 'es-AR': 'es', 'es-CO': 'es', 'es-PE': 'es', 'es-VE': 'es',
  
  // French variants
  'fr': 'fr', 'fr-FR': 'fr', 'fr-CA': 'fr', 'fr-BE': 'fr', 'fr-CH': 'fr', 'fr-LU': 'fr',
  
  // German variants
  'de': 'de', 'de-DE': 'de', 'de-AT': 'de', 'de-CH': 'de', 'de-LU': 'de', 'de-LI': 'de',
  
  // Italian variants
  'it': 'it', 'it-IT': 'it', 'it-CH': 'it', 'it-SM': 'it',
  
  // Portuguese variants
  'pt': 'pt', 'pt-PT': 'pt', 'pt-BR': 'pt', 'pt-AO': 'pt', 'pt-MO': 'pt',
  
  // Russian variants
  'ru': 'ru', 'ru-RU': 'ru', 'ru-BY': 'ru', 'ru-KZ': 'ru', 'ru-KG': 'ru',
  
  // Chinese variants
  'zh': 'zh', 'zh-CN': 'zh', 'zh-TW': 'zh', 'zh-HK': 'zh', 'zh-SG': 'zh', 'zh-MO': 'zh',
  
  // Japanese variants
  'ja': 'ja', 'ja-JP': 'ja',
  
  // Korean variants
  'ko': 'ko', 'ko-KR': 'ko', 'ko-KP': 'ko',
  
  // Hindi variants
  'hi': 'hi', 'hi-IN': 'hi', 'hi-FJ': 'hi',
  
  // Bengali variants
  'bn': 'bn', 'bn-BD': 'bn', 'bn-IN': 'bn',
  
  // Turkish variants
  'tr': 'tr', 'tr-TR': 'tr', 'tr-CY': 'tr',
  
  // Dutch variants
  'nl': 'nl', 'nl-NL': 'nl', 'nl-BE': 'nl', 'nl-SR': 'nl',
  
  // Polish variants
  'pl': 'pl', 'pl-PL': 'pl',
  
  // Swedish variants
  'sv': 'sv', 'sv-SE': 'sv', 'sv-FI': 'sv',
  
  // Danish variants
  'da': 'da', 'da-DK': 'da', 'da-GL': 'da',
  
  // Norwegian variants
  'no': 'no', 'no-NO': 'no', 'no-SJ': 'no', 'nb': 'no', 'nn': 'no',
  
  // Finnish variants
  'fi': 'fi', 'fi-FI': 'fi',
  
  // Czech variants
  'cs': 'cs', 'cs-CZ': 'cs',
  
  // Hungarian variants
  'hu': 'hu', 'hu-HU': 'hu',
  
  // Romanian variants
  'ro': 'ro', 'ro-RO': 'ro', 'ro-MD': 'ro',
  
  // Bulgarian variants
  'bg': 'bg', 'bg-BG': 'bg',
  
  // Croatian variants
  'hr': 'hr', 'hr-HR': 'hr', 'hr-BA': 'hr',
  
  // Slovak variants
  'sk': 'sk', 'sk-SK': 'sk',
  
  // Slovenian variants
  'sl': 'sl', 'sl-SI': 'sl',
  
  // Estonian variants
  'et': 'et', 'et-EE': 'et',
  
  // Latvian variants
  'lv': 'lv', 'lv-LV': 'lv',
  
  // Lithuanian variants
  'lt': 'lt', 'lt-LT': 'lt',
  
  // Maltese variants
  'mt': 'mt', 'mt-MT': 'mt',
  
  // Greek variants
  'el': 'el', 'el-GR': 'el', 'el-CY': 'el',
  
  // Hebrew variants
  'he': 'he', 'he-IL': 'he',
  
  // Persian variants
  'fa': 'fa', 'fa-IR': 'fa', 'fa-AF': 'fa', 'fa-TJ': 'fa',
  
  // Thai variants
  'th': 'th', 'th-TH': 'th',
  
  // Vietnamese variants
  'vi': 'vi', 'vi-VN': 'vi',
  
  // Indonesian variants
  'id': 'id', 'id-ID': 'id',
  
  // Malay variants
  'ms': 'ms', 'ms-MY': 'ms', 'ms-BN': 'ms', 'ms-SG': 'ms',
  
  // Filipino variants
  'fil': 'fil', 'fil-PH': 'fil',
  
  // Arabic variants
  'ar': 'ar', 'ar-SA': 'ar', 'ar-EG': 'ar', 'ar-MA': 'ar', 'ar-DZ': 'ar', 'ar-TN': 'ar', 'ar-LY': 'ar',
  
  // Urdu variants
  'ur': 'ur', 'ur-PK': 'ur', 'ur-IN': 'ur'
};

// Get browser default language
export const getBrowserLanguage = (): string => {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en';
  const primaryLang = browserLang.split('-')[0].toLowerCase();
  
  // Check if we support this language
  if (languageMap[primaryLang]) {
    return languageMap[primaryLang];
  }
  
  // Check if we support the full language code
  if (languageMap[browserLang]) {
    return languageMap[browserLang];
  }
  
  // Default to English
  return 'en';
};

// Get language option by code
export const getLanguageByCode = (code: string): LanguageOption | undefined => {
  return languages.find(lang => lang.code === code);
};

// Get backend language code from frontend code
export const getBackendLanguageCode = (frontendCode: string): 'ENGLISH' | 'URDU' | 'ARABIC' => {
  const lang = getLanguageByCode(frontendCode);
  return lang?.backendCode || 'ENGLISH';
};

// Get frontend language code from backend code
export const getFrontendLanguageCode = (backendCode: 'ENGLISH' | 'URDU' | 'ARABIC'): string => {
  const lang = languages.find(l => l.backendCode === backendCode);
  return lang?.code || 'en';
};
