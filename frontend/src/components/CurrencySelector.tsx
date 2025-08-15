import React from 'react';
import { SearchableSelect, SearchableSelectOption } from './ui/searchable-select';
import { DynamicCurrency } from '../stores/cartStore';

interface CurrencySelectorProps {
  currencies: DynamicCurrency[];
  selectedCurrency: DynamicCurrency;
  onCurrencyChange: (currency: DynamicCurrency) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function CurrencySelector({
  currencies,
  selectedCurrency,
  onCurrencyChange,
  isLoading = false,
  disabled = false,
  className,
}: CurrencySelectorProps) {
  const options: SearchableSelectOption[] = currencies.map(currency => ({
    value: currency.code,
    label: currency.name,
    description: `${currency.code} • Rate: ${currency.rate}`,
    icon: (
      <span className="text-lg font-semibold text-primary">
        {currency.code}
      </span>
    ),
  }));

  const handleValueChange = (value: string) => {
    const currency = currencies.find(c => c.code === value);
    if (currency) {
      onCurrencyChange(currency);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
          Currency
        </label>
        <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading currencies...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
        Currency
      </label>
      <SearchableSelect
        options={options}
        value={selectedCurrency.code}
        onValueChange={handleValueChange}
        placeholder="Select currency..."
        searchPlaceholder="Search currencies..."
        emptyMessage="No currencies found."
        disabled={disabled}
        triggerClassName="h-11"
        contentClassName="w-[400px]"
      />
    </div>
  );
}
