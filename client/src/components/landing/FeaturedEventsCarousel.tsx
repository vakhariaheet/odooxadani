import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { useLandingData, type Event } from '@/hooks/useLandingData';
import { Link } from 'react-router-dom';

const EventCard = ({ event }: { event: Event }) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price}`;
  };

  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      {event.image && (
        <div className="aspect-video overflow-hidden rounded-t-lg">
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start mb-2">
          <Badge variant="secondary" className="text-xs">
            {event.category}
          </Badge>
          <span className="text-sm font-semibold text-blue-600">{formatPrice(event.price)}</span>
        </div>
        <CardTitle className="text-lg line-clamp-2">{event.title}</CardTitle>
        <CardDescription className="line-clamp-2">{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="mr-2">📅</span>
            {formatDate(event.date)} at {event.time}
          </div>
          <div className="flex items-center">
            <span className="mr-2">📍</span>
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="mr-2">👥</span>
              <span>
                {event.attendees}/{event.capacity}
              </span>
            </div>
            <Button size="sm" asChild>
              <Link to="/dashboard">View Details</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const EventsSkeleton = () => (
  <div className="grid md:grid-cols-3 gap-6">
    {[1, 2, 3].map((i) => (
      <Card key={i} className="h-full">
        <Skeleton className="aspect-video rounded-t-lg" />
        <CardHeader>
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-3/4" />
            <div className="flex justify-between">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-8 w-20" />
            </div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const FeaturedEventsCarousel = () => {
  const { featuredEvents, loading } = useLandingData();

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Discover Amazing Events</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join thousands of attendees at these popular upcoming events
            </p>
          </div>
          <EventsSkeleton />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Discover Amazing Events</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of attendees at these popular upcoming events
          </p>
        </div>

        <div className="relative max-w-6xl mx-auto">
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {featuredEvents.map((event) => (
                <CarouselItem key={event.id} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <EventCard event={event} />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/dashboard">Explore All Events</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
