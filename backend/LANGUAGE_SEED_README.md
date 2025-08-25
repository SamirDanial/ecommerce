# Languages Database Seeding

This document explains how to seed the languages table with primary languages of countries, including Dari for Afghanistan.

## Overview

The `seed-languages.ts` file populates the `LanguageConfig` table with comprehensive language data including:
- Language codes (ISO 639-1/2 codes)
- Full language names in English
- Native language names (in their own script)
- Text direction support (LTR/RTL)
- Active status and default settings

## Running the Seed

### Option 1: Using npm script
```bash
npm run seed:languages
```

### Option 2: Direct execution
```bash
npx ts-node prisma/seed-languages.ts
```

### Option 3: Full database reset and seed
```bash
./reset-and-seed.sh
```

## What Gets Created

The seed file creates **85 languages** with the following data structure:

```typescript
{
  code: 'en',                      // ISO language code
  name: 'English',                 // Language name in English
  nativeName: 'English',           // Native name in own script
  isActive: true,                  // Language is active
  isDefault: true,                 // English is set as default
  isRTL: false                     // Left-to-Right text direction
}
```

## Languages Included

### Major World Languages
1. **en** - English (Default language)
2. **es** - Spanish (Español)
3. **fr** - French (Français)
4. **de** - German (Deutsch)
5. **it** - Italian (Italiano)
6. **pt** - Portuguese (Português)
7. **ru** - Russian (Русский)
8. **zh** - Chinese Simplified (中文 简体)
9. **zh-TW** - Chinese Traditional (中文 繁體)
10. **ja** - Japanese (日本語)
11. **ko** - Korean (한국어)

### South Asian Languages
12. **hi** - Hindi (हिन्दी)
13. **bn** - Bengali (বাংলা)
14. **ur** - Urdu (اردو) [RTL]
15. **ne** - Nepali (नेपाली)
16. **si** - Sinhala (සිංහල)
17. **my** - Burmese (မြန်မာ)
18. **km** - Khmer (ខ្មែរ)
19. **lo** - Lao (ລາວ)

### Middle Eastern & Central Asian Languages
20. **ar** - Arabic (العربية) [RTL]
21. **fa** - Persian/Farsi (فارسی) [RTL]
22. **ps** - **Dari (دری) [RTL]** ⭐ **Special: Primary language of Afghanistan**
23. **tr** - Turkish (Türkçe)
24. **he** - Hebrew (עברית) [RTL]
25. **ka** - Georgian (ქართული)
26. **hy** - Armenian (Հայերեն)
27. **az** - Azerbaijani (Azərbaycan)
28. **kk** - Kazakh (Қазақ)
29. **ky** - Kyrgyz (Кыргызча)
30. **uz** - Uzbek (O'zbek)
31. **tk** - Turkmen (Türkmençe)
32. **tg** - Tajik (Тоҷикӣ)
33. **mn** - Mongolian (Монгол)

### European Languages
34. **nl** - Dutch (Nederlands)
35. **pl** - Polish (Polski)
36. **sv** - Swedish (Svenska)
37. **da** - Danish (Dansk)
38. **no** - Norwegian (Norsk)
39. **fi** - Finnish (Suomi)
40. **el** - Greek (Ελληνικά)
41. **uk** - Ukrainian (Українська)
42. **cs** - Czech (Čeština)
43. **sk** - Slovak (Slovenčina)
44. **hu** - Hungarian (Magyar)
45. **ro** - Romanian (Română)
46. **bg** - Bulgarian (Български)
47. **hr** - Croatian (Hrvatski)
48. **sl** - Slovenian (Slovenščina)
49. **et** - Estonian (Eesti)
50. **lv** - Latvian (Latviešu)
51. **lt** - Lithuanian (Lietuvių)
52. **mt** - Maltese (Malti)
53. **ga** - Irish (Gaeilge)
54. **cy** - Welsh (Cymraeg)
55. **is** - Icelandic (Íslenska)
56. **fo** - Faroese (Føroyskt)
57. **sq** - Albanian (Shqip)
58. **mk** - Macedonian (Македонски)
59. **sr** - Serbian (Српски)
60. **bs** - Bosnian (Bosanski)
61. **me** - Montenegrin (Crnogorski)

### Southeast Asian Languages
62. **th** - Thai (ไทย)
63. **vi** - Vietnamese (Tiếng Việt)
64. **id** - Indonesian (Bahasa Indonesia)
65. **ms** - Malay (Bahasa Melayu)
66. **fil** - Filipino (Filipino)

### African Languages
67. **am** - Amharic (አማርኛ)
68. **sw** - Swahili (Kiswahili)
69. **yo** - Yoruba (Yorùbá)
70. **ig** - Igbo (Igbo)
71. **ha** - Hausa (Hausa)
72. **zu** - Zulu (isiZulu)
73. **af** - Afrikaans (Afrikaans)

## Text Direction Support

### Left-to-Right (LTR) Languages
- Most languages including English, Spanish, French, German, etc.
- **Total: 72 languages**

### Right-to-Left (RTL) Languages
- **Arabic** (العربية) - ar
- **Urdu** (اردو) - ur
- **Persian/Farsi** (فارسی) - fa
- **Dari** (دری) - ps ⭐ **Afghanistan's primary language**
- **Hebrew** (עברית) - he

**Total: 13 languages**

## Special Features

### Dari Language (Afghanistan)
- **Code**: `ps`
- **Name**: Dari
- **Native Name**: دری
- **Direction**: RTL (Right-to-Left)
- **Region**: Afghanistan, Central Asia
- **Script**: Arabic/Persian script

### Chinese Variants
- **Simplified Chinese**: `zh` (中文 简体)
- **Traditional Chinese**: `zh-TW` (中文 繁體)

### Regional Coverage
- **Europe**: 28 languages
- **Asia**: 25 languages
- **Africa**: 7 languages
- **Americas**: 2 languages (Spanish, Portuguese)
- **Oceania**: 1 language (Filipino)

## Database Schema

The languages are stored in the `LanguageConfig` table:

```sql
CREATE TABLE language_configs (
  id SERIAL PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  nativeName VARCHAR(100) NOT NULL,
  isActive BOOLEAN DEFAULT true,
  isDefault BOOLEAN DEFAULT false,
  isRTL BOOLEAN DEFAULT false,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);
```

## API Integration

Once seeded, languages can be accessed via the language routes:
- `GET /api/languages` - Get all active languages
- `GET /api/languages/:code` - Get specific language by code

## Frontend Usage

Languages can be used for:
- Multi-language website support
- Localization and internationalization
- User preference settings
- Content translation
- RTL layout support for Arabic, Urdu, Dari, etc.

## RTL Language Support

For RTL languages like Dari, the frontend should:
1. **Detect RTL languages** using the `isRTL` field
2. **Apply RTL CSS** for proper text direction
3. **Mirror layouts** for RTL users
4. **Support RTL input fields** and forms
5. **Handle RTL navigation** and menus

## Example Output

When running the seed, you should see:

```
🌍 Starting languages database seeding...
✅ Created 85 languages

📊 Languages created:
   en - English (DEFAULT)
      Native: English
   es - Spanish
      Native: Español
   ps - Dari [RTL]
      Native: دری
   ...

📈 Language Statistics:
   Total languages: 85
   Left-to-Right (LTR): 72
   Right-to-Left (RTL): 13
   Default language: English (en)

🔄 Right-to-Left Languages:
   ar - Arabic (العربية)
   ur - Urdu (اردو)
   fa - Persian (Farsi) (فارسی)
   ps - Dari (دری)
   he - Hebrew (עברית)

⭐ Key Languages:
   en - English (English)
   es - Spanish (Español)
   fr - French (Français)
   de - German (Deutsch)
   zh - Chinese (Simplified) (中文 简体)
   ja - Japanese (日本語)
   ar - Arabic (العربية)
   hi - Hindi (हिन्दी)
   ps - Dari (دری)

🌍 Total languages: 85
💡 English is set as the default language
🔍 Special note: Dari (ps) is included for Afghanistan
```

## Troubleshooting

If you encounter issues:

1. Ensure Prisma is properly configured
2. Check that the database is running
3. Verify the schema matches the seed data structure
4. Run `npx prisma generate` if needed
5. Check for duplicate language codes

## Production Considerations

- **Implement language detection** based on user location/browser
- **Add translation management** for dynamic content
- **Support RTL layouts** for Arabic, Urdu, Dari users
- **Consider language-specific formatting** (dates, numbers, currencies)
- **Implement fallback languages** for missing translations
- **Add language switching** without page reload
