import express from 'express';
import { LanguageService } from '../services/languageService';

const router = express.Router();

/**
 * GET /api/languages
 * Get all active languages
 */
router.get('/', async (req, res) => {
  try {
    const languages = await LanguageService.getAllActiveLanguages();
    res.json({
      success: true,
      data: languages,
      count: languages.length
    });
  } catch (error) {
    console.error('Error fetching languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch languages'
    });
  }
});

/**
 * GET /api/languages/:code
 * Get language by code
 */
router.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const language = await LanguageService.getLanguageByCode(code);
    
    if (!language) {
      return res.status(404).json({
        success: false,
        error: `Language not found: ${code}`
      });
    }

    res.json({
      success: true,
      data: language
    });
  } catch (error) {
    console.error('Error fetching language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch language'
    });
  }
});

/**
 * GET /api/languages/default
 * Get default language
 */
router.get('/default', async (req, res) => {
  try {
    const language = await LanguageService.getDefaultLanguage();
    
    if (!language) {
      return res.status(404).json({
        success: false,
        error: 'No default language found'
      });
    }

    res.json({
      success: true,
      data: language
    });
  } catch (error) {
    console.error('Error fetching default language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch default language'
    });
  }
});

/**
 * GET /api/languages/rtl
 * Get all RTL languages
 */
router.get('/rtl', async (req, res) => {
  try {
    const languages = await LanguageService.getRTLLanguages();
    res.json({
      success: true,
      data: languages,
      count: languages.length
    });
  } catch (error) {
    console.error('Error fetching RTL languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch RTL languages'
    });
  }
});

/**
 * GET /api/languages/:code/localization
 * Get localization configuration for a language
 */
router.get('/:code/localization', async (req, res) => {
  try {
    const { code } = req.params;
    const config = await LanguageService.getLocalizationConfig(code);

    res.json({
      success: true,
      data: config
    });
  } catch (error) {
    console.error('Error fetching localization config:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch localization config'
    });
  }
});

/**
 * GET /api/languages/:code/rtl
 * Check if language is RTL
 */
router.get('/:code/rtl', async (req, res) => {
  try {
    const { code } = req.params;
    const isRTL = await LanguageService.isRTLLanguage(code);

    res.json({
      success: true,
      data: {
        language: code,
        isRTL
      }
    });
  } catch (error) {
    console.error('Error checking RTL status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check RTL status'
    });
  }
});

/**
 * GET /api/languages/supported
 * Get supported languages for the application
 */
router.get('/supported', async (req, res) => {
  try {
    const languages = await LanguageService.getSupportedLanguages();
    res.json({
      success: true,
      data: languages,
      count: languages.length
    });
  } catch (error) {
    console.error('Error fetching supported languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch supported languages'
    });
  }
});

/**
 * POST /api/languages/validate
 * Validate language code
 */
router.post('/validate', async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: code'
      });
    }

    const isValid = LanguageService.isValidLanguageCode(code);
    const language = isValid ? await LanguageService.getLanguageByCode(code) : null;

    res.json({
      success: true,
      data: {
        code,
        isValid,
        language: language || null,
        exists: !!language
      }
    });
  } catch (error) {
    console.error('Error validating language code:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate language code'
    });
  }
});

/**
 * GET /api/languages/browser
 * Get browser language preference
 */
router.get('/browser', async (req, res) => {
  try {
    const browserLang = LanguageService.getBrowserLanguage();
    const language = await LanguageService.getLanguageByCode(browserLang);
    const fallback = LanguageService.getFallbackLanguage(browserLang);

    res.json({
      success: true,
      data: {
        browserLanguage: browserLang,
        detectedLanguage: language,
        fallbackLanguage: fallback,
        isSupported: !!language
      }
    });
  } catch (error) {
    console.error('Error detecting browser language:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to detect browser language'
    });
  }
});

/**
 * GET /api/languages/display-names
 * Get language display names in preferred language
 */
router.get('/display-names', async (req, res) => {
  try {
    const { preferredLanguage = 'en' } = req.query;
    const languages = await LanguageService.getAllActiveLanguages();
    
    const displayNames = languages.map(lang => ({
      code: lang.code,
      name: LanguageService.getLanguageDisplayName(lang, preferredLanguage as string),
      nativeName: lang.nativeName,
      isRTL: lang.isRTL
    }));

    res.json({
      success: true,
      data: displayNames,
      count: displayNames.length
    });
  } catch (error) {
    console.error('Error fetching language display names:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch language display names'
    });
  }
});

export default router;

