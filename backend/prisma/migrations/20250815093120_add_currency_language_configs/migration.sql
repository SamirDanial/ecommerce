-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Currency" ADD VALUE 'GBP';
ALTER TYPE "public"."Currency" ADD VALUE 'JPY';
ALTER TYPE "public"."Currency" ADD VALUE 'CNY';
ALTER TYPE "public"."Currency" ADD VALUE 'INR';
ALTER TYPE "public"."Currency" ADD VALUE 'CAD';
ALTER TYPE "public"."Currency" ADD VALUE 'AUD';
ALTER TYPE "public"."Currency" ADD VALUE 'CHF';
ALTER TYPE "public"."Currency" ADD VALUE 'SEK';
ALTER TYPE "public"."Currency" ADD VALUE 'NOK';
ALTER TYPE "public"."Currency" ADD VALUE 'DKK';
ALTER TYPE "public"."Currency" ADD VALUE 'PLN';
ALTER TYPE "public"."Currency" ADD VALUE 'CZK';
ALTER TYPE "public"."Currency" ADD VALUE 'HUF';
ALTER TYPE "public"."Currency" ADD VALUE 'RUB';
ALTER TYPE "public"."Currency" ADD VALUE 'TRY';
ALTER TYPE "public"."Currency" ADD VALUE 'BRL';
ALTER TYPE "public"."Currency" ADD VALUE 'MXN';
ALTER TYPE "public"."Currency" ADD VALUE 'ARS';
ALTER TYPE "public"."Currency" ADD VALUE 'CLP';
ALTER TYPE "public"."Currency" ADD VALUE 'COP';
ALTER TYPE "public"."Currency" ADD VALUE 'PEN';
ALTER TYPE "public"."Currency" ADD VALUE 'UYU';
ALTER TYPE "public"."Currency" ADD VALUE 'VND';
ALTER TYPE "public"."Currency" ADD VALUE 'THB';
ALTER TYPE "public"."Currency" ADD VALUE 'MYR';
ALTER TYPE "public"."Currency" ADD VALUE 'SGD';
ALTER TYPE "public"."Currency" ADD VALUE 'HKD';
ALTER TYPE "public"."Currency" ADD VALUE 'KRW';
ALTER TYPE "public"."Currency" ADD VALUE 'TWD';
ALTER TYPE "public"."Currency" ADD VALUE 'PHP';
ALTER TYPE "public"."Currency" ADD VALUE 'IDR';
ALTER TYPE "public"."Currency" ADD VALUE 'ZAR';
ALTER TYPE "public"."Currency" ADD VALUE 'EGP';
ALTER TYPE "public"."Currency" ADD VALUE 'NGN';
ALTER TYPE "public"."Currency" ADD VALUE 'KES';
ALTER TYPE "public"."Currency" ADD VALUE 'GHS';
ALTER TYPE "public"."Currency" ADD VALUE 'MAD';
ALTER TYPE "public"."Currency" ADD VALUE 'TND';
ALTER TYPE "public"."Currency" ADD VALUE 'AED';
ALTER TYPE "public"."Currency" ADD VALUE 'SAR';
ALTER TYPE "public"."Currency" ADD VALUE 'QAR';
ALTER TYPE "public"."Currency" ADD VALUE 'KWD';
ALTER TYPE "public"."Currency" ADD VALUE 'BHD';
ALTER TYPE "public"."Currency" ADD VALUE 'OMR';
ALTER TYPE "public"."Currency" ADD VALUE 'JOD';
ALTER TYPE "public"."Currency" ADD VALUE 'LBP';
ALTER TYPE "public"."Currency" ADD VALUE 'ILS';
ALTER TYPE "public"."Currency" ADD VALUE 'IRR';
ALTER TYPE "public"."Currency" ADD VALUE 'AFN';
ALTER TYPE "public"."Currency" ADD VALUE 'BDT';
ALTER TYPE "public"."Currency" ADD VALUE 'LKR';
ALTER TYPE "public"."Currency" ADD VALUE 'NPR';
ALTER TYPE "public"."Currency" ADD VALUE 'MMK';
ALTER TYPE "public"."Currency" ADD VALUE 'KHR';
ALTER TYPE "public"."Currency" ADD VALUE 'LAK';
ALTER TYPE "public"."Currency" ADD VALUE 'MNT';
ALTER TYPE "public"."Currency" ADD VALUE 'KZT';
ALTER TYPE "public"."Currency" ADD VALUE 'UZS';
ALTER TYPE "public"."Currency" ADD VALUE 'TJS';
ALTER TYPE "public"."Currency" ADD VALUE 'TMT';
ALTER TYPE "public"."Currency" ADD VALUE 'AZN';
ALTER TYPE "public"."Currency" ADD VALUE 'GEL';
ALTER TYPE "public"."Currency" ADD VALUE 'AMD';
ALTER TYPE "public"."Currency" ADD VALUE 'BYN';
ALTER TYPE "public"."Currency" ADD VALUE 'MDL';
ALTER TYPE "public"."Currency" ADD VALUE 'UAH';
ALTER TYPE "public"."Currency" ADD VALUE 'RON';
ALTER TYPE "public"."Currency" ADD VALUE 'BGN';
ALTER TYPE "public"."Currency" ADD VALUE 'HRK';
ALTER TYPE "public"."Currency" ADD VALUE 'RSD';
ALTER TYPE "public"."Currency" ADD VALUE 'MKD';
ALTER TYPE "public"."Currency" ADD VALUE 'ALL';
ALTER TYPE "public"."Currency" ADD VALUE 'XCD';
ALTER TYPE "public"."Currency" ADD VALUE 'BBD';
ALTER TYPE "public"."Currency" ADD VALUE 'JMD';
ALTER TYPE "public"."Currency" ADD VALUE 'TTD';
ALTER TYPE "public"."Currency" ADD VALUE 'BZD';
ALTER TYPE "public"."Currency" ADD VALUE 'GTQ';
ALTER TYPE "public"."Currency" ADD VALUE 'HNL';
ALTER TYPE "public"."Currency" ADD VALUE 'NIO';
ALTER TYPE "public"."Currency" ADD VALUE 'CRC';
ALTER TYPE "public"."Currency" ADD VALUE 'PAB';
ALTER TYPE "public"."Currency" ADD VALUE 'BOB';
ALTER TYPE "public"."Currency" ADD VALUE 'PYG';
ALTER TYPE "public"."Currency" ADD VALUE 'GYD';
ALTER TYPE "public"."Currency" ADD VALUE 'SRD';
ALTER TYPE "public"."Currency" ADD VALUE 'FJD';
ALTER TYPE "public"."Currency" ADD VALUE 'PGK';
ALTER TYPE "public"."Currency" ADD VALUE 'WST';
ALTER TYPE "public"."Currency" ADD VALUE 'TOP';
ALTER TYPE "public"."Currency" ADD VALUE 'VUV';
ALTER TYPE "public"."Currency" ADD VALUE 'SBD';
ALTER TYPE "public"."Currency" ADD VALUE 'KID';
ALTER TYPE "public"."Currency" ADD VALUE 'TVD';
ALTER TYPE "public"."Currency" ADD VALUE 'NZD';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "public"."Language" ADD VALUE 'SPANISH';
ALTER TYPE "public"."Language" ADD VALUE 'FRENCH';
ALTER TYPE "public"."Language" ADD VALUE 'GERMAN';
ALTER TYPE "public"."Language" ADD VALUE 'ITALIAN';
ALTER TYPE "public"."Language" ADD VALUE 'PORTUGUESE';
ALTER TYPE "public"."Language" ADD VALUE 'RUSSIAN';
ALTER TYPE "public"."Language" ADD VALUE 'CHINESE';
ALTER TYPE "public"."Language" ADD VALUE 'JAPANESE';
ALTER TYPE "public"."Language" ADD VALUE 'KOREAN';
ALTER TYPE "public"."Language" ADD VALUE 'HINDI';
ALTER TYPE "public"."Language" ADD VALUE 'BENGALI';
ALTER TYPE "public"."Language" ADD VALUE 'TAMIL';
ALTER TYPE "public"."Language" ADD VALUE 'TELUGU';
ALTER TYPE "public"."Language" ADD VALUE 'MARATHI';
ALTER TYPE "public"."Language" ADD VALUE 'GUJARATI';
ALTER TYPE "public"."Language" ADD VALUE 'KANNADA';
ALTER TYPE "public"."Language" ADD VALUE 'MALAYALAM';
ALTER TYPE "public"."Language" ADD VALUE 'PUNJABI';
ALTER TYPE "public"."Language" ADD VALUE 'ORIYA';
ALTER TYPE "public"."Language" ADD VALUE 'ASSAMESE';
ALTER TYPE "public"."Language" ADD VALUE 'SINDHI';
ALTER TYPE "public"."Language" ADD VALUE 'KASHMIRI';
ALTER TYPE "public"."Language" ADD VALUE 'NEPALI';
ALTER TYPE "public"."Language" ADD VALUE 'SINHALA';
ALTER TYPE "public"."Language" ADD VALUE 'THAI';
ALTER TYPE "public"."Language" ADD VALUE 'VIETNAMESE';
ALTER TYPE "public"."Language" ADD VALUE 'INDONESIAN';
ALTER TYPE "public"."Language" ADD VALUE 'MALAY';
ALTER TYPE "public"."Language" ADD VALUE 'FILIPINO';
ALTER TYPE "public"."Language" ADD VALUE 'BURMESE';
ALTER TYPE "public"."Language" ADD VALUE 'KHMER';
ALTER TYPE "public"."Language" ADD VALUE 'LAO';
ALTER TYPE "public"."Language" ADD VALUE 'MONGOLIAN';
ALTER TYPE "public"."Language" ADD VALUE 'KAZAKH';
ALTER TYPE "public"."Language" ADD VALUE 'UZBEK';
ALTER TYPE "public"."Language" ADD VALUE 'TURKISH';
ALTER TYPE "public"."Language" ADD VALUE 'AZERBAIJANI';
ALTER TYPE "public"."Language" ADD VALUE 'GEORGIAN';
ALTER TYPE "public"."Language" ADD VALUE 'ARMENIAN';
ALTER TYPE "public"."Language" ADD VALUE 'PERSIAN';
ALTER TYPE "public"."Language" ADD VALUE 'KURDISH';
ALTER TYPE "public"."Language" ADD VALUE 'HEBREW';
ALTER TYPE "public"."Language" ADD VALUE 'GREEK';
ALTER TYPE "public"."Language" ADD VALUE 'BULGARIAN';
ALTER TYPE "public"."Language" ADD VALUE 'MACEDONIAN';
ALTER TYPE "public"."Language" ADD VALUE 'SERBIAN';
ALTER TYPE "public"."Language" ADD VALUE 'CROATIAN';
ALTER TYPE "public"."Language" ADD VALUE 'SLOVENIAN';
ALTER TYPE "public"."Language" ADD VALUE 'SLOVAK';
ALTER TYPE "public"."Language" ADD VALUE 'CZECH';
ALTER TYPE "public"."Language" ADD VALUE 'POLISH';
ALTER TYPE "public"."Language" ADD VALUE 'HUNGARIAN';
ALTER TYPE "public"."Language" ADD VALUE 'ROMANIAN';
ALTER TYPE "public"."Language" ADD VALUE 'ALBANIAN';
ALTER TYPE "public"."Language" ADD VALUE 'ESTONIAN';
ALTER TYPE "public"."Language" ADD VALUE 'LATVIAN';
ALTER TYPE "public"."Language" ADD VALUE 'LITHUANIAN';
ALTER TYPE "public"."Language" ADD VALUE 'FINNISH';
ALTER TYPE "public"."Language" ADD VALUE 'SWEDISH';
ALTER TYPE "public"."Language" ADD VALUE 'NORWEGIAN';
ALTER TYPE "public"."Language" ADD VALUE 'DANISH';
ALTER TYPE "public"."Language" ADD VALUE 'ICELANDIC';
ALTER TYPE "public"."Language" ADD VALUE 'DUTCH';
ALTER TYPE "public"."Language" ADD VALUE 'BELGIAN';
ALTER TYPE "public"."Language" ADD VALUE 'LUXEMBOURGISH';
ALTER TYPE "public"."Language" ADD VALUE 'SWISS_GERMAN';
ALTER TYPE "public"."Language" ADD VALUE 'CATALAN';
ALTER TYPE "public"."Language" ADD VALUE 'BASQUE';
ALTER TYPE "public"."Language" ADD VALUE 'GALICIAN';
ALTER TYPE "public"."Language" ADD VALUE 'WELSH';
ALTER TYPE "public"."Language" ADD VALUE 'SCOTTISH_GAELIC';
ALTER TYPE "public"."Language" ADD VALUE 'IRISH';
ALTER TYPE "public"."Language" ADD VALUE 'MANX';
ALTER TYPE "public"."Language" ADD VALUE 'CORNISH';
ALTER TYPE "public"."Language" ADD VALUE 'BRETON';
ALTER TYPE "public"."Language" ADD VALUE 'OCCITAN';
ALTER TYPE "public"."Language" ADD VALUE 'PROVENCAL';
ALTER TYPE "public"."Language" ADD VALUE 'CORSICAN';
ALTER TYPE "public"."Language" ADD VALUE 'SARDINIAN';
ALTER TYPE "public"."Language" ADD VALUE 'SICILIAN';
ALTER TYPE "public"."Language" ADD VALUE 'NAPOLETANO';
ALTER TYPE "public"."Language" ADD VALUE 'VENETIAN';
ALTER TYPE "public"."Language" ADD VALUE 'LOMBARD';
ALTER TYPE "public"."Language" ADD VALUE 'PIEDMONTESE';
ALTER TYPE "public"."Language" ADD VALUE 'LIGURIAN';
ALTER TYPE "public"."Language" ADD VALUE 'EMILIAN';
ALTER TYPE "public"."Language" ADD VALUE 'ROMAGNOL';
ALTER TYPE "public"."Language" ADD VALUE 'TUSCAN';
ALTER TYPE "public"."Language" ADD VALUE 'UMBRIAN';
ALTER TYPE "public"."Language" ADD VALUE 'MARCHIGIANO';
ALTER TYPE "public"."Language" ADD VALUE 'ABRUZZESE';
ALTER TYPE "public"."Language" ADD VALUE 'MOLISAN';
ALTER TYPE "public"."Language" ADD VALUE 'PUGLIESE';
ALTER TYPE "public"."Language" ADD VALUE 'CALABRESE';

-- CreateTable
CREATE TABLE "public"."currency_configs" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "symbol" VARCHAR(10) NOT NULL,
    "rate" DECIMAL(10,6) NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "decimals" INTEGER NOT NULL DEFAULT 2,
    "position" VARCHAR(10) NOT NULL DEFAULT 'before',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "currency_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."language_configs" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "nativeName" VARCHAR(100) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isRTL" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "language_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "currency_configs_code_key" ON "public"."currency_configs"("code");

-- CreateIndex
CREATE UNIQUE INDEX "language_configs_code_key" ON "public"."language_configs"("code");
