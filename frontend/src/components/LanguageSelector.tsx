import React from 'react';
import { SearchableSelect, SearchableSelectOption } from './ui/searchable-select';
import { DynamicLanguage } from '../stores/cartStore';

interface LanguageSelectorProps {
  languages: DynamicLanguage[];
  selectedLanguage: DynamicLanguage;
  onLanguageChange: (language: DynamicLanguage) => void;
  isLoading?: boolean;
  disabled?: boolean;
  className?: string;
}

export function LanguageSelector({
  languages,
  selectedLanguage,
  onLanguageChange,
  isLoading = false,
  disabled = false,
  className,
}: LanguageSelectorProps) {
  const options: SearchableSelectOption[] = languages.map(language => ({
    value: language.code,
    label: language.nativeName,
    description: language.name,
    icon: (
      <span className="text-lg font-semibold text-primary">
        {language.code.toUpperCase()}
      </span>
    ),
  }));

  const handleValueChange = (value: string) => {
    const language = languages.find(l => l.code === value);
    if (language) {
      onLanguageChange(language);
    }
  };

  if (isLoading) {
    return (
      <div className={className}>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
          Language
        </label>
        <div className="w-full p-3 border border-gray-300 rounded-md bg-gray-50 text-gray-500">
          Loading languages...
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
        Language
      </label>
      <SearchableSelect
        options={options}
        value={selectedLanguage.code}
        onValueChange={handleValueChange}
        placeholder="Select language..."
        searchPlaceholder="Search languages..."
        emptyMessage="No languages found."
        disabled={disabled}
        triggerClassName="h-11"
        contentClassName="w-[400px]"
      />
    </div>
  );
}
