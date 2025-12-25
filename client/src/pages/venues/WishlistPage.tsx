import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { VenueCard } from '../../components/venues/VenueCard';
import { useWishlist } from '../../hooks/useWishlist';
import { useVenues } from '../../hooks/useVenues';
import { toast } from 'sonner';

export function WishlistPage() {
  const navigate = useNavigate();
  const { 
    getWishlistVenueIds, 
    getWishlistCount, 
    isAuthenticated, 
    isLoaded, 
    clearWishlist,
    removeFromWishlist
  } = useWishlist();
  
  const wishlistVenueIds = getWishlistVenueIds();
  const wishlistCount = getWishlistCount();

  // Fetch a larger set of venues to check against wishlist
  const { data: venuesResponse, isLoading } = useVenues({
    limit: 100, // Fetch more venues to increase chances of finding wishlist items
    enabled: wishlistCount > 0 && isLoaded
  });

  const allVenues = venuesResponse?.data?.venues || [];
  const wishlistVenues = allVenues.filter(venue => 
    wishlistVenueIds.includes(venue.venueId)
  );

  // Clean up deleted venues from wishlist when we have venue data
  useEffect(() => {
    if (isLoaded && !isLoading && wishlistCount > 0 && allVenues.length > 0) {
      // Check if any wishlist venues are missing from the fetched venues
      const fetchedVenueIds = allVenues.map(venue => venue.venueId);
      const missingVenueIds = wishlistVenueIds.filter(id => !fetchedVenueIds.includes(id));
      
      // If we have missing venues and we fetched a reasonable number of venues,
      // it's likely those venues were deleted
      if (missingVenueIds.length > 0 && allVenues.length >= 20) {
        console.log('Found potentially deleted venues:', missingVenueIds);
        
        // Remove missing venues from wishlist
        missingVenueIds.forEach(venueId => {
          removeFromWishlist(venueId);
        });
        
        if (missingVenueIds.length > 0) {
          toast.info(`Removed ${missingVenueIds.length} unavailable venue${missingVenueIds.length === 1 ? '' : 's'} from your wishlist`);
        }
      }
    }
  }, [isLoaded, isLoading, allVenues, wishlistCount, wishlistVenueIds, removeFromWishlist]);

  useEffect(() => {
    document.title = 'My Wishlist - Odoo Xadani';
  }, []);

  // Debug: Log wishlist state
  useEffect(() => {
    console.log('WishlistPage - wishlist state:', {
      isAuthenticated,
      wishlistCount,
      wishlistVenueIds,
      isLoaded
    });
  }, [isAuthenticated, wishlistCount, wishlistVenueIds, isLoaded]);

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-semibold mb-2">Sign In Required</h2>
            <p className="text-muted-foreground mb-6">
              Please sign in to view your wishlist and save your favorite venues.
            </p>
            <Button onClick={() => navigate('/sign-in')}>
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <div>
            <h1 className="text-3xl font-bold">My Wishlist</h1>
            <p className="text-muted-foreground">
              {wishlistCount === 0 
                ? 'No venues saved yet' 
                : `${wishlistCount} venue${wishlistCount === 1 ? '' : 's'} saved`
              }
            </p>
            {/* Debug info */}
            <div className="text-xs text-gray-500 mt-2">
              <p>Debug: Loaded: {isLoaded ? 'Yes' : 'No'}, Auth: {isAuthenticated ? 'Yes' : 'No'}</p>
              <p>Venue IDs: {wishlistVenueIds.join(', ') || 'None'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {!isLoaded ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : isLoading ? (
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
      ) : wishlistCount === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Your wishlist is empty</h3>
            <p className="text-muted-foreground mb-6">
              Start exploring venues and click the heart icon to save your favorites here.
            </p>
            <Button onClick={() => navigate('/venues')}>
              Browse Venues
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Wishlist Stats */}
          <div className="mb-6">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {wishlistVenues.length} of {wishlistCount} saved venues
                    </div>
                    {wishlistVenues.length < wishlistCount && (
                      <div className="text-xs text-amber-600">
                        Some venues may no longer be available
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate('/venues')}
                    >
                      Add More Venues
                    </Button>
                    {/* Debug: Clear wishlist button */}
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm('Clear all wishlist items? This cannot be undone.')) {
                          clearWishlist();
                          toast.success('Wishlist cleared');
                        }
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistVenues.map((venue) => (
              <VenueCard
                key={venue.venueId}
                venue={venue}
                showOwnerActions={false}
              />
            ))}
          </div>

          {/* No venues found message */}
          {wishlistVenues.length === 0 && wishlistCount > 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground mb-4">
                  The venues in your wishlist are currently not available.
                </p>
                <Button variant="outline" onClick={() => navigate('/venues')}>
                  Browse Available Venues
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}