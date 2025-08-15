import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface CurrencyConfig {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
  position: 'before' | 'after';
  createdAt: Date;
  updatedAt: Date;
}

// Prisma model interface
export interface PrismaCurrencyConfig {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: any; // Prisma Decimal
  isActive: boolean;
  isDefault: boolean;
  decimals: number;
  position: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CurrencyConversion {
  fromCurrency: string;
  toCurrency: string;
  amount: number;
  convertedAmount: number;
  rate: number;
}

export class CurrencyService {
  /**
   * Convert Prisma currency config to our interface
   */
  private static convertPrismaCurrency(prismaCurrency: PrismaCurrencyConfig): CurrencyConfig {
    return {
      ...prismaCurrency,
      rate: Number(prismaCurrency.rate),
      position: prismaCurrency.position as 'before' | 'after'
    };
  }

  /**
   * Get all active currencies
   */
  static async getAllActiveCurrencies(): Promise<CurrencyConfig[]> {
    const currencies = await prisma.currencyConfig.findMany({
      where: { isActive: true },
      orderBy: { code: 'asc' }
    });
    
    return currencies.map(this.convertPrismaCurrency);
  }

  /**
   * Get currency by code
   */
  static async getCurrencyByCode(code: string): Promise<CurrencyConfig | null> {
    const currency = await prisma.currencyConfig.findFirst({
      where: { 
        code: code.toUpperCase(),
        isActive: true 
      }
    });
    
    return currency ? this.convertPrismaCurrency(currency) : null;
  }

  /**
   * Get default currency
   */
  static async getDefaultCurrency(): Promise<CurrencyConfig | null> {
    const currency = await prisma.currencyConfig.findFirst({
      where: { isDefault: true }
    });
    
    return currency ? this.convertPrismaCurrency(currency) : null;
  }

  /**
   * Convert amount between currencies
   */
  static async convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Promise<CurrencyConversion> {
    const from = await this.getCurrencyByCode(fromCurrency);
    const to = await this.getCurrencyByCode(toCurrency);

    if (!from || !to) {
      throw new Error(`Currency not found: ${fromCurrency} or ${toCurrency}`);
    }

    // Convert to USD first, then to target currency
    const usdAmount = amount / from.rate;
    const convertedAmount = usdAmount * to.rate;
    const rate = to.rate / from.rate;

    return {
      fromCurrency: from.code,
      toCurrency: to.code,
      amount,
      convertedAmount,
      rate
    };
  }

  /**
   * Format amount with currency symbol
   */
  static formatCurrency(amount: number, currency: CurrencyConfig): string {
    const formattedAmount = amount.toFixed(currency.decimals);
    
    if (currency.position === 'before') {
      return `${currency.symbol}${formattedAmount}`;
    } else {
      return `${formattedAmount}${currency.symbol}`;
    }
  }

  /**
   * Get exchange rates for a base currency
   */
  static async getExchangeRates(baseCurrency: string = 'USD'): Promise<Record<string, number>> {
    const base = await this.getCurrencyByCode(baseCurrency);
    if (!base) {
      throw new Error(`Base currency not found: ${baseCurrency}`);
    }

    const currencies = await this.getAllActiveCurrencies();
    const rates: Record<string, number> = {};

    for (const currency of currencies) {
      if (currency.code === baseCurrency) {
        rates[currency.code] = 1;
      } else {
        rates[currency.code] = currency.rate / base.rate;
      }
    }

    return rates;
  }

  /**
   * Update exchange rates (would typically be called by an external service)
   */
  static async updateExchangeRates(rates: Record<string, number>): Promise<void> {
    for (const [code, rate] of Object.entries(rates)) {
      await prisma.currencyConfig.updateMany({
        where: { code },
        data: { rate }
      });
    }
  }

  /**
   * Get supported currencies for Stripe
   */
  static async getStripeSupportedCurrencies(): Promise<string[]> {
    // Stripe supports 135+ currencies, but we'll return our configured ones
    const currencies = await this.getAllActiveCurrencies();
    return currencies.map(c => c.code.toLowerCase());
  }
}

export default CurrencyService;
