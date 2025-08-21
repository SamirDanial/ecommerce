import api from '../lib/axios';

export interface LanguageConfig {
  id: number;
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
  isDefault: boolean;
  isRTL: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LocalizationConfig {
  language: LanguageConfig;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  numberFormat: string;
}

export interface LanguageDisplayName {
  code: string;
  name: string;
  nativeName: string;
  isRTL: boolean;
}

export class LanguageService {
  /**
   * Get all active languages
   */
  static async getAllLanguages(): Promise<LanguageConfig[]> {
    try {
      const response = await api.get('/languages');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching languages:', error);
      throw new Error('Failed to fetch languages');
    }
  }

  /**
   * Get language by code
   */
  static async getLanguageByCode(code: string): Promise<LanguageConfig | null> {
    try {
      const response = await api.get(`/languages/${code}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching language:', error);
      return null;
    }
  }

  /**
   * Get default language
   */
  static async getDefaultLanguage(): Promise<LanguageConfig | null> {
    try {
      const response = await api.get('/languages/default');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching default language:', error);
      return null;
    }
  }

  /**
   * Get all RTL languages
   */
  static async getRTLLanguages(): Promise<LanguageConfig[]> {
    try {
      const response = await api.get('/languages/rtl');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching RTL languages:', error);
      throw new Error('Failed to fetch RTL languages');
    }
  }

  /**
   * Get localization configuration for a language
   */
  static async getLocalizationConfig(languageCode: string): Promise<LocalizationConfig> {
    try {
      const response = await api.get(`/languages/${languageCode}/localization`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching localization config:', error);
      throw new Error('Failed to fetch localization config');
    }
  }

  /**
   * Check if language is RTL
   */
  static async isRTLLanguage(languageCode: string): Promise<boolean> {
    try {
      const response = await api.get(`/languages/${languageCode}/rtl`);
      return response.data.data.isRTL;
    } catch (error) {
      console.error('Error checking RTL status:', error);
      return false;
    }
  }

  /**
   * Get supported languages for the application
   */
  static async getSupportedLanguages(): Promise<LanguageConfig[]> {
    try {
      const response = await api.get('/languages/supported');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching supported languages:', error);
      throw new Error('Failed to fetch supported languages');
    }
  }

  /**
   * Validate language code
   */
  static async validateLanguageCode(code: string): Promise<{
    code: string;
    isValid: boolean;
    language: LanguageConfig | null;
    exists: boolean;
  }> {
    try {
      const response = await api.post('/languages/validate', { code });
      return response.data.data;
    } catch (error) {
      console.error('Error validating language code:', error);
      throw new Error('Failed to validate language code');
    }
  }

  /**
   * Get browser language preference
   */
  static async getBrowserLanguage(): Promise<{
    browserLanguage: string;
    detectedLanguage: LanguageConfig | null;
    fallbackLanguage: string;
    isSupported: boolean;
  }> {
    try {
      const response = await api.get('/languages/browser');
      return response.data.data;
    } catch (error) {
      console.error('Error detecting browser language:', error);
      throw new Error('Failed to detect browser language');
    }
  }

  /**
   * Get language display names in preferred language
   */
  static async getLanguageDisplayNames(preferredLanguage: string = 'en'): Promise<LanguageDisplayName[]> {
    try {
      const response = await api.get(`/languages/display-names?preferredLanguage=${preferredLanguage}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching language display names:', error);
      throw new Error('Failed to fetch language display names');
    }
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
   * Get fallback languages for offline use
   */
  static getFallbackLanguages(): LanguageConfig[] {
    return [
      { id: 1, code: 'en', name: 'English', nativeName: 'English', isActive: true, isDefault: true, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 2, code: 'es', name: 'Spanish', nativeName: 'Español', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 3, code: 'fr', name: 'French', nativeName: 'Français', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 4, code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 5, code: 'it', name: 'Italian', nativeName: 'Italiano', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 6, code: 'pt', name: 'Portuguese', nativeName: 'Português', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 7, code: 'ru', name: 'Russian', nativeName: 'Русский', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 8, code: 'zh', name: 'Chinese', nativeName: '中文', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 9, code: 'ja', name: 'Japanese', nativeName: '日本語', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 10, code: 'ko', name: 'Korean', nativeName: '한국어', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 11, code: 'ar', name: 'Arabic', nativeName: 'العربية', isActive: true, isDefault: false, isRTL: true, createdAt: '', updatedAt: '' },
      { id: 12, code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 13, code: 'ur', name: 'Urdu', nativeName: 'اردو', isActive: true, isDefault: false, isRTL: true, createdAt: '', updatedAt: '' },
      { id: 14, code: 'bn', name: 'Bengali', nativeName: 'বাংলা', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' },
      { id: 15, code: 'th', name: 'Thai', nativeName: 'ไทย', isActive: true, isDefault: false, isRTL: false, createdAt: '', updatedAt: '' }
    ];
  }

  /**
   * Detect browser language on the client side
   */
  static detectBrowserLanguage(): string {
    if (typeof navigator !== 'undefined') {
      const browserLang = navigator.language || navigator.languages?.[0] || 'en';
      return browserLang.split('-')[0]; // Get primary language code
    }
    return 'en';
  }
}

export default LanguageService;
