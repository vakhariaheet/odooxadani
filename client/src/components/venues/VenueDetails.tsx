import React, { useState } from 'react';
import { MapPin, Users, DollarSign, Calendar, Clock, Star, Share2, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Separator } from '../ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import type { Venue } from '../../types/venue';
import { 
  formatPrice, 
  formatCapacity, 
  formatAddress, 
  VENUE_CATEGORIES, 
  AMENITY_LABELS 
} from '../../types/venue';

interface VenueDetailsProps {
  venue: Venue;
  onBookNow?: () => void;
  onContactOwner?: () => void;
  showOwnerActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function VenueDetails({ 
  venue, 
  onBookNow, 
  onContactOwner,
  showOwnerActions = false,
  onEdit,
  onDelete 
}: VenueDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);

  const categoryLabel = VENUE_CATEGORIES[venue.category] || venue.category;
  const images = venue.images.length > 0 ? venue.images : ['/placeholder-venue.jpg'];

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: venue.name,
          text: venue.description,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Image Gallery */}
      <Card>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
            {/* Main Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-video lg:aspect-[4/3] overflow-hidden rounded-l-lg">
                <img
                  src={images[selectedImageIndex]}
                  alt={venue.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-venue.jpg';
                  }}
                />
                
                {/* Status Badge */}
                {venue.status !== 'active' && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="destructive">
                      {venue.status === 'inactive' ? 'Inactive' : 'Maintenance'}
                    </Badge>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setIsFavorited(!isFavorited)}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={handleShare}
                    className="bg-white/90 hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Thumbnail Grid */}
            {images.length > 1 && (
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {images.slice(0, 4).map((image, index) => (
                  <div
                    key={index}
                    className={`relative aspect-video cursor-pointer overflow-hidden rounded-lg ${
                      selectedImageIndex === index ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img
                      src={image}
                      alt={`${venue.name} ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-venue.jpg';
                      }}
                    />
                    {index === 3 && images.length > 4 && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="text-white font-semibold">
                          +{images.length - 4} more
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{categoryLabel}</Badge>
                    <div className="flex items-center">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm text-muted-foreground ml-1">4.8 (24 reviews)</span>
                    </div>
                  </div>
                  <CardTitle className="text-2xl">{venue.name}</CardTitle>
                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{formatAddress(venue.location)}</span>
                  </div>
                </div>

                {showOwnerActions && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={onEdit}>
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={onDelete}>
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {venue.description}
              </p>
            </CardContent>
          </Card>

          {/* Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="amenities">Amenities</TabsTrigger>
              <TabsTrigger value="availability">Availability</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Capacity</p>
                          <p className="text-sm text-muted-foreground">
                            {formatCapacity(venue.capacity)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <DollarSign className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Pricing</p>
                          <p className="text-sm text-muted-foreground">
                            {formatPrice(venue.pricing)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Availability</p>
                          <p className="text-sm text-muted-foreground">
                            Check calendar for available dates
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="font-medium">Operating Hours</p>
                          <p className="text-sm text-muted-foreground">
                            9:00 AM - 9:00 PM (Default)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="amenities" className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  {venue.amenities.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {venue.amenities.map((amenity) => (
                        <div key={amenity} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                          <span className="text-sm">
                            {AMENITY_LABELS[amenity] || amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No amenities listed for this venue.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="availability" className="space-y-4">
              <AvailabilityCalendar venueId={venue.venueId} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Booking Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Book This Venue</span>
                <span className="text-lg font-bold text-primary">
                  {formatPrice(venue.pricing)}
                </span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Category:</span>
                  <span>{categoryLabel}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Capacity:</span>
                  <span>{formatCapacity(venue.capacity)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={venue.status === 'active' ? 'default' : 'secondary'}>
                    {venue.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {venue.status === 'active' ? (
                  <>
                    <Button className="w-full" onClick={onBookNow}>
                      Book Now
                    </Button>
                    <Button variant="outline" className="w-full" onClick={onContactOwner}>
                      Contact Owner
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      This venue is currently {venue.status}
                    </p>
                    <Button variant="outline" className="w-full" onClick={onContactOwner}>
                      Contact Owner
                    </Button>
                  </div>
                )}
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <p>• Free cancellation up to 24 hours before event</p>
                <p>• Instant booking confirmation</p>
                <p>• Secure payment processing</p>
              </div>
            </CardContent>
          </Card>

          {/* Location Map Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Map integration</p>
                  <p className="text-xs text-muted-foreground">coming soon</p>
                </div>
              </div>
              <div className="mt-4 text-sm">
                <p className="font-medium">{venue.location.address}</p>
                <p className="text-muted-foreground">
                  {venue.location.city}, {venue.location.state} {venue.location.zipCode}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}