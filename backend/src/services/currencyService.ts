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

  /**
   * Change the business base currency
   * This will:
   * 1. Update business config with new base currency
   * 2. Update product prices using conversion rate
   * 3. Update product variant prices using conversion rate
   * 4. Update isBase flags in exchange_rates table
   * 5. Update isDefault flags and rates in currency_config table
   */
  async changeBaseCurrency(newBaseCurrency: string, conversionRate: number): Promise<{ success: boolean; message: string; updatedProducts: number }> {
    try {
      console.log(`🔄 Starting base currency change to ${newBaseCurrency} with rate ${conversionRate}`);

      // 1. Update or create business config
      const businessConfig = await prisma.businessConfig.upsert({
        where: { businessId: 'default-business' },
        update: { 
          baseCurrency: newBaseCurrency,
          updatedAt: new Date()
        },
        create: {
          businessId: 'default-business',
          baseCurrency: newBaseCurrency,
          businessName: 'Default Business',
          isActive: true
        }
      });

      console.log(`✅ Business config updated with base currency: ${newBaseCurrency}`);

      // 2. Update all product prices
      const updatedProducts = await this.updateProductPrices(conversionRate);
      console.log(`✅ Updated ${updatedProducts} products`);

      // 3. Update all product variant prices
      const updatedVariants = await this.updateProductVariantPrices(conversionRate);
      console.log(`✅ Updated ${updatedVariants} product variants`);

      // 4. Update isBase flags in exchange_rates table
      await this.updateExchangeRateBaseFlags(newBaseCurrency);

      // 5. Update currency_config table (isDefault flags and rates)
      await this.updateCurrencyConfigRates(newBaseCurrency, conversionRate);

      console.log(`🎉 Base currency change completed successfully!`);
      
      return {
        success: true,
        message: `Base currency changed to ${newBaseCurrency}. Updated ${updatedProducts} products and ${updatedVariants} variants.`,
        updatedProducts: updatedProducts + updatedVariants
      };

    } catch (error: any) {
      console.error('❌ Error changing base currency:', error);
      throw new Error(`Failed to change base currency: ${error.message}`);
    }
  }

  /**
   * Update all product prices based on the conversion rate
   */
  private async updateProductPrices(conversionRate: number): Promise<number> {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        price: true,
        salePrice: true,
        comparePrice: true,
        costPrice: true
      }
    });

    let updatedCount = 0;

    for (const product of products) {
      const updateData: any = {};

      // Update price if it exists
      if (product.price) {
        updateData.price = Number(product.price) * conversionRate;
      }

      // Update sale price if it exists
      if (product.salePrice) {
        updateData.salePrice = Number(product.salePrice) * conversionRate;
      }

      // Update compare price if it exists
      if (product.comparePrice) {
        updateData.comparePrice = Number(product.comparePrice) * conversionRate;
      }

      // Update cost price if it exists
      if (product.costPrice) {
        updateData.costPrice = Number(product.costPrice) * conversionRate;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await prisma.product.update({
          where: { id: product.id },
          data: updateData
        });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Update all product variant prices based on the conversion rate
   */
  private async updateProductVariantPrices(conversionRate: number): Promise<number> {
    const variants = await prisma.productVariant.findMany({
      select: {
        id: true,
        price: true,
        comparePrice: true,
        costPrice: true
      }
    });

    let updatedCount = 0;

    for (const variant of variants) {
      const updateData: any = {};

      // Update price if it exists
      if (variant.price) {
        updateData.price = Number(variant.price) * conversionRate;
      }

      // Update compare price if it exists
      if (variant.comparePrice) {
        updateData.comparePrice = Number(variant.comparePrice) * conversionRate;
      }

      // Update cost price if it exists
      if (variant.costPrice) {
        updateData.costPrice = Number(variant.costPrice) * conversionRate;
      }

      // Only update if there are changes
      if (Object.keys(updateData).length > 0) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: updateData
        });
        updatedCount++;
      }
    }

    return updatedCount;
  }

  /**
   * Convert price using the conversion rate
   * Example: If conversionRate is 280 (USD→PKR), then 2 USD becomes 560 PKR
   */
  private convertPrice(price: number, conversionRate: number): number {
    const convertedPrice = price * conversionRate;
    // Round to 2 decimal places for currency
    return Math.round(convertedPrice * 100) / 100;
  }

  /**
   * Create exchange rates for the new base currency
   */
  private async createExchangeRates(newBaseCurrency: string): Promise<void> {
    // Get all available currencies from the existing system
    const currencies = ['USD', 'EUR', 'GBP', 'PKR', 'CAD', 'AUD']; // Add more as needed

    for (const currency of currencies) {
      if (currency === newBaseCurrency) {
        // Base currency rate is always 1
        await prisma.exchangeRate.upsert({
          where: { 
            fromCurrency_toCurrency: {
              fromCurrency: newBaseCurrency,
              toCurrency: newBaseCurrency
            }
          },
          update: { rate: 1.0, isBase: true, lastUpdated: new Date() },
          create: {
            fromCurrency: newBaseCurrency,
            toCurrency: newBaseCurrency,
            rate: 1.0,
            isBase: true,
            isActive: true,
            source: 'System'
          }
        });
      } else {
        // For now, create placeholder rates that need to be updated manually
        // In production, you'd call an external API to get real rates
        const placeholderRate = this.getPlaceholderRate(newBaseCurrency, currency);
        
        await prisma.exchangeRate.upsert({
          where: { 
            fromCurrency_toCurrency: {
              fromCurrency: newBaseCurrency,
              toCurrency: currency
            }
          },
          update: { 
            rate: placeholderRate, 
            lastUpdated: new Date(),
            source: 'Placeholder'
          },
          create: {
            fromCurrency: newBaseCurrency,
            toCurrency: currency,
            rate: placeholderRate,
            isBase: false,
            isActive: true,
            source: 'Placeholder'
          }
        });
      }
    }
  }

  /**
   * Update isBase flags in exchange_rates table
   */
  private async updateExchangeRateBaseFlags(newBaseCurrency: string): Promise<void> {
    await prisma.exchangeRate.updateMany({
      where: {
        fromCurrency: newBaseCurrency,
        toCurrency: newBaseCurrency
      },
      data: {
        isBase: true,
        isActive: true
      }
    });

    await prisma.exchangeRate.updateMany({
      where: {
        fromCurrency: newBaseCurrency,
        toCurrency: {
          not: newBaseCurrency
        }
      },
      data: {
        isBase: false,
        isActive: true
      }
    });
  }

  /**
   * Update currency_config table (isDefault flags and rates)
   */
  private async updateCurrencyConfigRates(newBaseCurrency: string, conversionRate: number): Promise<void> {
    // Get the current base currency before we change it
    const currentConfig = await prisma.businessConfig.findFirst({
      where: { isActive: true }
    });
    
    const oldBaseCurrency = currentConfig?.baseCurrency;
    
    if (!oldBaseCurrency || oldBaseCurrency === newBaseCurrency) {
      console.log('No base currency change needed or old base currency not found');
      return;
    }

    // Get all currencies from currency_config table
    const currencies = await prisma.currencyConfig.findMany({
      where: { isActive: true }
    });

    for (const currency of currencies) {
      if (currency.code === newBaseCurrency) {
        // New base currency: rate = 1.0, isDefault = true
        await prisma.currencyConfig.update({
          where: { id: currency.id },
          data: {
            isDefault: true,
            rate: 1.0,
            updatedAt: new Date()
          }
        });
      } else if (currency.code === oldBaseCurrency) {
        // Old base currency: rate = 1/conversionRate, isDefault = false
        await prisma.currencyConfig.update({
          where: { id: currency.id },
          data: {
            isDefault: false,
            rate: 1 / conversionRate,
            updatedAt: new Date()
          }
        });
      } else {
        // Other currencies: calculate new rate using formula
        // Formula: newRate = (1 / conversionRate) × oldRate
        // Where oldRate is the current rate from old base to this currency
        
        // Get the current rate from old base to this currency
        const currentRate = currency.rate;
        
        if (currentRate && currentRate > 0) {
          const newRate = (1 / conversionRate) * currentRate;
          
          await prisma.currencyConfig.update({
            where: { id: currency.id },
            data: {
              isDefault: false,
              rate: newRate,
              updatedAt: new Date()
            }
          });
        }
      }
    }
  }

  /**
   * Get current business base currency
   */
  async getBaseCurrency(): Promise<string> {
    const config = await prisma.businessConfig.findFirst({
      where: { businessId: 'default-business', isActive: true }
    });
    
    return config?.baseCurrency || 'USD'; // Default to USD if not set
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) return 1.0;

    const rate = await prisma.exchangeRate.findFirst({
      where: {
        fromCurrency,
        toCurrency,
        isActive: true
      }
    });

    return rate?.rate || 1.0;
  }

  /**
   * Convert price from one currency to another
   */
  async convertPrice(
    price: number, 
    fromCurrency: string, 
    toCurrency: string
  ): Promise<number> {
    if (fromCurrency === toCurrency) return price;

    const rate = await this.getExchangeRate(fromCurrency, toCurrency);
    const convertedPrice = price * rate;
    
    // Round to 2 decimal places for currency
    return Math.round(convertedPrice * 100) / 100;
  }
}

export default new CurrencyService();
