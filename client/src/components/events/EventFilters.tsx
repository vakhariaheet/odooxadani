/**
 * EventFilters Component
 * Comprehensive filtering sidebar for events
 */

import { useState } from 'react';
import { CalendarDays, MapPin, DollarSign, Tag } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import type { EnhancedEventFilters, EventCategory } from '../../types/event';
import { EVENT_CATEGORIES } from '../../types/event';

interface EventFiltersProps {
  filters: EnhancedEventFilters;
  onFiltersChange: (filters: EnhancedEventFilters) => void;
  onClose?: () => void;
}

export function EventFilters({ filters, onFiltersChange, onClose }: EventFiltersProps) {
  const [priceRange, setPriceRange] = useState([
    filters.priceRange?.min || 0,
    filters.priceRange?.max || 500,
  ]);

  const handleCategoryChange = (category: EventCategory, checked: boolean) => {
    const currentCategories = filters.categories || [];
    const newCategories = checked
      ? [...currentCategories, category]
      : currentCategories.filter((c) => c !== category);

    onFiltersChange({
      ...filters,
      categories: newCategories.length > 0 ? newCategories : undefined,
    });
  };

  const handleCityAdd = (city: string) => {
    if (!city.trim()) return;

    const currentCities = filters.cities || [];
    if (currentCities.includes(city.trim())) return;

    onFiltersChange({
      ...filters,
      cities: [...currentCities, city.trim()],
    });
  };

  const handleCityRemove = (city: string) => {
    const currentCities = filters.cities || [];
    const newCities = currentCities.filter((c) => c !== city);

    onFiltersChange({
      ...filters,
      cities: newCities.length > 0 ? newCities : undefined,
    });
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    onFiltersChange({
      ...filters,
      priceRange: {
        min: values[0],
        max: values[1],
      },
    });
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', value: string) => {
    onFiltersChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [field]: value || undefined,
      },
    });
  };

  const handleLocationChange = (field: 'lat' | 'lng' | 'radius', value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    onFiltersChange({
      ...filters,
      location: {
        lat: field === 'lat' ? numValue : filters.location?.lat || 0,
        lng: field === 'lng' ? numValue : filters.location?.lng || 0,
        radius: field === 'radius' ? numValue : filters.location?.radius || 50,
      },
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({});
    setPriceRange([0, 500]);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold">Filters</h3>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            Clear all
          </Button>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Done
            </Button>
          )}
        </div>
      </div>

      <ScrollArea className="h-96">
        <div className="p-4 space-y-6">
          {/* Categories */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <Label className="font-medium">Categories</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {EVENT_CATEGORIES.map((category) => (
                <div key={category.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={category.value}
                    checked={filters.categories?.includes(category.value) || false}
                    onCheckedChange={(checked) =>
                      handleCategoryChange(category.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={category.value} className="text-sm font-normal cursor-pointer">
                    {category.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Location */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <MapPin className="h-4 w-4" />
              <Label className="font-medium">Location</Label>
            </div>

            {/* City Filter */}
            <div className="space-y-2">
              <Label className="text-sm">Cities</Label>
              <div className="flex space-x-2">
                <Input
                  placeholder="Add city..."
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCityAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
              </div>
              {filters.cities && filters.cities.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {filters.cities.map((city) => (
                    <Button
                      key={city}
                      variant="secondary"
                      size="sm"
                      onClick={() => handleCityRemove(city)}
                      className="h-6 text-xs"
                    >
                      {city} ×
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Radius */}
            <div className="space-y-2">
              <Label className="text-sm">Location Radius (km)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  placeholder="Latitude"
                  value={filters.location?.lat || ''}
                  onChange={(e) => handleLocationChange('lat', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Longitude"
                  value={filters.location?.lng || ''}
                  onChange={(e) => handleLocationChange('lng', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Radius"
                  value={filters.location?.radius || ''}
                  onChange={(e) => handleLocationChange('radius', e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Price Range */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4" />
              <Label className="font-medium">Price Range</Label>
            </div>
            <div className="space-y-4">
              <Slider
                value={priceRange}
                onValueChange={handlePriceRangeChange}
                max={500}
                min={0}
                step={10}
                className="w-full"
              />
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}+</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Range */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <CalendarDays className="h-4 w-4" />
              <Label className="font-medium">Date Range</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-sm">From</Label>
                <Input
                  type="date"
                  value={filters.dateRange?.startDate || ''}
                  onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                />
              </div>
              <div>
                <Label className="text-sm">To</Label>
                <Input
                  type="date"
                  value={filters.dateRange?.endDate || ''}
                  onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
