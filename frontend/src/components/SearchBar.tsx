import React, { useState, useEffect, useRef } from 'react';
import { Search, Package, Tag, ChevronRight } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';

import { searchService } from '../services/api';
import { getImageUrl } from '../utils/productUtils';

interface SearchResult {
  id: number;
  name: string;
  slug: string;
  type: 'product' | 'category';
  description?: string;
  image?: string;
}

interface SearchBarProps {
  onResultSelect?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onResultSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  


  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Don't close if clicking on search input or dropdown
      if (inputRef.current?.contains(target) || dropdownRef.current?.contains(target)) {
        return;
      }
      
      // Don't close if clicking on menu elements
      if (target.closest('[data-menu]') || target.closest('[role="menu"]') || target.closest('[aria-haspopup="true"]')) {
        return;
      }
      
      setShowDropdown(false);
      setSelectedIndex(-1);
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      const data = await searchService.search(searchQuery);

      const searchResults: SearchResult[] = [
        ...data.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          slug: product.slug,
          type: 'product' as const,
          description: product.shortDescription || product.description,
          image: getImageUrl(product)
        })),
        ...data.categories.map((category: any) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          type: 'category' as const,
          description: category.description,
          image: category.image
        }))
      ];

      setResults(searchResults);
      setShowDropdown(searchResults.length > 0);
      setSelectedIndex(-1);


      
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    if (result.type === 'product') {
      navigate(`/products/${result.slug}`);
    } else {
      navigate(`/categories/${result.slug}`);
    }
    
    setQuery('');
    setShowDropdown(false);
    setSelectedIndex(-1);
    
    // Call the callback to close mobile menu if provided
    if (onResultSelect) {
      onResultSelect();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          handleResultClick(results[selectedIndex]);
        } else if (query.trim()) {
          performSearch(query.trim());
        }
        break;
      case 'Escape':
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };



  return (
    <div className="relative flex-1 max-w-2xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search products, categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (query.trim() && results.length > 0) {
              setShowDropdown(true);
            }
          }}
          className="pl-10 pr-4 py-2 h-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowDropdown(false);
            }}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
          >
            ×
          </Button>
        )}
      </div>



      {/* Search Results Dropdown */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="py-2">
              {results.map((result, index) => (
                <div
                  key={`${result.type}-${result.id}`}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors ${
                    index === selectedIndex ? 'bg-muted/50' : ''
                  }`}
                  onClick={() => handleResultClick(result)}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    {result.type === 'product' ? (
                      <Package className="h-5 w-5 text-primary" />
                    ) : (
                      result.image ? (
                        <img 
                          src={result.image} 
                          alt={result.name}
                          className="h-5 w-5 rounded object-cover"
                        />
                      ) : (
                        <Tag className="h-5 w-5 text-secondary" />
                      )
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm truncate">{result.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.type}
                      </Badge>
                    </div>
                    {result.description && (
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {result.description}
                      </p>
                    )}
                  </div>
                  
                  {/* Navigation Icon */}
                  <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
