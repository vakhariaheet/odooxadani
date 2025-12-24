import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandingData, type Venue } from '@/hooks/useLandingData';
import { Link } from 'react-router-dom';

const VenueCard = ({ venue }: { venue: Venue }) => {
  const formatPrice = (price: number) => {
    return `$${price}/hour`;
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push('⭐');
    }
    if (hasHalfStar) {
      stars.push('⭐');
    }
    return stars.join('');
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow group">
      {venue.image && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={venue.availability ? 'default' : 'secondary'} className="text-xs">
            {venue.availability ? 'Available' : 'Booked'}
          </Badge>
          <span className="text-sm font-semibold text-green-600">
            {formatPrice(venue.pricePerHour)}
          </span>
        </div>
        <CardTitle className="text-lg line-clamp-1">{venue.name}</CardTitle>
        <CardDescription className="line-clamp-2">{venue.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">📍</span>
              <span className="line-clamp-1">{venue.location}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center text-gray-600">
              <span className="mr-2">👥</span>
              <span>Up to {venue.capacity} guests</span>
            </div>
            <div className="flex items-center">
              <span className="text-xs mr-1">{renderStars(venue.rating)}</span>
              <span className="text-xs text-gray-500">({venue.reviews})</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mb-3">
            {venue.amenities.slice(0, 3).map((amenity, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {amenity}
              </Badge>
            ))}
            {venue.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{venue.amenities.length - 3} more
              </Badge>
            )}
          </div>

          <Button size="sm" className="w-full" asChild>
            <Link to="/dashboard">View Venue</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const VenuesSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i} className="h-full">
        <Skeleton className="aspect-video rounded-t-lg" />
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-16" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const FeaturedVenuesGrid = () => {
  const { featuredVenues, loading } = useLandingData();

  if (loading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Premium Venues</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover exceptional venues for your next event
            </p>
          </div>
          <VenuesSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Premium Venues</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover exceptional venues for your next event, from intimate gatherings to grand
            celebrations
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {featuredVenues.map((venue) => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link to="/dashboard">Browse All Venues</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
