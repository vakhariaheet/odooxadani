import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, DollarSign, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import type { Venue } from '../../types/venue';
import { formatPrice, formatCapacity, VENUE_CATEGORIES, AMENITY_LABELS } from '../../types/venue';

interface VenueCardProps {
  venue: Venue;
  showOwnerActions?: boolean;
  onEdit?: (venue: Venue) => void;
  onDelete?: (venue: Venue) => void;
}

export function VenueCard({ venue, showOwnerActions = false, onEdit, onDelete }: VenueCardProps) {
  const primaryImage = venue.images[0] || '/placeholder-venue.jpg';
  const categoryLabel = VENUE_CATEGORIES[venue.category] || venue.category;

  return (
    <Card className="group hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-0">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <img
            src={primaryImage}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-venue.jpg';
            }}
          />
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {categoryLabel}
            </Badge>
          </div>
          {venue.status !== 'active' && (
            <div className="absolute top-2 right-2">
              <Badge variant="destructive">
                {venue.status === 'inactive' ? 'Inactive' : 'Maintenance'}
              </Badge>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Venue Name and Price */}
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
              {venue.name}
            </h3>
            <div className="flex items-center text-primary font-semibold">
              <DollarSign className="h-4 w-4" />
              <span className="text-sm">{formatPrice(venue.pricing)}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2">
            {venue.description}
          </p>

          {/* Location */}
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
            <span className="line-clamp-1">
              {venue.location.city}, {venue.location.state}
            </span>
          </div>

          {/* Capacity */}
          <div className="flex items-center text-sm text-muted-foreground">
            <Users className="h-4 w-4 mr-1 flex-shrink-0" />
            <span>{formatCapacity(venue.capacity)}</span>
          </div>

          {/* Amenities */}
          {venue.amenities.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {venue.amenities.slice(0, 3).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs">
                  {AMENITY_LABELS[amenity] || amenity}
                </Badge>
              ))}
              {venue.amenities.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{venue.amenities.length - 3} more
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button asChild className="flex-1">
          <Link to={`/venues/${venue.venueId}`}>
            View Details
          </Link>
        </Button>

        {showOwnerActions && (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(venue)}
            >
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete?.(venue)}
              className="text-destructive hover:text-destructive"
            >
              Delete
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}