/**
 * EventSearchBar Component
 * Advanced search with autocomplete and filters
 */

import { useState, useEffect } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { EventFilters } from './EventFilters';
import type { EventSearchQuery, EnhancedEventFilters } from '../../types/event';

interface EventSearchBarProps {
  onSearch: (query: EventSearchQuery) => void;
  initialQuery?: EventSearchQuery;
  placeholder?: string;
  showFilters?: boolean;
}

export function EventSearchBar({
  onSearch,
  initialQuery = {},
  placeholder = 'Search events...',
  showFilters = true,
}: EventSearchBarProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery.query || '');
  const [filters, setFilters] = useState<EnhancedEventFilters>({});
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, filters]);

  const handleSearch = () => {
    const query: EventSearchQuery = {
      ...initialQuery,
      query: searchQuery || undefined,
    };

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      query.category = filters.categories[0]; // For now, use first category
    }

    if (filters.cities && filters.cities.length > 0) {
      query.city = filters.cities[0]; // For now, use first city
    }

    if (filters.priceRange) {
      query.priceRange = filters.priceRange;
    }

    if (filters.dateRange) {
      query.dateRange = filters.dateRange;
    }

    if (filters.location) {
      query.location = filters.location;
    }

    onSearch(query);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilters({});
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.categories?.length) count++;
    if (filters.cities?.length) count++;
    if (filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) count++;
    if (filters.dateRange?.startDate || filters.dateRange?.endDate) count++;
    if (filters.location) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="w-full space-y-4">
      {/* Search Input */}
      <div className="relative flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Filters Button */}
        {showFilters && (
          <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative">
                <Filter className="h-4 w-4 mr-2" />
                Filters
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <EventFilters
                filters={filters}
                onFiltersChange={setFilters}
                onClose={() => setIsFiltersOpen(false)}
              />
            </PopoverContent>
          </Popover>
        )}
      </div>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {filters.categories?.map((category) => (
            <Badge key={category} variant="secondary" className="capitalize">
              {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    categories: prev.categories?.filter((c) => c !== category),
                  }));
                }}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {filters.cities?.map((city) => (
            <Badge key={city} variant="secondary">
              📍 {city}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    cities: prev.cities?.filter((c) => c !== city),
                  }));
                }}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}

          {(filters.priceRange?.min !== undefined || filters.priceRange?.max !== undefined) && (
            <Badge variant="secondary">
              💰 ${filters.priceRange.min || 0} - ${filters.priceRange.max || '∞'}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    priceRange: undefined,
                  }));
                }}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {(filters.dateRange?.startDate || filters.dateRange?.endDate) && (
            <Badge variant="secondary">
              📅 Date Range
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    dateRange: undefined,
                  }));
                }}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          {filters.location && (
            <Badge variant="secondary">
              🌍 Within {filters.location.radius}km
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilters((prev) => ({
                    ...prev,
                    location: undefined,
                  }));
                }}
                className="ml-1 h-4 w-4 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={() => setFilters({})} className="text-xs">
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
