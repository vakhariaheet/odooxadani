import { useState, useEffect, useCallback } from 'react';
import { Search, Grid, List, SlidersHorizontal } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { VenueCard } from './VenueCard';
import { useVenues } from '../../hooks/useVenues';
import { usePermissions } from '../../hooks/usePermissions';
import { useWishlist } from '../../hooks/useWishlist';
import type { VenueSearchQuery, VenueCategory, Venue } from '../../types/venue';
import { VENUE_CATEGORIES, AMENITY_LABELS } from '../../types/venue';

interface VenueListProps {
  showOwnerActions?: boolean;
  onEditVenue?: (venue: Venue) => void;
  onDeleteVenue?: (venue: Venue) => void;
}

export function VenueList({ showOwnerActions = false, onEditVenue, onDeleteVenue }: VenueListProps) {
  const { getCurrentUserId, canEditVenues, canDeleteVenues } = usePermissions();
  const { validateWishlistItems, getWishlistCount } = useWishlist();
  const [searchQuery, setSearchQuery] = useState<VenueSearchQuery>({
    limit: 12,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchText, setSearchText] = useState('');
  const [debouncedSearchText, setDebouncedSearchText] = useState('');

  // Get current user ID
  const currentUserId = getCurrentUserId();

  // Debounce search text
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchText]);

  // Create search query with debounced text
  const searchQueryWithDebounce = {
    ...searchQuery,
    city: debouncedSearchText.trim() || undefined,
  };

  const { data: venuesResponse, isLoading, error } = useVenues(searchQueryWithDebounce);

  const venues = venuesResponse?.data?.venues || [];
  const totalCount = venuesResponse?.data?.totalCount || 0;

  // Validate wishlist items when venues are loaded
  useEffect(() => {
    if (!isLoading && venues.length > 0 && getWishlistCount() > 0) {
      const availableVenueIds = venues.map(venue => venue.venueId);
      validateWishlistItems(availableVenueIds);
    }
  }, [isLoading, venues, validateWishlistItems, getWishlistCount]);

  const handleSearch = useCallback((text: string) => {
    setSearchText(text);
  }, []);

  const handleFilterChange = (key: keyof VenueSearchQuery, value: string | number | string[] | undefined) => {
    setSearchQuery(prev => ({
      ...prev,
      [key]: value,
      offset: 0 // Reset pagination when filters change
    }));
  };

  const handleSortChange = (sortBy: 'name' | 'price' | 'capacity' | 'createdAt', sortOrder: 'asc' | 'desc') => {
    setSearchQuery(prev => ({
      ...prev,
      sortBy,
      sortOrder,
      offset: 0 // Reset pagination when sorting changes
    }));
  };

  const handleCategoryFilter = (category: VenueCategory | '') => {
    setSearchQuery(prev => ({
      ...prev,
      category: category || undefined,
      offset: 0 // Reset pagination when category changes
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
    setDebouncedSearchText('');
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
            className="pl-10 pr-10"
          />
          {searchText && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchText('');
                setDebouncedSearchText('');
              }}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
            >
              ✕
            </Button>
          )}
          {isLoading && searchText && (
            <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleSortChange('name', 'asc')}>
                Name (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('name', 'desc')}>
                Name (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('city', 'asc')}>
                City (A-Z)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('city', 'desc')}>
                City (Z-A)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('capacity', 'asc')}>
                Capacity (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('capacity', 'desc')}>
                Capacity (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price', 'asc')}>
                Price (Low to High)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('price', 'desc')}>
                Price (High to Low)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('createdAt', 'desc')}>
                Newest First
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleSortChange('createdAt', 'asc')}>
                Oldest First
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Category</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleCategoryFilter('')}>
                All Categories
              </DropdownMenuItem>
              {Object.entries(VENUE_CATEGORIES).map(([key, label]) => (
                <DropdownMenuItem key={key} onClick={() => handleCategoryFilter(key)}>
                  {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
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

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? 'Loading...' : 
           debouncedSearchText ? 
             `${totalCount} venues found in "${debouncedSearchText}"` : 
             `${totalCount} venues found`
          }
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
            {debouncedSearchText ? (
              <>
                <p className="text-muted-foreground mb-4">
                  No venues found in "{debouncedSearchText}". Try searching for a different city.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchText('');
                    setDebouncedSearchText('');
                  }}
                >
                  Clear Search
                </Button>
              </>
            ) : (
              <>
                <p className="text-muted-foreground mb-4">No venues found matching your criteria.</p>
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        }>
          {venues.map((venue) => {
            // Check if current user owns this venue
            const isOwner = Boolean(currentUserId && venue.ownerId === currentUserId);
            
            // Determine if owner actions should be shown based on permissions
            const shouldShowOwnerActions = showOwnerActions || (
              isOwner && (canEditVenues(true) || canDeleteVenues(true))
            );
            
            return (
              <VenueCard
                key={venue.venueId}
                venue={venue}
                showOwnerActions={shouldShowOwnerActions}
                onEdit={canEditVenues(isOwner) ? onEditVenue : undefined}
                onDelete={canDeleteVenues(isOwner) ? onDeleteVenue : undefined}
              />
            );
          })}
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