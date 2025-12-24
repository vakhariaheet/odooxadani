import { useState } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { Separator } from '../ui/separator';
import { VenueCard } from './VenueCard';
import { useVenues } from '../../hooks/useVenues';
import type { VenueSearchQuery, VenueCategory } from '../../types/venue';
import { VENUE_CATEGORIES, COMMON_AMENITIES, AMENITY_LABELS } from '../../types/venue';

interface VenueListProps {
  showOwnerActions?: boolean;
  onEditVenue?: (venue: any) => void;
  onDeleteVenue?: (venue: any) => void;
}

export function VenueList({ showOwnerActions = false, onEditVenue, onDeleteVenue }: VenueListProps) {
  const [searchQuery, setSearchQuery] = useState<VenueSearchQuery>({
    limit: 12,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');

  const { data: venuesResponse, isLoading, error } = useVenues(searchQuery);

  const venues = venuesResponse?.data?.venues || [];
  const totalCount = venuesResponse?.data?.totalCount || 0;
  // const filters = venuesResponse?.data?.filters;

  const handleSearch = (text: string) => {
    setSearchText(text);
    // In a real implementation, you might want to search by venue name
    // For now, we'll just update the city filter if it looks like a city name
    setSearchQuery(prev => ({
      ...prev,
      city: text.trim() || undefined,
      offset: 0
    }));
  };

  const handleFilterChange = (key: keyof VenueSearchQuery, value: any) => {
    setSearchQuery(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleAmenityToggle = (amenity: string) => {
    const currentAmenities = searchQuery.amenities || [];
    const newAmenities = currentAmenities.includes(amenity)
      ? currentAmenities.filter(a => a !== amenity)
      : [...currentAmenities, amenity];
    
    handleFilterChange('amenities', newAmenities.length > 0 ? newAmenities : undefined);
  };

  const clearFilters = () => {
    setSearchQuery({
      limit: 12,
      offset: 0,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    });
    setSearchText('');
  };

  const loadMore = () => {
    setSearchQuery(prev => ({
      ...prev,
      offset: (prev.offset || 0) + (prev.limit || 12)
    }));
  };

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load venues. Please try again.</p>
          <Button 
            variant="outline" 
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search venues by city..."
            value={searchText}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
          
          <div className="flex border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={searchQuery.category || ''}
                  onValueChange={(value) => handleFilterChange('category', value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All categories</SelectItem>
                    {Object.entries(VENUE_CATEGORIES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capacity Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Min Capacity</label>
                <Input
                  type="number"
                  placeholder="Min guests"
                  value={searchQuery.minCapacity || ''}
                  onChange={(e) => handleFilterChange('minCapacity', e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </div>

              {/* Price Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Max Price</label>
                <Input
                  type="number"
                  placeholder="Max price"
                  value={searchQuery.maxPrice || ''}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <Select
                  value={`${searchQuery.sortBy}-${searchQuery.sortOrder}`}
                  onValueChange={(value) => {
                    const [sortBy, sortOrder] = value.split('-');
                    handleFilterChange('sortBy', sortBy);
                    handleFilterChange('sortOrder', sortOrder);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt-desc">Newest First</SelectItem>
                    <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="capacity-asc">Capacity: Small to Large</SelectItem>
                    <SelectItem value="capacity-desc">Capacity: Large to Small</SelectItem>
                    <SelectItem value="name-asc">Name: A to Z</SelectItem>
                    <SelectItem value="name-desc">Name: Z to A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Amenities Filter */}
            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Amenities</label>
              <div className="flex flex-wrap gap-2">
                {COMMON_AMENITIES.slice(0, 10).map((amenity) => (
                  <Badge
                    key={amenity}
                    variant={searchQuery.amenities?.includes(amenity) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => handleAmenityToggle(amenity)}
                  >
                    {AMENITY_LABELS[amenity] || amenity}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-4" />
            
            <div className="flex justify-between">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              <Button onClick={() => setShowFilters(false)}>
                Apply Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : `${totalCount} venues found`}
        </p>
        
        {/* Active Filters */}
        {(searchQuery.category || searchQuery.amenities?.length || searchQuery.minCapacity || searchQuery.maxPrice) && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Filters:</span>
            {searchQuery.category && (
              <Badge variant="secondary">
                {VENUE_CATEGORIES[searchQuery.category as VenueCategory]}
              </Badge>
            )}
            {searchQuery.amenities?.map(amenity => (
              <Badge key={amenity} variant="secondary">
                {AMENITY_LABELS[amenity] || amenity}
              </Badge>
            ))}
            {searchQuery.minCapacity && (
              <Badge variant="secondary">
                Min: {searchQuery.minCapacity} guests
              </Badge>
            )}
            {searchQuery.maxPrice && (
              <Badge variant="secondary">
                Max: ${searchQuery.maxPrice}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Venues Grid/List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-video bg-muted rounded-t-lg" />
              <CardContent className="p-4 space-y-3">
                <div className="h-4 bg-muted rounded w-3/4" />
                <div className="h-3 bg-muted rounded w-full" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : venues.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground mb-4">No venues found matching your criteria.</p>
            <Button variant="outline" onClick={clearFilters}>
              Clear Filters
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {venues.map((venue) => (
            <VenueCard
              key={venue.venueId}
              venue={venue}
              showOwnerActions={showOwnerActions}
              onEdit={onEditVenue}
              onDelete={onDeleteVenue}
            />
          ))}
        </div>
      )}

      {/* Load More */}
      {venues.length < totalCount && (
        <div className="text-center">
          <Button variant="outline" onClick={loadMore} disabled={isLoading}>
            Load More Venues
          </Button>
        </div>
      )}
    </div>
  );
}