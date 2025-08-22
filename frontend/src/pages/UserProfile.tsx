import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { 
  Settings, 
  ShoppingBag, 
  MapPin,
  Shield, 
  Package, 
  Star,
  Loader2,
  Globe
} from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useProfile } from '../hooks/useProfile';
import { useConfig } from '../hooks/useConfig';
import { useCurrency } from '../contexts/CurrencyContext';
import { timezoneService } from '../services/timezoneService';


import { toast } from 'sonner';
import { Address } from '../types';
import { UserPreferences } from '../services/profileService';



import OrdersSection from '../components/OrdersSection';
import AddressSection from '../components/AddressSection';
import PreferencesSection from '../components/PreferencesSection';
import SecuritySection from '../components/SecuritySection';


const UserProfile: React.FC = () => {
    const { isAuthenticated } = useClerkAuth();
  const { useLanguages } = useConfig();
  const { data: languages, isLoading: languagesLoading, error: languagesError } = useLanguages();
  const { formatPrice } = useCurrency();
  
  // Simple flag emoji function
  const getFlagEmoji = (languageCode: string): string => {
    const countryMap: Record<string, string> = {
      'en': '🇺🇸', 'es': '🇪🇸', 'fr': '🇫🇷', 'de': '🇩🇪', 'it': '🇮🇹', 'pt': '🇵🇹',
      'ru': '🇷🇺', 'zh': '🇨🇳', 'ja': '🇯🇵', 'ko': '🇰🇷', 'ar': '🇸🇦', 'hi': '🇮🇳',
      'ur': '🇵🇰', 'bn': '🇧🇩', 'ta': '🇮🇳', 'te': '🇮🇳', 'mr': '🇮🇳', 'gu': '🇮🇳',
      'kn': '🇮🇳', 'ml': '🇮🇳', 'pa': '🇮🇳', 'th': '🇹🇭', 'vi': '🇻🇳', 'id': '🇮🇩',
      'ms': '🇲🇾', 'fil': '🇵🇭', 'tr': '🇹🇷', 'pl': '🇵🇱', 'nl': '🇳🇱', 'sv': '🇸🇪',
      'no': '🇳🇴', 'da': '🇩🇰', 'fi': '🇫🇮', 'el': '🇬🇷', 'he': '🇮🇱', 'fa': '🇮🇷',
      'hu': '🇭🇺', 'ro': '🇷🇴', 'cs': '🇨🇿', 'sk': '🇸🇰', 'hr': '🇭🇷', 'sl': '🇸🇮',
      'bg': '🇧🇬', 'mk': '🇲🇰', 'sr': '🇷🇸', 'uk': '🇺🇦', 'be': '🇧🇾', 'et': '🇪🇪',
      'lv': '🇱🇻', 'lt': '🇱🇹', 'is': '🇮🇸', 'ga': '🇮🇪', 'cy': '🇬🇧', 'gd': '🇬🇧',
      'mt': '🇲🇹', 'ca': '🇪🇸', 'eu': '🇪🇸', 'gl': '🇪🇸', 'br': '🇫🇷', 'oc': '🇫🇷',
      'co': '🇫🇷', 'sc': '🇮🇹', 'scn': '🇮🇹', 'vec': '🇮🇹', 'lmo': '🇮🇹', 'pms': '🇮🇹',
      'lij': '🇮🇹', 'egl': '🇮🇹', 'rgn': '🇮🇹', 'tus': '🇮🇹', 'umb': '🇮🇹', 'mrc': '🇮🇹',
      'abz': '🇮🇹', 'mol': '🇮🇹', 'pug': '🇮🇹', 'cal': '🇮🇹', 'ap': '🇮🇹', 'sq': '🇦🇱',
      'hy': '🇦🇲', 'ka': '🇬🇪', 'az': '🇦🇿', 'kk': '🇰🇿', 'uz': '🇺🇿', 'ky': '🇰🇬',
      'tg': '🇹🇯', 'tk': '🇹🇲', 'mn': '🇲🇳', 'my': '🇲🇲', 'km': '🇰🇭', 'lo': '🇱🇦',
      'ne': '🇳🇵', 'si': '🇱🇰', 'sd': '🇵🇰', 'ks': '🇮🇳', 'or': '🇮🇳', 'as': '🇮🇳',
      'ku': '🇮🇶', 'ps': '🇦🇫', 'dv': '🇲🇻', 'bo': '🇨🇳', 'ug': '🇨🇳', 'ii': '🇨🇳',
      'am': '🇪🇹', 'ti': '🇪🇷', 'om': '🇪🇹', 'so': '🇸🇴', 'sw': '🇹🇿', 'zu': '🇿🇦',
      'xh': '🇿🇦', 'af': '🇿🇦', 'st': '🇿🇦', 'tn': '🇿🇦', 'ts': '🇿🇦', 've': '🇿🇦',
      'nr': '🇿🇦', 'ss': '🇸🇿', 'sn': '🇿🇼', 'lg': '🇺🇬', 'rw': '🇷🇼', 'ak': '🇬🇭',
      'yo': '🇳🇬', 'ig': '🇳🇬', 'ha': '🇳🇬', 'ff': '🇸🇳', 'wo': '🇸🇳', 'bm': '🇲🇱',
      'dy': '🇲🇱', 'se': '🇳🇴', 'sm': '🇼🇸', 'to': '🇹🇴', 'fj': '🇫🇯', 'mi': '🇳🇿',
      'haw': '🇺🇸', 'qu': '🇵🇪', 'ay': '🇧🇴', 'gn': '🇵🇾', 'ht': '🇭🇹', 'jv': '🇮🇩',
      'su': '🇮🇩', 'ceb': '🇵🇭', 'ilo': '🇵🇭', 'war': '🇵🇭', 'bik': '🇵🇭', 'pam': '🇵🇭',
      'pag': '🇵🇭', 'hil': '🇵🇭', 'kri': '🇸🇱', 'pcm': '🇳🇬', 'jam': '🇯🇲', 'srn': '🇸🇷',
      'tpi': '🇵🇬', 'bi': '🇻🇺', 'ch': '🇬🇺', 'mh': '🇲🇭', 'na': '🇳🇷', 'kl': '🇬🇱',
      'iu': '🇨🇦', 'cr': '🇨🇦', 'oj': '🇨🇦', 'nv': '🇺🇸', 'yi': '🇮🇱', 'lb': '🇱🇺',
      'gsw': '🇨🇭', 'rm': '🇨🇭', 'fur': '🇮🇹', 'lld': '🇮🇹', 'nap': '🇮🇹', 'fo': '🇫🇴',
      'nn': '🇳🇴', 'nb': '🇳🇴', 'prg': '🇵🇱', 'sga': '🇮🇪', 'mga': '🇮🇪', 'pgl': '🇮🇪',
      'xcl': '🇦🇲', 'lrc': '🇮🇷', 'mzn': '🇮🇷', 'glk': '🇮🇷', 'ckb': '🇮🇶', 'sdh': '🇮🇶',
      'lki': '🇮🇷', 'hac': '🇮🇷'
    };
    return countryMap[languageCode.toLowerCase()] || '🌐';
  };
  
  // Mapping functions to convert between frontend and backend codes
  const toBackendLanguageCode = (frontendCode: string): string => {
    const languageMap: Record<string, string> = {
      'en': 'ENGLISH', 'es': 'SPANISH', 'fr': 'FRENCH', 'de': 'GERMAN', 'it': 'ITALIAN',
      'pt': 'PORTUGUESE', 'ru': 'RUSSIAN', 'zh': 'CHINESE', 'ja': 'JAPANESE', 'ko': 'KOREAN',
      'ar': 'ARABIC', 'hi': 'HINDI', 'ur': 'URDU', 'bn': 'BENGALI', 'ta': 'TAMIL',
      'te': 'TELUGU', 'mr': 'MARATHI', 'gu': 'GUJARATI', 'kn': 'KANNADA', 'ml': 'MALAYALAM',
      'pa': 'PUNJABI', 'th': 'THAI', 'vi': 'VIETNAMESE', 'id': 'INDONESIAN', 'ms': 'MALAY',
      'fil': 'FILIPINO', 'tr': 'TURKISH', 'pl': 'POLISH', 'nl': 'DUTCH', 'sv': 'SWEDISH',
      'no': 'NORWEGIAN', 'da': 'DANISH', 'fi': 'FINNISH', 'el': 'GREEK', 'he': 'HEBREW',
      'fa': 'PERSIAN', 'hu': 'HUNGARIAN', 'ro': 'ROMANIAN', 'cs': 'CZECH', 'sk': 'SLOVAK',
      'hr': 'CROATIAN', 'sl': 'SLOVENIAN', 'bg': 'BULGARIAN', 'mk': 'MACEDONIAN',
      'sr': 'SERBIAN', 'uk': 'UKRAINIAN', 'be': 'BELARUSIAN', 'et': 'ESTONIAN',
      'lv': 'LATVIAN', 'lt': 'LITHUANIAN', 'is': 'ICELANDIC', 'ga': 'IRISH',
      'cy': 'WELSH', 'gd': 'SCOTTISH_GAELIC', 'mt': 'MALTESE', 'ca': 'CATALAN',
      'eu': 'BASQUE', 'gl': 'GALICIAN', 'br': 'BRETON', 'oc': 'OCCITAN',
      'co': 'CORSICAN', 'sc': 'SARDINIAN', 'scn': 'SICILIAN', 'vec': 'VENETIAN',
      'lmo': 'LOMBARD', 'pms': 'PIEDMONTESE', 'lij': 'LIGURIAN', 'egl': 'EMILIAN',
      'rgn': 'ROMAGNOL', 'tus': 'TUSCAN', 'umb': 'UMBRIAN', 'mrc': 'MARCHIGIANO',
      'abz': 'ABRUZZESE', 'mol': 'MOLISAN', 'pug': 'PUGLIESE', 'cal': 'CALABRESE',
      'ap': 'APULIAN', 'sq': 'ALBANIAN', 'hy': 'ARMENIAN', 'ka': 'GEORGIAN',
      'az': 'AZERBAIJANI', 'kk': 'KAZAKH', 'uz': 'UZBEK', 'ky': 'KYRGYZ',
      'tg': 'TAJIK', 'tk': 'TURKMEN', 'mn': 'MONGOLIAN', 'my': 'BURMESE',
      'km': 'KHMER', 'lo': 'LAO', 'ne': 'NEPALI', 'si': 'SINHALA',
      'sd': 'SINDHI', 'ks': 'KASHMIRI', 'or': 'ORIYA', 'as': 'ASSAMESE',
      'ku': 'KURDISH', 'ps': 'PASHTO', 'dv': 'DIVEHI', 'bo': 'TIBETAN',
      'ug': 'UYGHUR', 'ii': 'SICHUAN_YI', 'am': 'AMHARIC', 'ti': 'TIGRINYA',
      'om': 'OROMO', 'so': 'SOMALI', 'sw': 'SWAHILI', 'zu': 'ZULU',
      'xh': 'XHOSA', 'af': 'AFRIKAANS', 'st': 'SESOTHO', 'tn': 'TSWANA',
      'ts': 'TSONGA', 've': 'VENDA', 'nr': 'NDEBELE', 'ss': 'SWATI',
      'sn': 'SHONA', 'lg': 'GANDA', 'rw': 'KINYARWANDA', 'ak': 'AKAN',
      'yo': 'YORUBA', 'ig': 'IGBO', 'ha': 'HAUSA', 'ff': 'FULAH',
      'wo': 'WOLOF', 'bm': 'BAMBARA', 'dy': 'DYULA', 'se': 'NORTHERN_SAMI',
      'sm': 'SAMOAN', 'to': 'TONGA', 'fj': 'FIJIAN', 'mi': 'MAORI',
      'haw': 'HAWAIIAN', 'qu': 'QUECHUA', 'ay': 'AYMARA', 'gn': 'GUARANI',
      'ht': 'HAITIAN_CREOLE', 'jv': 'JAVANESE', 'su': 'SUNDANESE',
      'ceb': 'CEBUANO', 'ilo': 'ILOKANO', 'war': 'WARAY', 'bik': 'BICOLANO',
      'pam': 'PAMPANGA', 'pag': 'PANGASINAN', 'hil': 'HILIGAYNON',
      'kri': 'KRIO', 'pcm': 'NIGERIAN_PIDGIN', 'jam': 'JAMAICAN_CREOLE',
      'srn': 'SRANAN_TONGO', 'tpi': 'TOK_PISIN', 'bi': 'BISLAMA',
      'ch': 'CHAMORRO', 'mh': 'MARSHALLESE', 'na': 'NAURUAN',
      'kl': 'GREENLANDIC', 'iu': 'INUKTITUT', 'cr': 'CREE',
      'oj': 'OJIBWA', 'nv': 'NAVAJO', 'yi': 'YIDDISH', 'lb': 'LUXEMBOURGISH',
      'gsw': 'SWISS_GERMAN', 'rm': 'ROMANSH', 'fur': 'FRIULIAN',
      'lld': 'LADIN', 'nap': 'NEAPOLITAN', 'fo': 'FAROESE',
      'nn': 'NORWEGIAN_NYNORSK', 'nb': 'NORWEGIAN_BOKMAL',
      'prg': 'OLD_PRUSSIAN', 'sga': 'OLD_IRISH', 'mga': 'MIDDLE_IRISH',
      'pgl': 'PRIMITIVE_IRISH', 'xcl': 'CLASSICAL_ARMENIAN',
      'lrc': 'NORTHERN_LURI', 'mzn': 'MAZANDERANI', 'glk': 'GILAKI',
      'ckb': 'CENTRAL_KURDISH', 'sdh': 'SOUTHERN_KURDISH',
      'lki': 'LURI', 'hac': 'GURANI'
    };
    return languageMap[frontendCode.toLowerCase()] || 'ENGLISH';
  };

  const toFrontendLanguageCode = (backendCode: string): string => {
    const reverseLanguageMap: Record<string, string> = {
      'ENGLISH': 'en', 'SPANISH': 'es', 'FRENCH': 'fr', 'GERMAN': 'de', 'ITALIAN': 'it',
      'PORTUGUESE': 'pt', 'RUSSIAN': 'ru', 'CHINESE': 'zh', 'JAPANESE': 'ja', 'KOREAN': 'ko',
      'ARABIC': 'ar', 'HINDI': 'hi', 'URDU': 'ur', 'BENGALI': 'bn', 'TAMIL': 'ta',
      'TELUGU': 'te', 'MARATHI': 'mr', 'GUJARATI': 'gu', 'KANNADA': 'kn', 'MALAYALAM': 'ml',
      'PUNJABI': 'pa', 'THAI': 'th', 'VIETNAMESE': 'vi', 'INDONESIAN': 'id', 'MALAY': 'ms',
      'FILIPINO': 'fil', 'TURKISH': 'tr', 'POLISH': 'pl', 'DUTCH': 'nl', 'SWEDISH': 'sv',
      'NORWEGIAN': 'no', 'DANISH': 'da', 'FINNISH': 'fi', 'GREEK': 'el', 'HEBREW': 'he',
      'PERSIAN': 'fa', 'HUNGARIAN': 'hu', 'ROMANIAN': 'ro', 'CZECH': 'cs', 'SLOVAK': 'sk',
      'CROATIAN': 'hr', 'SLOVENIAN': 'sl', 'BULGARIAN': 'bg', 'MACEDONIAN': 'mk',
      'SERBIAN': 'sr', 'UKRAINIAN': 'uk', 'BELARUSIAN': 'be', 'ESTONIAN': 'et',
      'LATVIAN': 'lv', 'LITHUANIAN': 'lt', 'ICELANDIC': 'is', 'IRISH': 'ga',
      'WELSH': 'cy', 'SCOTTISH_GAELIC': 'gd', 'MALTESE': 'mt', 'CATALAN': 'ca',
      'BASQUE': 'eu', 'GALICIAN': 'gl', 'BRETON': 'br', 'OCCITAN': 'oc',
      'CORSICAN': 'co', 'SARDINIAN': 'sc', 'SICILIAN': 'scn', 'VENETIAN': 'vec',
      'LOMBARD': 'lmo', 'PIEDMONTESE': 'pms', 'LIGURIAN': 'lij', 'EMILIAN': 'egl',
      'ROMAGNOL': 'rgn', 'TUSCAN': 'tus', 'UMBRIAN': 'umb', 'MARCHIGIANO': 'mrc',
      'ABRUZZESE': 'abz', 'MOLISAN': 'mol', 'PUGLIESE': 'pug', 'CALABRESE': 'cal',
      'APULIAN': 'ap', 'ALBANIAN': 'sq', 'ARMENIAN': 'hy', 'GEORGIAN': 'ka',
      'AZERBAIJANI': 'az', 'KAZAKH': 'kk', 'UZBEK': 'uz', 'KYRGYZ': 'ky',
      'TAJIK': 'tg', 'TURKMEN': 'tk', 'MONGOLIAN': 'mn', 'BURMESE': 'my',
      'KHMER': 'km', 'LAO': 'lo', 'NEPALI': 'ne', 'SINHALA': 'si',
      'SINDHI': 'sd', 'KASHMIRI': 'ks', 'ORIYA': 'or', 'ASSAMESE': 'as',
      'KURDISH': 'ku', 'PASHTO': 'ps', 'DIVEHI': 'dv', 'TIBETAN': 'bo',
      'UYGHUR': 'ug', 'SICHUAN_YI': 'ii', 'AMHARIC': 'am', 'TIGRINYA': 'ti',
      'OROMO': 'om', 'SOMALI': 'so', 'SWAHILI': 'sw', 'ZULU': 'zu',
      'XHOSA': 'xh', 'AFRIKAANS': 'af', 'SESOTHO': 'st', 'TSWANA': 'tn',
      'TSONGA': 'ts', 'VENDA': 've', 'NDEBELE': 'nr', 'SWATI': 'ss',
      'SHONA': 'sn', 'GANDA': 'lg', 'KINYARWANDA': 'rw', 'AKAN': 'ak',
      'YORUBA': 'yo', 'IGBO': 'ig', 'HAUSA': 'ha', 'FULAH': 'ff',
      'WOLOF': 'wo', 'BAMBARA': 'bm', 'DYULA': 'dy', 'NORTHERN_SAMI': 'se',
      'SAMOAN': 'sm', 'TONGA': 'to', 'FIJIAN': 'fj', 'MAORI': 'mi',
      'HAWAIIAN': 'haw', 'QUECHUA': 'qu', 'AYMARA': 'ay', 'GUARANI': 'gn',
      'HAITIAN_CREOLE': 'ht', 'JAVANESE': 'jv', 'SUNDANESE': 'su',
      'CEBUANO': 'ceb', 'ILOKANO': 'ilo', 'WARAY': 'war', 'BICOLANO': 'bik',
      'PAMPANGA': 'pam', 'PANGASINAN': 'pag', 'HILIGAYNON': 'hil',
      'KRIO': 'kri', 'NIGERIAN_PIDGIN': 'pcm', 'JAMAICAN_CREOLE': 'jam',
      'SRANAN_TONGO': 'srn', 'TOK_PISIN': 'tpi', 'BISLAMA': 'bi',
      'CHAMORRO': 'ch', 'MARSHALLESE': 'mh', 'NAURUAN': 'na',
      'GREENLANDIC': 'kl', 'INUKTITUT': 'iu', 'CREE': 'cr',
      'OJIBWA': 'oj', 'NAVAJO': 'nv', 'YIDDISH': 'yi', 'LUXEMBOURGISH': 'lb',
      'SWISS_GERMAN': 'gsw', 'ROMANSH': 'rm', 'FRIULIAN': 'fur',
      'LADIN': 'lld', 'NEAPOLITAN': 'nap', 'FAROESE': 'fo',
      'NORWEGIAN_NYNORSK': 'nn', 'NORWEGIAN_BOKMAL': 'nb',
      'OLD_PRUSSIAN': 'prg', 'OLD_IRISH': 'sga', 'MIDDLE_IRISH': 'mga',
      'PRIMITIVE_IRISH': 'pgl', 'CLASSICAL_ARMENIAN': 'xcl',
      'NORTHERN_LURI': 'lrc', 'MAZANDERANI': 'mzn', 'GILAKI': 'glk',
      'CENTRAL_KURDISH': 'ckb', 'SOUTHERN_KURDISH': 'sdh',
      'LURI': 'lki', 'GURANI': 'hac'
    };
    return reverseLanguageMap[backendCode] || 'en';
  };

  const toBackendCurrencyCode = (frontendCode: string): string => {
    const currencyMap: Record<string, string> = {
      'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP', 'JPY': 'JPY', 'CNY': 'CNY',
      'INR': 'INR', 'PKR': 'PKR', 'CAD': 'CAD', 'AUD': 'AUD', 'CHF': 'CHF',
      'SEK': 'SEK', 'NOK': 'NOK', 'DKK': 'DKK', 'PLN': 'PLN', 'CZK': 'CZK',
      'HUF': 'HUF', 'RUB': 'RUB', 'TRY': 'TRY', 'BRL': 'BRL', 'MXN': 'MXN',
      'ARS': 'ARS', 'CLP': 'CLP', 'COP': 'COP', 'PEN': 'PEN', 'UYU': 'UYU',
      'VND': 'VND', 'THB': 'THB', 'MYR': 'MYR', 'SGD': 'SGD', 'HKD': 'HKD',
      'KRW': 'KRW', 'TWD': 'TWD', 'PHP': 'PHP', 'IDR': 'IDR', 'ZAR': 'ZAR',
      'EGP': 'EGP', 'NGN': 'NGN', 'KES': 'KES', 'GHS': 'GHS', 'MAD': 'MAD',
      'TND': 'TND', 'AED': 'AED', 'SAR': 'SAR', 'QAR': 'QAR', 'KWD': 'KWD',
      'BHD': 'BHD', 'OMR': 'OMR', 'JOD': 'JOD', 'LBP': 'LBP', 'ILS': 'ILS',
      'IRR': 'IRR', 'AFN': 'AFN', 'BDT': 'BDT', 'LKR': 'LKR', 'NPR': 'NPR',
      'MMK': 'MMK', 'KHR': 'KHR', 'LAK': 'LAK', 'MNT': 'MNT', 'KZT': 'KZT',
      'UZS': 'UZS', 'TJS': 'TJS', 'TMT': 'TMT', 'AZN': 'AZN', 'GEL': 'GEL',
      'AMD': 'AMD', 'BYN': 'BYN', 'MDL': 'MDL', 'UAH': 'UAH', 'RON': 'RON',
      'BGN': 'BGN', 'HRK': 'HRK', 'RSD': 'RSD', 'MKD': 'MKD', 'ALL': 'ALL',
      'XCD': 'XCD', 'BBD': 'BBD', 'JMD': 'JMD', 'TTD': 'TTD', 'BZD': 'BZD',
      'GTQ': 'GTQ', 'HNL': 'HNL', 'NIO': 'NIO', 'CRC': 'CRC', 'PAB': 'PAB',
      'BOB': 'BOB', 'PYG': 'PYG', 'GYD': 'GYD', 'SRD': 'SRD', 'FJD': 'FJD',
      'PGK': 'PGK', 'WST': 'WST', 'TOP': 'TOP', 'VUV': 'VUV', 'SBD': 'SBD',
      'KID': 'KID', 'TVD': 'TVD'
    };
    return currencyMap[frontendCode.toUpperCase()] || 'USD';
  };

  const toFrontendCurrencyCode = (backendCode: string): string => {
    const reverseCurrencyMap: Record<string, string> = {
      'USD': 'USD', 'EUR': 'EUR', 'GBP': 'GBP', 'JPY': 'JPY', 'CNY': 'CNY',
      'INR': 'INR', 'PKR': 'PKR', 'CAD': 'CAD', 'AUD': 'AUD', 'CHF': 'CHF',
      'SEK': 'SEK', 'NOK': 'NOK', 'DKK': 'DKK', 'PLN': 'PLN', 'CZK': 'CZK',
      'HUF': 'HUF', 'RUB': 'RUB', 'TRY': 'TRY', 'BRL': 'BRL', 'MXN': 'MXN',
      'ARS': 'ARS', 'CLP': 'CLP', 'COP': 'COP', 'PEN': 'PEN', 'UYU': 'UYU',
      'VND': 'VND', 'THB': 'THB', 'MYR': 'MYR', 'SGD': 'SGD', 'HKD': 'HKD',
      'KRW': 'KRW', 'TWD': 'TWD', 'PHP': 'PHP', 'IDR': 'IDR', 'ZAR': 'ZAR',
      'EGP': 'EGP', 'NGN': 'NGN', 'KES': 'KES', 'GHS': 'GHS', 'MAD': 'MAD',
      'TND': 'TND', 'AED': 'AED', 'SAR': 'SAR', 'QAR': 'QAR', 'KWD': 'KWD',
      'BHD': 'BHD', 'OMR': 'OMR', 'JOD': 'JOD', 'LBP': 'LBP', 'ILS': 'ILS',
      'IRR': 'IRR', 'AFN': 'AFN', 'BDT': 'BDT', 'LKR': 'LKR', 'NPR': 'NPR',
      'MMK': 'MMK', 'KHR': 'KHR', 'LAK': 'LAK', 'MNT': 'MNT', 'KZT': 'KZT',
      'UZS': 'UZS', 'TJS': 'TJS', 'TMT': 'TMT', 'AZN': 'AZN', 'GEL': 'GEL',
      'AMD': 'AMD', 'BYN': 'BYN', 'MDL': 'MDL', 'UAH': 'UAH', 'RON': 'RON',
      'BGN': 'BGN', 'HRK': 'HRK', 'RSD': 'RSD', 'MKD': 'MKD', 'ALL': 'ALL',
      'XCD': 'XCD', 'BBD': 'BBD', 'JMD': 'JMD', 'TTD': 'TTD', 'BZD': 'BZD',
      'GTQ': 'GTQ', 'HNL': 'HNL', 'NIO': 'NIO', 'CRC': 'CRC', 'PAB': 'PAB',
      'BOB': 'BOB', 'PYG': 'PYG', 'GYD': 'GYD', 'SRD': 'SRD', 'FJD': 'FJD',
      'PGK': 'PGK', 'WST': 'WST', 'TOP': 'TOP', 'VUV': 'VUV', 'SBD': 'SBD',
      'KID': 'KID', 'TVD': 'TVD'
    };
    return reverseCurrencyMap[backendCode] || 'USD';
  };
  
  const [activeTab, setActiveTab] = useState<string>('orders');
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 3;
  
  // Utility function to safely convert Decimal values to numbers
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    if (value && typeof value === 'object' && 'toNumber' in value) return value.toNumber();
    return 0;
  };

  // Use React Query hooks
  const {
    useOrders,
    useOrderDetails,
    useAddresses,
    usePaymentMethods,
    usePreferences,
    useSessions,
    useUpdatePreferences,
    useDeleteAddress,

    useAddAddress,
    useUpdateAddress,
    useRevokeSession,
  } = useProfile();

  const {
    useCurrencies,
    useCountries,
  } = useConfig();

  // Data queries
  const { data: ordersData, isLoading: ordersLoading, error: ordersError } = useOrders(currentPage, ordersPerPage);
  const { data: addresses = [], isLoading: addressesLoading, error: addressesError } = useAddresses();
  const { isLoading: paymentLoading, error: paymentError } = usePaymentMethods();
  const { data: preferences, isLoading: preferencesLoading, error: preferencesError } = usePreferences();
  const { data: sessions = [], isLoading: sessionsLoading, error: sessionsError } = useSessions();
  
  // Configuration data queries
  const { data: currencies = [], isLoading: currenciesLoading, error: currenciesError } = useCurrencies();
  const { data: countries = [], isLoading: countriesLoading, error: countriesError } = useCountries();
  
  // Timezone data
  const timezones = timezoneService.getAvailableTimezones();

  // Extract orders and pagination data
  const orders = ordersData?.orders || [];
  const pagination = ordersData?.pagination;

  // Pagination calculations
  const totalPages = pagination?.pages || 1;
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + orders.length;

  // Only reset page when total pages decrease (e.g., due to order deletion)
  // This prevents the page jumping issue during normal pagination
  useEffect(() => {
    if (pagination?.pages && currentPage > pagination.pages) {
      setCurrentPage(pagination.pages);
    }
  }, [pagination?.pages, currentPage]); // Include currentPage dependency

  // Custom page change handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Mutations
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAddressMutation = useDeleteAddress();

  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const revokeSessionMutation = useRevokeSession();

  // State for preferences
  const [localPreferences, setLocalPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    smsNotifications: true,
    marketingEmails: false,
    orderUpdates: true,
    promotionalOffers: false,
    newsletter: false,
    language: 'en', // Default to English
    currency: 'USD', // Default to USD
    timezone: timezoneService.getBrowserTimezone()
  });
  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState(false);

  // State for payment methods
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Update local preferences when backend data loads
  useEffect(() => {
    if (preferences && preferences.id) {
      // Create new preferences object with defaults for missing values
      const updatedPreferences = {
        emailNotifications: preferences.emailNotifications ?? true,
        smsNotifications: preferences.smsNotifications ?? true,
        marketingEmails: preferences.marketingEmails ?? false,
        orderUpdates: preferences.orderUpdates ?? true,
        promotionalOffers: preferences.promotionalOffers ?? false,
        newsletter: preferences.newsletter ?? false,
        language: preferences.language ? toFrontendLanguageCode(preferences.language) : 'en',
        currency: preferences.currency ? toFrontendCurrencyCode(preferences.currency) : 'USD',
        timezone: preferences.timezone || timezoneService.getBrowserTimezone()
      };
      setLocalPreferences(updatedPreferences);
      toast.success('Preferences loaded successfully!');
    }
  }, [preferences]);


  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in</h1>
          <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (ordersLoading || addressesLoading || paymentLoading || preferencesLoading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <Loader2 className="h-8 w-8 mx-auto mb-4 animate-spin" />
          <p>Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (ordersError || addressesError || paymentError || preferencesError) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto text-center">
          <p className="text-red-500">Failed to load user data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            My Account
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            Manage your orders, addresses, and preferences
          </p>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-6 sm:mb-8">
            <TabsTrigger value="orders" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <ShoppingBag className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
                          <TabsTrigger value="addresses" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Addresses</span>
                <span className="sm:hidden">Addr</span>
              </TabsTrigger>

            <TabsTrigger value="preferences" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Settings className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Preferences</span>
              <span className="sm:hidden">Prefs</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center gap-1 sm:gap-2 text-xs sm:text-sm">
              <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Security</span>
              <span className="sm:hidden">Sec</span>
            </TabsTrigger>

          </TabsList>

          {/* Orders Tab */}
                  <TabsContent value="orders" className="space-y-6">
          <OrdersSection
            orders={orders}
            ordersLoading={ordersLoading}
            pagination={pagination}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            useOrderDetails={useOrderDetails}
          />
        </TabsContent>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <AddressSection
              addresses={addresses}
              addressesLoading={addressesLoading}
              addressesError={addressesError}
              addAddressMutation={addAddressMutation}
              updateAddressMutation={updateAddressMutation}
              deleteAddressMutation={deleteAddressMutation}
              countries={countries}
            />
          </TabsContent>



                    {/* Enhanced Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <PreferencesSection
              preferences={preferences}
              localPreferences={localPreferences}
              setLocalPreferences={setLocalPreferences}
              updatePreferencesMutation={updatePreferencesMutation}
              languages={languages}
              languagesLoading={languagesLoading}
              languagesError={languagesError}
              currencies={currencies}
              currenciesLoading={currenciesLoading}
              currenciesError={currenciesError}
              timezones={timezones}
              getFlagEmoji={getFlagEmoji}
              toBackendLanguageCode={toBackendLanguageCode}
              toBackendCurrencyCode={toBackendCurrencyCode}
            />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <SecuritySection
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              sessionsError={sessionsError}
              revokeSessionMutation={revokeSessionMutation}
            />
          </TabsContent>


        </Tabs>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-sm text-muted-foreground">Total Orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">12</p>
              <p className="text-sm text-muted-foreground">Wishlist Items</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-2xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </CardContent>
          </Card>
                      <Card>
              <CardContent className="p-4 text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">{addresses.length}</p>
                <p className="text-sm text-muted-foreground">Saved Addresses</p>
              </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
