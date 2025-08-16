import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { ImageWithPlaceholder } from '../components/ui/image-with-placeholder';
import { 
  User, 
  Settings, 
  ShoppingBag, 
  MapPin, 
  CreditCard,
  Shield, 
  CheckCircle, 
  Truck, 
  Package, 
  Edit, 
  Trash2, 
  Plus, 
  Star,
  Clock,
  Loader2,
  Calendar,
  Mail,
  Phone,
  ChevronLeft,
  ChevronRight,
  Globe,
  Zap
} from 'lucide-react';
import { useClerkAuth } from '../hooks/useClerkAuth';
import { useProfile } from '../hooks/useProfile';
import { useConfig } from '../hooks/useConfig';
import { timezoneService } from '../services/timezoneService';


import { toast } from 'sonner';
import { Address } from '../types';
import { Order, OrderItem, PaymentMethod, UserPreferences, UserSession } from '../services/profileService';
import { Label } from '../components/ui/label';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { SearchableSelect } from '../components/ui/searchable-select';

import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';

import OrderTrackingModal from '../components/OrderTrackingModal';


const UserProfile: React.FC = () => {
    const { isAuthenticated } = useClerkAuth();
  const { useLanguages } = useConfig();
  const { data: languages, isLoading: languagesLoading, error: languagesError } = useLanguages();
  
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
  
  // Order detail view state
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false);
  
  // Tracking modal state
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);
  const [trackingOrderId, setTrackingOrderId] = useState<number | null>(null);
  const [trackingOrderNumber, setTrackingOrderNumber] = useState<string>('');
  
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


  
  // Address form state
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressToDelete, setAddressToDelete] = useState<Address | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [addressToView, setAddressToView] = useState<Address | null>(null);
  const [isAddressDetailOpen, setIsAddressDetailOpen] = useState(false);
  const [addressForm, setAddressForm] = useState({
    type: 'SHIPPING' as 'SHIPPING' | 'BILLING',
    isDefault: false,
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    phone: ''
  });

  // Use React Query hooks
  const {
    useOrders,
    useAddresses,
    usePaymentMethods,
    usePreferences,
    useSessions,
    useUpdatePreferences,
    useDeleteAddress,
    useDeletePaymentMethod,
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
  const { data: paymentMethods = [], isLoading: paymentLoading, error: paymentError } = usePaymentMethods();
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
  }, [pagination?.pages]); // Only depend on total pages, not current page

  // Custom page change handlers
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Mutations
  const updatePreferencesMutation = useUpdatePreferences();
  const deleteAddressMutation = useDeleteAddress();
  const deletePaymentMethodMutation = useDeletePaymentMethod();
  const addAddressMutation = useAddAddress();
  const updateAddressMutation = useUpdateAddress();
  const revokeSessionMutation = useRevokeSession();

  // Local state for form inputs
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

  // Update default country when countries load
  useEffect(() => {
    if (countries.length > 0 && !editingAddress) {
      // Find the default country (US) or use the first available country
      const defaultCountry = countries.find(c => c.isDefault) || countries[0];
      if (defaultCountry && addressForm.country !== defaultCountry.code) {
        setAddressForm(prev => ({
          ...prev,
          country: defaultCountry.code
        }));
      }
    }
  }, [countries, editingAddress]);
  


  // Handle opening order detail view
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderDetailOpen(true);
  };

  // Handle closing order detail view
  const handleCloseOrderDetails = () => {
    setIsOrderDetailOpen(false);
    setSelectedOrder(null);
  };

  const handleOpenTracking = (orderId: number, orderNumber: string) => {
    setTrackingOrderId(orderId);
    setTrackingOrderNumber(orderNumber);
    setIsTrackingModalOpen(true);
  };

  const handleCloseTracking = () => {
    setIsTrackingModalOpen(false);
    setTrackingOrderId(null);
    setTrackingOrderNumber('');
  };

  const resetAddressForm = () => {
    setAddressForm({
      type: 'SHIPPING',
      isDefault: false,
      firstName: '',
      lastName: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: countries.length > 0 ? countries[0].code : 'US',
      phone: ''
    });
    setEditingAddress(null);
  };

  const openAddAddressModal = () => {
    resetAddressForm();
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = (address: Address) => {
    setAddressForm({
      type: address.type,
      isDefault: address.isDefault,
      firstName: address.firstName,
      lastName: address.lastName,
      company: address.company || '',
      address1: address.address1,
      address2: address.address2 || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country,
      phone: address.phone
    });
    setEditingAddress(address);
    setIsAddressModalOpen(true);
  };

  const closeAddressModal = () => {
    setIsAddressModalOpen(false);
    resetAddressForm();
  };

  const handleAddressFormChange = (field: string, value: string | boolean) => {
    setAddressForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingAddress) {
      // Update existing address
      updateAddressMutation.mutate({
        addressId: editingAddress.id,
        address: addressForm
      }, {
        onSuccess: () => {
          closeAddressModal();
        }
      });
    } else {
      // Add new address
      addAddressMutation.mutate(addressForm, {
        onSuccess: () => {
          closeAddressModal();
        }
      });
    }
  };



  const handleEditAddress = async (addressId: number) => {
    const address = addresses.find((addr: Address) => addr.id === addressId);
    if (address) {
      openEditAddressModal(address);
    }
  };



  const confirmDeleteAddress = (address: Address) => {
    setAddressToDelete(address);
    setIsDeleteDialogOpen(true);
  };

  const openAddressDetail = (address: Address) => {
    setAddressToView(address);
    setIsAddressDetailOpen(true);
  };

  const executeDeleteAddress = async () => {
    if (addressToDelete) {
      deleteAddressMutation.mutate(addressToDelete.id);
      setIsDeleteDialogOpen(false);
      setAddressToDelete(null);
    }
  };

  const handleAddPaymentMethod = async () => {
    toast.info('Add payment method functionality coming soon');
  };

  const handleEditPaymentMethod = async (methodId: number) => {
    toast.info(`Edit payment method ${methodId} functionality coming soon`);
  };

  const handleDeletePaymentMethod = async (methodId: number) => {
    deletePaymentMethodMutation.mutate(methodId);
  };

  const handleSavePreferences = async () => {
    if (!localPreferences) {
      toast.error('No preferences to save');
      return;
    }

    // Validate required fields
    if (!localPreferences.currency) {
      toast.error('Please select a currency');
      return;
    }

    // Convert frontend codes to backend codes for API
    const backendPreferences = {
      ...localPreferences,
      language: localPreferences.language ? toBackendLanguageCode(localPreferences.language) : 'ENGLISH',
      currency: localPreferences.currency ? toBackendCurrencyCode(localPreferences.currency) : 'USD'
    };

    updatePreferencesMutation.mutate(backendPreferences, {
      onSuccess: () => {
        toast.success('Preferences saved successfully!');
      },
      onError: (error) => {
        console.error('Error saving preferences:', error);
        toast.error('Failed to save preferences. Please try again.');
      }
    });
  };

  const handleRevokeSession = async (sessionId: number) => {
    try {
      await revokeSessionMutation.mutateAsync(sessionId);
      toast.success('Session revoked successfully');
    } catch (error) {
      toast.error('Failed to revoke session. Please try again.');
    }
  };

  const formatDeviceInfo = (deviceInfo: string) => {
    // Parse device info from backend and format it nicely
    try {
      const info = JSON.parse(deviceInfo);
      return `${info.browser || 'Unknown Browser'} on ${info.os || 'Unknown OS'}`;
    } catch {
      return deviceInfo || 'Unknown Device';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      delivered: { variant: 'default' as const, icon: CheckCircle, text: 'Delivered' },
      shipped: { variant: 'secondary' as const, icon: Truck, text: 'Shipped' },
      processing: { variant: 'secondary' as const, icon: Package, text: 'Processing' },
      cancelled: { variant: 'destructive' as const, icon: Clock, text: 'Cancelled' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.processing;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.text}
      </Badge>
    );
  };

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
            <Card className="border-0 shadow-sm bg-transparent">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ShoppingBag className="h-5 w-5 text-blue-600" />
                  </div>
                  Order History
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                {ordersLoading ? (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                      <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading orders...</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">Please wait while we fetch your order history</p>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">Start shopping to see your order history and track your purchases</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order: Order) => (
                      <div key={order.id} className="bg-white border-0 shadow-lg rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
                        {/* Decorative gradient border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl"></div>
                        <div className="relative z-10">
                          {/* Enhanced Mobile-first responsive layout */}
                          <div className="space-y-5 sm:space-y-6">
                            {/* Order Header - Enhanced with better visual hierarchy */}
                            <div className="flex flex-col gap-4">
                              {/* Order Number and Status Row */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-3">
                                    <div className="flex items-center gap-2">
                                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                        <ShoppingBag className="h-4 w-4 text-white" />
                                      </div>
                                      <h4 className="font-bold text-lg sm:text-xl text-gray-900 truncate bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        {order.orderNumber}
                                      </h4>
                                    </div>
                                    <div className="flex-shrink-0">{getStatusBadge(order.status)}</div>
                                  </div>
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                    <p>
                                      {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                      })}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-left sm:text-right">
                                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-3 rounded-xl text-white">
                                    <p className="font-bold text-2xl sm:text-3xl">${toNumber(order.total).toFixed(2)}</p>
                                    <p className="text-sm font-medium opacity-90">{order.currency}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            {/* Enhanced Order Summary - Beautiful gradient cards */}
                            <div className="grid grid-cols-3 gap-3 sm:gap-4">
                              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200 text-center transform hover:scale-105 transition-transform duration-200">
                                <div className="p-2 bg-blue-500 rounded-lg w-fit mx-auto mb-2">
                                  <Package className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xs sm:text-sm text-blue-700 font-semibold mb-1">Items</p>
                                <p className="font-bold text-lg sm:text-xl text-blue-900">{order.items?.length || 0}</p>
                                <p className="text-xs text-blue-600">products</p>
                              </div>
                              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200 text-center transform hover:scale-105 transition-transform duration-200">
                                <div className="p-2 bg-green-500 rounded-lg w-fit mx-auto mb-2">
                                  <Truck className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xs sm:text-sm text-green-700 font-semibold mb-1">Shipping</p>
                                <p className="font-bold text-lg sm:text-xl text-green-900">${toNumber(order.shipping).toFixed(2)}</p>
                                <p className="text-xs text-green-600">cost</p>
                              </div>
                              <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200 text-center transform hover:scale-105 transition-transform duration-200">
                                <div className="p-2 bg-purple-500 rounded-lg w-fit mx-auto mb-2">
                                  <CreditCard className="h-4 w-4 text-white" />
                                </div>
                                <p className="text-xs sm:text-sm text-purple-700 font-semibold mb-1">Payment</p>
                                <p className="font-bold text-lg sm:text-xl text-purple-900">{order.paymentStatus}</p>
                                <p className="text-xs text-purple-600">status</p>
                              </div>
                            </div>
                            
                            {/* Enhanced Order Items Preview */}
                            <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-5 rounded-xl">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <span className="text-base font-bold text-gray-800">Order Items</span>
                              </div>
                              <div className="space-y-3">
                                {order.items?.slice(0, 3).map((item: OrderItem) => (
                                  <div key={item.id} className="flex items-center gap-4 p-3 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    {item.product?.images?.[0]?.url ? (
                                      <ImageWithPlaceholder
                                        src={item.product.images[0].url}
                                        alt={item.productName}
                                        className="w-12 h-12 sm:w-14 sm:h-14 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-200 to-gray-300 rounded-xl flex items-center justify-center border-2 border-gray-200 shadow-sm">
                                        <Package className="h-6 w-6 text-gray-500" />
                                      </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">{item.productName}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-500">Quantity:</span>
                                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">{item.quantity}</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {order.items && order.items.length > 3 && (
                                  <div className="text-center p-3">
                                    <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 text-sm font-medium rounded-full">
                                      <Plus className="h-4 w-4" />
                                      {order.items.length - 3} more items
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            {/* Enhanced Shipping Address Preview */}
                            {order.shippingFirstName && (
                              <div className="bg-gradient-to-r from-green-50 to-emerald-100 border border-green-200 p-5 rounded-xl">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
                                    <MapPin className="h-5 w-5 text-white" />
                                  </div>
                                  <span className="text-base font-bold text-gray-800">Shipping Address</span>
                                </div>
                                <div className="space-y-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <p className="text-sm font-semibold text-gray-900">
                                      {order.shippingFirstName} {order.shippingLastName}
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                    <p className="text-sm text-gray-700">
                                      {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            {/* Enhanced Action Buttons */}
                            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleViewOrderDetails(order)}
                                className="flex-1 h-11 sm:h-9 font-medium"
                              >
                                <Package className="h-4 w-4 mr-2" />
                                View Details
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleOpenTracking(order.id, order.orderNumber)}
                                className="flex-1 h-11 sm:h-9 font-medium"
                              >
                                <Truck className="h-4 w-4 mr-2" />
                                Track Order
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                          {/* Page Info */}
                          <div className="text-sm text-gray-600">
                            Showing {startIndex + 1} to {endIndex} of {pagination?.total || 0} orders
                          </div>
                          
                          {/* Pagination Buttons */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                              disabled={currentPage === 1 || ordersLoading}
                              className="px-3 py-2"
                            >
                              {ordersLoading ? (
                                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                              ) : (
                                <ChevronLeft className="h-4 w-4 mr-1" />
                              )}
                              Previous
                            </Button>
                            
                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                              {Array.from({ length: totalPages }, (_, index) => {
                                const pageNumber = index + 1;
                                // Show first page, last page, current page, and pages around current
                                if (
                                  pageNumber === 1 ||
                                  pageNumber === totalPages ||
                                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                                ) {
                                  return (
                                    <Button
                                      key={pageNumber}
                                      variant={currentPage === pageNumber ? "default" : "outline"}
                                      size="sm"
                                      onClick={() => handlePageChange(pageNumber)}
                                      disabled={ordersLoading}
                                      className="w-10 h-10 p-0"
                                    >
                                      {pageNumber}
                                    </Button>
                                  );
                                } else if (
                                  pageNumber === currentPage - 2 ||
                                  pageNumber === currentPage + 2
                                ) {
                                  return (
                                    <span key={pageNumber} className="px-2 text-gray-400">
                                      ...
                                    </span>
                                  );
                                }
                                return null;
                              })}
                            </div>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                              disabled={currentPage === totalPages || ordersLoading}
                              className="px-3 py-2"
                            >
                              Next
                              {ordersLoading ? (
                                <Loader2 className="h-4 w-4 ml-1 animate-spin" />
                              ) : (
                                <ChevronRight className="h-4 w-4 ml-1" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Order Detail Modal */}
          <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
            <DialogContent className="max-w-[95vw] sm:max-w-4xl lg:max-w-6xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-white to-blue-50">
              {/* Enhanced Header */}
              <DialogHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-4 sm:p-6 rounded-t-lg">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="p-2 sm:p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                      <Package className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                    </div>
                    <div>
                      <DialogTitle className="text-xl sm:text-2xl font-bold text-white">
                        Order Details
                      </DialogTitle>
                      <p className="text-blue-100 text-base sm:text-lg font-medium">#{selectedOrder?.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <div className="text-sm text-blue-100">Order Date</div>
                    <div className="font-semibold text-sm sm:text-base">
                      {selectedOrder && new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              {selectedOrder && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                  {/* Enhanced Order Overview Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="p-1.5 sm:p-2 bg-blue-500 rounded-lg">
                            <Package className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-blue-700">Status</span>
                        </div>
                        <div className="text-sm sm:text-lg font-bold text-blue-900">
                          {getStatusBadge(selectedOrder.status)}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="p-1.5 sm:p-2 bg-green-500 rounded-lg">
                            <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-green-700">Payment</span>
                        </div>
                        <div className="text-sm sm:text-lg font-bold text-green-900">
                          {selectedOrder.paymentStatus}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="p-1.5 sm:p-2 bg-purple-500 rounded-lg">
                            <Truck className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-purple-700">Tracking</span>
                        </div>
                        <div className="text-xs sm:text-lg font-bold text-purple-900 font-mono">
                          {selectedOrder.trackingNumber || 'Not available'}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-orange-100 border border-orange-200">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="p-1.5 sm:p-2 bg-orange-500 rounded-lg">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                          </div>
                          <span className="text-xs sm:text-sm font-medium text-orange-700">Items</span>
                        </div>
                        <div className="text-sm sm:text-lg font-bold text-orange-900">
                          {selectedOrder.items?.length || 0} items
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Enhanced Price Breakdown */}
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                          <CheckCircle className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Price Breakdown</h3>
                      </div>
                      
                      <div className="space-y-3 sm:space-y-4">
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 text-sm sm:text-base">Subtotal</span>
                          <span className="font-medium text-sm sm:text-base">${toNumber(selectedOrder.subtotal).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 text-sm sm:text-base">Tax</span>
                          <span className="font-medium text-sm sm:text-base">${toNumber(selectedOrder.tax).toFixed(2)}</span>
                        </div>
                        
                        <div className="flex justify-between items-center py-2">
                          <span className="text-gray-600 text-sm sm:text-base">Shipping</span>
                          <span className="font-medium text-sm sm:text-base">${toNumber(selectedOrder.shipping).toFixed(2)}</span>
                        </div>
                        
                        {toNumber(selectedOrder.discount) > 0 && (
                          <div className="flex justify-between items-center py-2 bg-green-50 p-3 rounded-lg border border-green-200">
                            <span className="text-green-700 font-medium flex items-center gap-2 text-sm sm:text-base">
                              <CheckCircle className="h-4 w-4" />
                              Discount Applied
                            </span>
                            <span className="text-green-700 font-bold text-base sm:text-lg">
                              -${toNumber(selectedOrder.discount).toFixed(2)}
                            </span>
                          </div>
                        )}
                        
                        <hr className="my-3 sm:my-4" />
                        
                        <div className="flex justify-between items-center py-3 bg-gradient-to-r from-blue-50 to-purple-50 p-3 sm:p-4 rounded-lg border border-blue-200">
                          <span className="text-lg sm:text-xl font-bold text-gray-900">Total</span>
                          <span className="text-xl sm:text-2xl font-bold text-blue-600">
                            ${toNumber(selectedOrder.total).toFixed(2)} {selectedOrder.currency}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Clean Order Items Section */}
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order Items</h3>
                        <Badge variant="outline" className="ml-auto bg-blue-50 text-blue-700 border-blue-200 text-xs sm:text-sm">
                          {selectedOrder.items?.length || 0} items
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {selectedOrder.items?.map((item: OrderItem) => (
                          <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-md transition-all duration-200">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                              {/* Product Image */}
                              <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border border-gray-200 mx-auto sm:mx-0">
                                {item.product?.images?.[0]?.url ? (
                                  <ImageWithPlaceholder
                                    src={item.product.images[0].url}
                                    alt={item.productName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                    <Package className="h-6 w-6 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              
                              {/* Product Details */}
                              <div className="flex-1 min-w-0 text-center sm:text-left">
                                <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1 truncate">
                                  {item.productName}
                                </h4>
                                
                                {/* Product Attributes - Only show if they exist */}
                                {(item.size || item.color || item.productSku) && (
                                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-2">
                                    {item.size && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                        Size: {item.size}
                                      </span>
                                    )}
                                    {item.color && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                                        Color: {item.color}
                                      </span>
                                    )}
                                    {item.productSku && (
                                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                                        SKU: {item.productSku}
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                {/* Price and Quantity Info */}
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3">
                                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs sm:text-sm text-gray-600">
                                    <span className="flex items-center gap-1">
                                      <Package className="h-3 w-3" />
                                      Qty: {item.quantity}
                                    </span>
                                    <span className="text-gray-500">•</span>
                                    <span>${toNumber(item.price).toFixed(2)} each</span>
                                  </div>
                                  
                                  {/* Total Price */}
                                  <div className="text-center sm:text-right">
                                    <div className="text-base sm:text-lg font-bold text-blue-600">
                                      ${toNumber(item.total).toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Enhanced Customer Information */}
                  <Card className="border-0 shadow-xl bg-white">
                    <CardContent className="p-4 sm:p-6">
                      <div className="flex items-center gap-3 mb-4 sm:mb-6">
                        <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-lg">
                          <User className="h-5 w-5 text-white" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900">Customer Information</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-6">
                        {/* Contact Details */}
                        <div className="space-y-3 sm:space-y-4">
                          <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-3">Contact Details</h4>
                          
                          {selectedOrder.user?.email && (
                            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                              <div className="p-2 bg-blue-500 rounded-lg">
                                <Mail className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-blue-700 font-medium">Email Address</p>
                                <p className="text-gray-900 font-semibold text-sm sm:text-base break-all">{selectedOrder.user.email}</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedOrder.shippingPhone && (
                            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                              <div className="p-2 bg-green-500 rounded-lg">
                                <Phone className="h-4 w-4 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-green-700 font-medium">Phone Number</p>
                                <p className="text-gray-900 font-semibold text-sm sm:text-base">{selectedOrder.shippingPhone}</p>
                                <p className="text-xs text-green-600 mt-1">For delivery updates & calls</p>
                              </div>
                            </div>
                          )}
                          
                          {selectedOrder.user?.name && (
                            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                              <div className="p-2 bg-purple-500 rounded-lg">
                                <User className="h-5 w-5 text-white" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm text-purple-700 font-medium">Customer Name</p>
                                <p className="text-gray-900 font-semibold text-sm sm:text-base">{selectedOrder.user.name}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Shipping Address */}
                        {selectedOrder.shippingFirstName && (
                          <div className="space-y-3 sm:space-y-4">
                            <h4 className="font-semibold text-gray-800 text-base sm:text-lg mb-3">Shipping Address</h4>
                            
                            <div className="p-3 sm:p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl border border-gray-200">
                              <div className="flex items-start gap-3 mb-3">
                                <div className="p-2 bg-blue-500 rounded-lg mt-1">
                                  <MapPin className="h-4 w-4 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-base sm:text-lg text-gray-900 mb-2">
                                    {selectedOrder.shippingFirstName} {selectedOrder.shippingLastName}
                                  </p>
                                  
                                  {selectedOrder.shippingCompany && (
                                    <p className="text-gray-700 font-medium mb-2 text-sm sm:text-base">
                                      {selectedOrder.shippingCompany}
                                    </p>
                                  )}
                                  
                                  <div className="space-y-1 text-gray-600 text-sm sm:text-base">
                                    <p className="break-words">{selectedOrder.shippingAddress1}</p>
                                    {selectedOrder.shippingAddress2 && (
                                      <p className="text-gray-500 break-words">{selectedOrder.shippingAddress2}</p>
                                    )}
                                    <p>
                                      {selectedOrder.shippingCity}, {selectedOrder.shippingState} {selectedOrder.shippingPostalCode}
                                    </p>
                                    <p className="font-medium">{selectedOrder.shippingCountry}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Order Notes */}
                  {selectedOrder.notes && (
                    <Card className="border-0 shadow-xl bg-white">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg">
                            <Package className="h-5 w-5 text-white" />
                          </div>
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Order Notes</h3>
                        </div>
                        <div className="p-3 sm:p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                          <p className="text-gray-800 text-sm sm:text-base break-words">{selectedOrder.notes}</p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Enhanced Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                    <Button 
                      variant="outline" 
                      onClick={handleCloseOrderDetails}
                      className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium border-2 hover:border-gray-400 transition-colors"
                    >
                      Close
                    </Button>
                    
                    {selectedOrder.trackingNumber && (
                      <Button 
                        onClick={() => handleOpenTracking(selectedOrder.id, selectedOrder.orderNumber)}
                        className="flex-1 h-11 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                        Track Order
                      </Button>
                    )}
                    

                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* Addresses Tab */}
          <TabsContent value="addresses" className="space-y-6">
            <Card className="border-0 shadow-sm bg-transparent">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    Saved Addresses
                  </CardTitle>
                  <Button 
                    onClick={openAddAddressModal}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3 h-auto text-base font-semibold"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add New Address
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                {addresses.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MapPin className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
                    <p className="text-gray-600 max-w-sm mx-auto">Add an address to make checkout faster and easier</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {addresses.map((address: Address) => (
                      <div key={address.id} className="bg-white border-0 shadow-lg rounded-2xl p-5 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 overflow-hidden relative group cursor-pointer" onClick={() => openAddressDetail(address)}>
                        {/* Decorative gradient border */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 rounded-2xl"></div>
                        <div className="relative z-10">
                          {/* Header with badges */}
                          <div className="flex flex-wrap items-center gap-2 mb-4">
                            <Badge 
                              variant={address.isDefault ? "default" : "secondary"}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              {address.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                            </Badge>
                            {address.isDefault && (
                              <Badge 
                                variant="outline" 
                                className="border-green-200 text-green-700 bg-green-50 px-3 py-1.5 text-sm font-medium"
                              >
                                <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          
                          {/* Address content */}
                          <div className="space-y-3 mb-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <p className="font-bold text-lg text-gray-900">
                                {address.firstName} {address.lastName}
                              </p>
                            </div>
                            
                            {address.company && (
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Settings className="h-4 w-4 text-gray-600" />
                                </div>
                                <p className="text-base font-medium text-gray-700">{address.company}</p>
                              </div>
                            )}
                            
                            <div className="space-y-2">
                              <div className="flex items-start gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg mt-1">
                                  <MapPin className="h-4 w-4 text-gray-600" />
                                </div>
                                <div className="space-y-1">
                                  <p className="text-base text-gray-900 font-medium break-words">{address.address1}</p>
                                  {address.address2 && (
                                    <p className="text-sm text-gray-600 break-words">{address.address2}</p>
                                  )}
                                  <p className="text-base text-gray-900 font-medium">
                                    {address.city}, {address.state} {address.postalCode}
                                  </p>
                                  <p className="text-base text-gray-900 font-medium">{address.country}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gray-100 rounded-lg">
                                  <Phone className="h-4 w-4 text-gray-600" />
                                </div>
                                <p className="text-base text-gray-900 font-medium">{address.phone}</p>
                              </div>
                            </div>
                          </div>
                          
                          {/* Action buttons */}
                          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                openAddressDetail(address);
                              }}
                              className="h-10 font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                            >
                              <MapPin className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Details</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditAddress(address.id);
                              }}
                              className="h-10 font-medium hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Edit</span>
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-10 font-medium text-destructive border-destructive hover:bg-destructive/10 hover:border-destructive/30 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteAddress(address);
                              }}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="hidden sm:inline">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>



          {/* Enhanced Preferences Tab */}
          <TabsContent value="preferences" className="space-y-6">
            <Card className="border-0 shadow-sm bg-transparent">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Settings className="h-5 w-5 text-purple-600" />
                  </div>
                  Notification Preferences
                  {localPreferences && preferences && JSON.stringify(localPreferences) !== JSON.stringify(preferences) && (
                    <Badge variant="secondary" className="text-xs ml-2 bg-orange-100 text-orange-700 border-orange-200">
                      Modified
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-6">
                <p className="text-sm text-gray-600 mb-6 text-center sm:text-left">
                  Choose how you want to receive notifications and updates from us.
                </p>
                
                {/* Notification Preferences Section */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-purple-500 rounded-lg">
                      <Settings className="h-4 w-4 text-white" />
                    </div>
                    Communication Preferences
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Mail className="h-4 w-4 text-blue-600" />
                          </div>
                          <Label htmlFor="emailNotifs" className="text-base font-semibold text-gray-900">Email Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive order updates and promotions via email</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="emailNotifs" 
                          checked={localPreferences?.emailNotifications}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, emailNotifications: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <Phone className="h-4 w-4 text-green-600" />
                          </div>
                          <Label htmlFor="smsNotifs" className="text-base font-semibold text-gray-900">SMS Notifications</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive order updates via text message</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="smsNotifs" 
                          checked={localPreferences?.smsNotifications}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, smsNotifications: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Star className="h-4 w-4 text-orange-600" />
                          </div>
                          <Label htmlFor="marketingEmails" className="text-base font-semibold text-gray-900">Marketing Emails</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive promotional offers and newsletters</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="marketingEmails" 
                          checked={localPreferences?.marketingEmails}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, marketingEmails: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Truck className="h-4 w-4 text-blue-600" />
                          </div>
                          <Label htmlFor="orderUpdates" className="text-base font-semibold text-gray-900">Order Updates</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive notifications about order status changes</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="orderUpdates" 
                          checked={localPreferences?.orderUpdates}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, orderUpdates: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <Zap className="h-4 w-4 text-yellow-600" />
                          </div>
                          <Label htmlFor="promotionalOffers" className="text-base font-semibold text-gray-900">Promotional Offers</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive special deals and discounts</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="promotionalOffers" 
                          checked={localPreferences?.promotionalOffers}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, promotionalOffers: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-white rounded-xl border border-purple-200 hover:border-purple-300 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 bg-indigo-100 rounded-lg">
                            <Clock className="h-4 w-4 text-indigo-600" />
                          </div>
                          <Label htmlFor="newsletter" className="text-base font-semibold text-gray-900">Newsletter</Label>
                        </div>
                        <p className="text-sm text-gray-600">Receive our monthly newsletter</p>
                      </div>
                      <div className="flex-shrink-0">
                        <Checkbox 
                          id="newsletter" 
                          checked={localPreferences?.newsletter}
                          onCheckedChange={(checked: boolean) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, newsletter: checked }))}
                          className="h-5 w-5 border-2 border-purple-500 data-[state=checked]:bg-purple-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Currency & Region Section */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <Globe className="h-4 w-4 text-white" />
                    </div>
                    Language & Region
                  </h3>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <p className="text-sm text-gray-600">
                      Customize your language, currency, and timezone preferences for a personalized experience.
                    </p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">

                      {!currenciesLoading && (
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {currencies.length} currencies available
                        </span>
                      )}
                    </div>
                    

                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="language" className="text-sm font-medium text-gray-700 mb-2 block">Language</Label>
                      {languagesLoading ? (
                        <div className="h-12 border-2 border-blue-200 rounded-md flex items-center justify-center bg-gray-50">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      ) : languagesError ? (
                        <div className="h-12 border-2 border-red-200 rounded-md flex items-center justify-center bg-red-50 text-red-600 text-sm">
                          Failed to load languages
                        </div>
                      ) : (
                        <SearchableSelect
                          options={languages
                            ?.sort((a, b) => a.name.localeCompare(b.name))
                            .map((lang) => ({
                              value: lang.code,
                              label: lang.name,
                              description: lang.nativeName,
                              icon: (
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">{getFlagEmoji(lang.code)}</span>
                                </div>
                              )
                            })) || []}
                          value={localPreferences?.language}
                          onValueChange={(value: string) => setLocalPreferences((prev: UserPreferences) => ({ ...prev, language: value }))}
                          placeholder="Select a language"
                          searchPlaceholder="Search languages by name, code, or native name..."
                          emptyMessage="No languages found."
                          triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                          contentClassName="w-[400px]"
                        />
                      )}
                    </div>
                    
                    <div>
                      <Label htmlFor="currency" className="text-sm font-medium text-gray-700 mb-2 block">Currency</Label>
                      {currenciesLoading ? (
                        <div className="h-12 border-2 border-blue-200 rounded-md flex items-center justify-center bg-gray-50">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                        </div>
                      ) : currenciesError ? (
                        <div className="h-12 border-2 border-red-200 rounded-md flex items-center justify-center bg-red-50 text-red-600 text-sm">
                          Failed to load currencies
                        </div>
                      ) : (
                        <SearchableSelect
                          options={currencies.map((currency) => ({
                            value: currency.code,
                            label: `${currency.position === 'before' ? currency.symbol : ''} ${currency.code} ${currency.position === 'after' ? currency.symbol : ''}`,
                            description: currency.name
                          }))}
                          value={localPreferences?.currency}
                          onValueChange={(value: string) => setLocalPreferences((prev: UserPreferences) => ({ ...prev, currency: value as 'USD' | 'EUR' | 'PKR' }))}
                          placeholder="Select a currency"
                          searchPlaceholder="Search currencies..."
                          emptyMessage="No currencies found."
                          triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                          contentClassName="w-[400px]"
                        />
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label htmlFor="timezone" className="text-sm font-medium text-gray-700">Timezone</Label>
                        {!preferences?.id && localPreferences?.timezone && (
                          <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-200">
                            🕐 Auto-detected: {localPreferences.timezone}
                          </span>
                        )}
                      </div>
                      

                      
                      <SearchableSelect
                        options={timezones.map((tz) => ({
                          value: tz.value,
                          label: tz.label,
                          description: tz.offset
                        }))}
                        value={localPreferences?.timezone}
                        onValueChange={(value: string) => setLocalPreferences((prev: UserPreferences | undefined) => ({ ...prev, timezone: value }))}
                        placeholder="Select your timezone"
                        searchPlaceholder="Search timezones..."
                        emptyMessage="No timezones found."
                        triggerClassName="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors"
                        contentClassName="w-[400px] max-h-96"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline"
                    onClick={() => setLocalPreferences(preferences)}
                    disabled={updatePreferencesMutation.isPending}
                    className="h-12 px-8 text-base font-medium"
                  >
                    Reset to Saved
                  </Button>
                  <Button 
                    onClick={handleSavePreferences}
                    disabled={updatePreferencesMutation.isPending}
                    className="h-12 px-8 text-base font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {updatePreferencesMutation.isPending ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Saving Preferences...
                      </>
                    ) : (
                      <>
                        <Settings className="h-5 w-5 mr-2" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            {/* Security Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium">Email Verified</p>
                      <p className="text-sm text-muted-foreground">Your email is verified</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Active Sessions</p>
                      <p className="text-sm text-muted-foreground">{sessions.length} session{sessions.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Password Change Section - Disabled in current version */}
                {/* canChangePassword() ? ( */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Change Password</h4>
                    <div className="p-4 border rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/20 flex items-center justify-center">
                          <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                          <p className="font-medium">Password Change Temporarily Unavailable</p>
                          <p className="text-sm text-muted-foreground">
                            Password change functionality is not available in the current version. 
                            To change your password, please use the password reset feature or contact support.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* ) : ( */}
                  {/* OAuth Only Users - Show connected accounts info */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Connected Accounts</h4>
                    <div className="space-y-3">
                      <div className="p-4 border rounded-lg bg-muted/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium">OAuth Authentication</p>
                            <p className="text-sm text-muted-foreground">
                              You're signed in using a third-party service. 
                              Password changes are not applicable for OAuth accounts.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                {/* ) */}
                
                <hr className="my-2" />
                
                <div className="space-y-4">
                  <h4 className="font-medium">Login Sessions</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your active login sessions across different devices and browsers.
                  </p>
                  
                  {sessionsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin" />
                      <span className="ml-2">Loading sessions...</span>
                    </div>
                  ) : sessionsError ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="mb-2">Failed to load sessions</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => window.location.reload()}
                      >
                        Retry
                      </Button>
                    </div>
                  ) : sessions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground mb-2">No active sessions found</p>
                      <p className="text-sm text-muted-foreground">
                        This usually means you're only logged in on this device.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {sessions.map((session: UserSession) => (
                        <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <User className="h-4 w-4 text-primary" />
                              </div>
                              <div>
                                <p className="font-medium">{formatDeviceInfo(session.deviceInfo)}</p>
                                <p className="text-sm text-muted-foreground">
                                  IP: {session.ipAddress}
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              <p>Last activity: {formatTimeAgo(session.lastActivity)}</p>
                              <p>Created: {new Date(session.createdAt).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {session.isActive && (
                              <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                Current Session
                              </Badge>
                            )}
                            {!session.isActive && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleRevokeSession(session.id)}
                                disabled={revokeSessionMutation.isPending}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                              >
                                {revokeSessionMutation.isPending ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  'Revoke'
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Session Management Tips */}
                  <div className="mt-6 p-4 border rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Session Security Tips</h5>
                    <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                      <li>• Revoke sessions from devices you don't recognize</li>
                      <li>• Keep your current session active for convenience</li>
                      <li>• Sessions automatically expire after inactivity</li>
                      <li>• Contact support if you notice suspicious activity</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
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

      {/* Enhanced Address Form Modal */}
      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-white to-blue-50">
          {/* Enhanced Header */}
          <DialogHeader className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <MapPin className="h-7 w-7 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {editingAddress ? 'Edit Address' : 'Add New Address'}
                </DialogTitle>
                <p className="text-blue-100 text-base mt-1">
                  {editingAddress ? 'Update your address information' : 'Enter your address details below'}
                </p>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleAddressSubmit} className="p-6 space-y-6">
            {/* Address Type & Default Section */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Settings className="h-4 w-4 text-white" />
                </div>
                Address Configuration
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="type" className="text-sm font-medium text-gray-700 mb-2 block">
                    Address Type *
                  </Label>
                  <Select 
                    value={addressForm.type} 
                    onValueChange={(value: string) => handleAddressFormChange('type', value)}
                  >
                    <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 transition-colors">
                      <SelectValue placeholder="Select address type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SHIPPING" className="flex items-center gap-2">
                        <Truck className="h-4 w-4" />
                        Shipping Address
                      </SelectItem>
                      <SelectItem value="BILLING" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Billing Address
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center space-x-3 p-4 bg-white rounded-xl border border-gray-200">
                  <Checkbox
                    id="isDefault"
                    checked={addressForm.isDefault}
                    onCheckedChange={(checked: boolean | 'indeterminate') => handleAddressFormChange('isDefault', checked === true)}
                    className="h-5 w-5 border-2 border-blue-500 data-[state=checked]:bg-blue-500"
                  />
                  <Label htmlFor="isDefault" className="text-base font-medium text-gray-900 cursor-pointer">
                    Set as default address
                  </Label>
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-green-500 rounded-lg">
                  <User className="h-4 w-4 text-white" />
                </div>
                Personal Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700 mb-2 block">
                    First Name *
                  </Label>
                  <Input
                    id="firstName"
                    value={addressForm.firstName}
                    onChange={(e) => handleAddressFormChange('firstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                    className="h-12 border-2 border-green-200 focus:border-green-500 transition-colors"
                  />
                </div>
                
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700 mb-2 block">
                    Last Name *
                  </Label>
                  <Input
                    id="lastName"
                    value={addressForm.lastName}
                    onChange={(e) => handleAddressFormChange('lastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                    className="h-12 border-2 border-green-200 focus:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-4">
                <Label htmlFor="company" className="text-sm font-medium text-gray-700 mb-2 block">
                  Company (Optional)
                </Label>
                <Input
                  id="company"
                  value={addressForm.company}
                  onChange={(e) => handleAddressFormChange('company', e.target.value)}
                  placeholder="Enter company name"
                  className="h-12 border-2 border-green-200 focus:border-green-500 transition-colors"
                />
              </div>
            </div>

            {/* Address Information Section */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-6 border border-purple-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <div className="p-2 bg-purple-500 rounded-lg">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                Address Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="address1" className="text-sm font-medium text-gray-700 mb-2 block">
                    Address Line 1 *
                  </Label>
                  <Input
                    id="address1"
                    value={addressForm.address1}
                    onChange={(e) => handleAddressFormChange('address1', e.target.value)}
                    placeholder="Street address, P.O. box, company name"
                    required
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div>
                  <Label htmlFor="address2" className="text-sm font-medium text-gray-700 mb-2 block">
                    Address Line 2
                  </Label>
                  <Input
                    id="address2"
                    value={addressForm.address2}
                    onChange={(e) => handleAddressFormChange('address2', e.target.value)}
                    placeholder="Apartment, suite, unit, building, floor, etc."
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city" className="text-sm font-medium text-gray-700 mb-2 block">
                      City *
                    </Label>
                    <Input
                      id="city"
                      value={addressForm.city}
                      onChange={(e) => handleAddressFormChange('city', e.target.value)}
                      placeholder="Enter city"
                      required
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="state" className="text-sm font-medium text-gray-700 mb-2 block">
                      State/Province *
                    </Label>
                    <Input
                      id="state"
                      value={addressForm.state}
                      onChange={(e) => handleAddressFormChange('state', e.target.value)}
                      placeholder="Enter state"
                      required
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="postalCode" className="text-sm font-medium text-gray-700 mb-2 block">
                      Postal Code *
                    </Label>
                    <Input
                      id="postalCode"
                      value={addressForm.postalCode}
                      onChange={(e) => handleAddressFormChange('postalCode', e.target.value)}
                      placeholder="Enter postal code"
                      required
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="country" className="text-sm font-medium text-gray-700 mb-2 block">
                      Country *
                    </Label>
                    {countriesLoading ? (
                      <div className="h-12 border-2 border-purple-200 rounded-xl flex items-center justify-center bg-purple-50">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                        <span className="ml-2 text-sm text-purple-600">Loading countries...</span>
                      </div>
                    ) : countriesError ? (
                      <div className="h-12 border-2 border-red-200 rounded-xl flex items-center justify-center bg-red-50 text-red-600 text-sm">
                        Failed to load countries
                      </div>
                    ) : (
                      <SearchableSelect
                        options={countries.map(country => ({
                          value: country.code,
                          label: country.name,
                          icon: <span className="text-lg">{country.flagEmoji}</span>
                        }))}
                        value={addressForm.country}
                        onValueChange={(value: string) => handleAddressFormChange('country', value)}
                        placeholder="Select country"
                        searchPlaceholder="Search countries..."
                        emptyMessage="No countries found."
                        triggerClassName="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                        contentClassName="w-[400px]"
                      />
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-sm font-medium text-gray-700 mb-2 block">
                      Phone Number *
                    </Label>
                    <Input
                      id="phone"
                      value={addressForm.phone}
                      onChange={(e) => handleAddressFormChange('phone', e.target.value)}
                      placeholder="Enter phone number"
                      required
                      className="h-12 border-2 border-purple-200 focus:border-purple-500 transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={closeAddressModal}
                className="h-12 px-8 text-base font-medium"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={addAddressMutation.isPending || updateAddressMutation.isPending}
                className="h-12 px-8 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {addAddressMutation.isPending || updateAddressMutation.isPending ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    {editingAddress ? 'Updating Address...' : 'Adding Address...'}
                  </>
                ) : (
                  <>
                    {editingAddress ? (
                      <>
                        <Edit className="h-5 w-5 mr-2" />
                        Update Address
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add Address
                      </>
                    )}
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Order Tracking Modal */}
      {trackingOrderId && (
        <OrderTrackingModal
          isOpen={isTrackingModalOpen}
          onClose={handleCloseTracking}
          orderId={trackingOrderId}
          orderNumber={trackingOrderNumber}
        />
      )}

      {/* Delete Address Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              Delete Address
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this address? This action cannot be undone.
            </p>
            
            {addressToDelete && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-gray-600" />
                  </div>
                  <p className="font-medium text-gray-900">
                    {addressToDelete.firstName} {addressToDelete.lastName}
                  </p>
                </div>
                <p className="text-sm text-gray-600 break-words">
                  {addressToDelete.address1}
                  {addressToDelete.address2 && `, ${addressToDelete.address2}`}
                </p>
                <p className="text-sm text-gray-600">
                  {addressToDelete.city}, {addressToDelete.state} {addressToDelete.postalCode}
                </p>
                <p className="text-sm text-gray-600">{addressToDelete.country}</p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={executeDeleteAddress}
              disabled={deleteAddressMutation.isPending}
              className="flex-1"
            >
              {deleteAddressMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete Address'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Address Detail Dialog */}
      <Dialog open={isAddressDetailOpen} onOpenChange={setIsAddressDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <MapPin className="h-6 w-6 text-white" />
              </div>
              Address Details
            </DialogTitle>
          </DialogHeader>
          
          {addressToView && (
            <div className="space-y-6 py-4">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-6 border border-blue-100">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  <Badge 
                    variant={addressToView.isDefault ? "default" : "secondary"}
                    className="flex items-center gap-2 px-4 py-2 text-base font-semibold"
                  >
                    <MapPin className="h-4 w-4" />
                    {addressToView.type === 'SHIPPING' ? 'Shipping Address' : 'Billing Address'}
                  </Badge>
                  {addressToView.isDefault && (
                    <Badge 
                      variant="outline" 
                      className="border-green-200 text-green-700 bg-green-50 px-4 py-2 text-base font-semibold"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Default Address
                    </Badge>
                  )}
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-3">
                    <User className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {addressToView.firstName} {addressToView.lastName}
                  </h3>
                  {addressToView.company && (
                    <p className="text-lg text-gray-700 font-medium">{addressToView.company}</p>
                  )}
                </div>
              </div>

              {/* Address Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                    Personal Information
                  </h4>
                  
                  <div className="space-y-3">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Full Name</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">
                        {addressToView.firstName} {addressToView.lastName}
                      </p>
                    </div>
                    
                    {addressToView.company && (
                      <div className="bg-white border border-gray-200 rounded-lg p-4">
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Company</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.company}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Phone className="h-4 w-4 text-green-600" />
                    </div>
                    Contact Information
                  </h4>
                  
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Phone Number</label>
                    <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.phone}</p>
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <MapPin className="h-4 w-4 text-purple-600" />
                  </div>
                  Address Details
                </h4>
                
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Street Address</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1 break-words">{addressToView.address1}</p>
                    </div>
                    
                    {addressToView.address2 && (
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Apartment, Suite, etc.</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1 break-words">{addressToView.address2}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">City</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.city}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">State/Province</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.state}</p>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Postal Code</label>
                        <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.postalCode}</p>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Country</label>
                      <p className="text-lg font-semibold text-gray-900 mt-1">{addressToView.country}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Type & Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Address Type</label>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={addressToView.type === 'SHIPPING' ? "default" : "secondary"}
                      className="text-base px-3 py-1"
                    >
                      {addressToView.type === 'SHIPPING' ? 'Shipping' : 'Billing'}
                    </Badge>
                  </div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <label className="text-sm font-medium text-gray-500 uppercase tracking-wide">Status</label>
                  <div className="flex items-center gap-2 mt-2">
                    {addressToView.isDefault ? (
                      <Badge 
                        variant="outline" 
                        className="border-green-200 text-green-700 bg-green-50 text-base px-3 py-1"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Default Address
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-base px-3 py-1">
                        Regular Address
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Click the edit button below to modify this address
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddressDetailOpen(false);
                  if (addressToView) {
                    handleEditAddress(addressToView.id);
                  }
                }}
                className="px-6"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Address
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsAddressDetailOpen(false)}
                className="px-6"
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
