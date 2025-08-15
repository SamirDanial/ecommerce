import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface LanguageConfig {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  isRTL: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LocalizationConfig {
  language: LanguageConfig;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
}

export class LanguageService {
  /**
   * Get all active languages
   */
  static async getAllActiveLanguages(): Promise<LanguageConfig[]> {
    return await prisma.languageConfig.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Get language by code
   */
  static async getLanguageByCode(code: string): Promise<LanguageConfig | null> {
    return await prisma.languageConfig.findFirst({
      where: { 
        code: code.toLowerCase(),
        isActive: true 
      }
    });
  }

  /**
   * Get default language
   */
  static async getDefaultLanguage(): Promise<LanguageConfig | null> {
    return await prisma.languageConfig.findFirst({
      where: { isDefault: true }
    });
  }

  /**
   * Get RTL languages
   */
  static async getRTLLanguages(): Promise<LanguageConfig[]> {
    return await prisma.languageConfig.findMany({
      where: { 
        isRTL: true,
        isActive: true 
      },
      orderBy: { code: 'asc' }
    });
  }

  /**
   * Get localization configuration for a language
   */
  static async getLocalizationConfig(languageCode: string): Promise<LocalizationConfig> {
    const language = await this.getLanguageByCode(languageCode);
    if (!language) {
      throw new Error(`Language not found: ${languageCode}`);
    }

    // Default configurations based on language
    const configs: Record<string, LocalizationConfig> = {
      'en': {
        language,
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        numberFormat: '1,234.56'
      },
      'ar': {
        language,
        currency: 'SAR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '١٬٢٣٤٫٥٦'
      },
      'ur': {
        language,
        currency: 'PKR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '١٬٢٣٤٫٥٦'
      },
      'hi': {
        language,
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '१,२३४.५६'
      },
      'zh': {
        language,
        currency: 'CNY',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        numberFormat: '1,234.56'
      },
      'ja': {
        language,
        currency: 'JPY',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        numberFormat: '1,234'
      },
      'ko': {
        language,
        currency: 'KRW',
        dateFormat: 'YYYY-MM-DD',
        timeFormat: '24h',
        numberFormat: '1,234'
      },
      'de': {
        language,
        currency: 'EUR',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: '1.234,56'
      },
      'fr': {
        language,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '1 234,56'
      },
      'es': {
        language,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '1.234,56'
      },
      'it': {
        language,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '1.234,56'
      },
      'pt': {
        language,
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        numberFormat: '1.234,56'
      },
      'ru': {
        language,
        currency: 'RUB',
        dateFormat: 'DD.MM.YYYY',
        timeFormat: '24h',
        numberFormat: '1 234,56'
      }
    };

    return configs[languageCode] || configs['en'];
  }

  /**
   * Check if language is RTL
   */
  static async isRTLLanguage(languageCode: string): Promise<boolean> {
    const language = await this.getLanguageByCode(languageCode);
    return language?.isRTL || false;
  }

  /**
   * Get supported languages for the application
   */
  static async getSupportedLanguages(): Promise<LanguageConfig[]> {
    return await prisma.languageConfig.findMany({
      where: { isActive: true },
      orderBy: [
        { isDefault: 'desc' },
        { code: 'asc' }
      ]
    });
  }

  /**
   * Get language display name (native name if available, otherwise English name)
   */
  static getLanguageDisplayName(language: LanguageConfig, preferredLanguage: string = 'en'): string {
    if (preferredLanguage === language.code) {
      return language.nativeName;
    }
    return language.name;
  }

  /**
   * Get browser language preference (server-side fallback)
   */
  static getBrowserLanguage(): string {
    // This would typically be called from the frontend
    // For server-side, we return a default
    return 'en';
  }

  /**
   * Validate language code
   */
  static isValidLanguageCode(code: string): boolean {
    // Basic validation - 2-3 character language codes
    return /^[a-z]{2,3}$/.test(code);
  }

  /**
   * Get fallback language for unsupported languages
   */
  static getFallbackLanguage(attemptedLanguage: string): string {
    const fallbacks: Record<string, string> = {
      'zh-cn': 'zh',
      'zh-tw': 'zh',
      'zh-hk': 'zh',
      'en-us': 'en',
      'en-gb': 'en',
      'en-ca': 'en',
      'en-au': 'en',
      'es-mx': 'es',
      'es-ar': 'es',
      'pt-br': 'pt',
      'pt-pt': 'pt',
      'fr-ca': 'fr',
      'fr-ch': 'fr',
      'de-at': 'de',
      'de-ch': 'de',
      'it-ch': 'it',
      'nl-be': 'nl',
      'sv-fi': 'sv',
      'no-no': 'no',
      'da-dk': 'da'
    };

    return fallbacks[attemptedLanguage.toLowerCase()] || attemptedLanguage.split('-')[0];
  }
}

export default LanguageService;
