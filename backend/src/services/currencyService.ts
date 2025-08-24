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
   * 
   * Handles the scenario: USD → any currency → any currency safely
   */
  async changeBaseCurrency(newBaseCurrency: string, conversionRate: number): Promise<{ success: boolean; message: string; updatedProducts: number }> {
    try {
      console.log(`🔄 Starting base currency change to ${newBaseCurrency} with rate ${conversionRate}`);

      // 1. Get current business config and base currency
      const currentConfig = await prisma.businessConfig.findFirst({
        where: { isActive: true }
      });
      
      if (!currentConfig) {
        throw new Error('No business configuration found. Please complete business setup first.');
      }

      const oldBaseCurrency = currentConfig.baseCurrency;
      
      if (oldBaseCurrency === newBaseCurrency) {
        throw new Error('New base currency must be different from current base currency');
      }

      console.log(`📊 Current base currency: ${oldBaseCurrency}, New base currency: ${newBaseCurrency}`);

      // 2. Update business config with new base currency
      const businessConfig = await prisma.businessConfig.update({
        where: { id: currentConfig.id },
        data: { 
          baseCurrency: newBaseCurrency,
          updatedAt: new Date()
        }
      });

      console.log(`✅ Business config updated with base currency: ${newBaseCurrency}`);

      // 3. Update all product prices
      const updatedProducts = await this.updateProductPrices(conversionRate);
      console.log(`✅ Updated ${updatedProducts} products`);

      // 4. Update all product variant prices
      const updatedVariants = await this.updateProductVariantPrices(conversionRate);
      console.log(`✅ Updated ${updatedVariants} product variants`);

      // 5. Update all tax rates (SKIPPED - tax rates are percentages, not monetary values)
      // const updatedTaxRates = await this.updateTaxRates(conversionRate);
      const updatedTaxRates = 0; // Tax rates remain unchanged
      console.log(`✅ Skipped tax rates (they are percentages)`);

      // 6. Update all shipping rates
      const updatedShippingRates = await this.updateShippingRates(conversionRate);
      console.log(`✅ Updated ${updatedShippingRates} shipping rates`);

      // 7. Update currency_config table (isDefault flags and rates)
      await this.updateCurrencyConfigRates(oldBaseCurrency, newBaseCurrency, conversionRate);
      console.log(`✅ Updated currency config rates`);

      console.log(`🎉 Base currency change completed successfully!`);
      
      return {
        success: true,
        message: `Base currency changed from ${oldBaseCurrency} to ${newBaseCurrency}. Updated ${updatedProducts} products, ${updatedVariants} variants, skipped tax rates (percentages), and ${updatedShippingRates} shipping rates.`,
        updatedProducts: updatedProducts + updatedVariants + updatedShippingRates
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
   * Update all shipping rates based on the conversion rate
   */
  private async updateShippingRates(conversionRate: number): Promise<number> {
    let updatedCount = 0;

    // Update ShippingRate table (main shipping rates)
    try {
      console.log('🔍 Searching for shipping rates in shipping_rates table...');
      const shippingRates = await prisma.shippingRate.findMany({
        select: { id: true, shippingCost: true }
      });

      console.log(`📊 Found ${shippingRates.length} shipping rates:`, shippingRates);

      for (const shippingRate of shippingRates) {
        const updateData: any = {};
        
        if (shippingRate.shippingCost) {
          const oldCost = Number(shippingRate.shippingCost);
          // Use the same logic as product prices: multiply by conversionRate
          const newCost = oldCost * conversionRate;
          updateData.shippingCost = newCost;
          console.log(`✅ Will update shipping cost ${shippingRate.id}: ${oldCost} → ${newCost} (rate: ${conversionRate})`);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.shippingRate.update({
            where: { id: shippingRate.id },
            data: updateData
          });
          updatedCount++;
          console.log(`✅ Updated shipping rate ${shippingRate.id}`);
        }
      }
    } catch (error) {
      console.error('❌ Error updating shipping rates:', error);
    }

    return updatedCount;
  }

  /**
   * Update isBase flags in exchange_rates table (REMOVED - not needed)
   * The base currency is identified by business_configs.baseCurrency
   */
  // private async updateExchangeRateBaseFlags(newBaseCurrency: string): Promise<void> {
  //   // This function is not needed as we use business_configs.baseCurrency
  //   // to identify the current base currency
  // }

  /**
   * Update currency_config table (isDefault flags and rates)
   * This handles the scenario: USD → any currency → any currency safely
   */
  private async updateCurrencyConfigRates(
    oldBaseCurrency: string, 
    newBaseCurrency: string, 
    conversionRate: number
  ): Promise<void> {
    console.log(`🔄 Updating currency config rates from ${oldBaseCurrency} to ${newBaseCurrency}`);

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
        console.log(`✅ Set ${newBaseCurrency} as new base (rate: 1.0)`);
      } else if (currency.code === oldBaseCurrency) {
        // Old base currency: rate = 1/conversionRate, isDefault = false
        const newRate = 1 / conversionRate;
        await prisma.currencyConfig.update({
          where: { id: currency.id },
          data: {
            isDefault: false,
            rate: newRate,
            updatedAt: new Date()
          }
        });
        console.log(`✅ Updated ${oldBaseCurrency} rate to ${newRate} (1/${conversionRate})`);
      } else {
        // Other currencies: calculate new rate using the enhanced formula
        // Formula: newRate = (1 / conversionRate) × oldRate
        // This works for any base currency change, not just USD
        
        const currentRate = Number(currency.rate);
        
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
          console.log(`✅ Updated ${currency.code} rate from ${currentRate} to ${newRate}`);
        } else {
          console.warn(`⚠️ Skipping ${currency.code} - invalid rate: ${currentRate}`);
        }
      }
    }
  }

  /**
   * Get current business base currency
   */
  async getBaseCurrency(): Promise<string> {
    const config = await prisma.businessConfig.findFirst({
      where: { isActive: true }
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

    return rate ? Number(rate.rate) : 1.0;
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

  /**
   * Get business base currency with symbol and name
   */
  async getBusinessBaseCurrency(): Promise<{ code: string; symbol: string; name: string } | null> {
    try {
      const businessConfig = await prisma.businessConfig.findFirst({
        where: { isActive: true }
      });

      if (!businessConfig) {
        return null;
      }

      const currencyConfig = await prisma.currencyConfig.findFirst({
        where: { 
          code: businessConfig.baseCurrency,
          isActive: true 
        }
      });

      if (!currencyConfig) {
        return null;
      }

      return {
        code: currencyConfig.code,
        symbol: currencyConfig.symbol,
        name: currencyConfig.name
      };
    } catch (error) {
      console.error('Error getting business base currency:', error);
      return null;
    }
  }
}

export default new CurrencyService();
