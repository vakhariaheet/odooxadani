/**
 * BookingList Component
 *
 * Displays a list of bookings with filtering and pagination
 */

import { useState } from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Skeleton } from '../ui/skeleton';
import { BookingCard } from './BookingCard';
import { useBookings, useBookingStats } from '../../hooks/useBookings';
import { type Booking, type ListBookingsQuery } from '../../services/bookingsApi';

interface BookingListProps {
  onCreateBooking?: () => void;
  onViewBooking?: (booking: Booking) => void;
}

export const BookingList: React.FC<BookingListProps> = ({ onCreateBooking, onViewBooking }) => {
  const [filters, setFilters] = useState<ListBookingsQuery>({
    limit: 10,
    offset: 0,
  });

  const { data: bookingsData, isLoading, error } = useBookings(filters);
  const { data: stats } = useBookingStats();

  const handleFilterChange = (key: keyof ListBookingsQuery, value: string | undefined) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === 'all' ? undefined : value,
      offset: 0, // Reset to first page when filtering
    }));
  };

  const handleLoadMore = () => {
    if (bookingsData) {
      setFilters((prev) => ({
        ...prev,
        offset: (prev.offset || 0) + (prev.limit || 10),
      }));
    }
  };

  const hasMore = bookingsData && bookingsData.bookings.length < bookingsData.totalCount;

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-600">
            <p>Failed to load bookings</p>
            <p className="text-sm text-muted-foreground mt-1">
              {error instanceof Error ? error.message : 'Unknown error'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">My Bookings</h2>
          {stats && (
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline">{stats.total} Total</Badge>
              <Badge variant="secondary">{stats.pending} Pending</Badge>
              <Badge variant="default">{stats.confirmed} Confirmed</Badge>
              <Badge variant="destructive">{stats.cancelled} Cancelled</Badge>
              <Badge variant="outline">{stats.completed} Completed</Badge>
            </div>
          )}
        </div>

        {onCreateBooking && (
          <Button onClick={onCreateBooking} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select
                value={filters.status || 'all'}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select
                value={filters.bookingType || 'all'}
                onValueChange={(value) => handleFilterChange('bookingType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="event">Event</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings List */}
      <div className="space-y-4">
        {isLoading && filters.offset === 0 ? (
          // Initial loading
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : bookingsData?.bookings.length === 0 ? (
          // Empty state
          <Card>
            <CardContent className="p-12 text-center">
              <div className="text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No bookings found</h3>
                <p className="text-sm">
                  {Object.keys(filters).some((key) => filters[key as keyof ListBookingsQuery])
                    ? 'Try adjusting your filters or create a new booking.'
                    : "You haven't made any bookings yet. Create your first booking to get started!"}
                </p>
                {onCreateBooking && (
                  <Button onClick={onCreateBooking} className="mt-4">
                    Create Your First Booking
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          // Bookings list
          <>
            {bookingsData?.bookings.map((booking) => (
              <BookingCard
                key={booking.bookingId}
                booking={booking}
                onViewDetails={onViewBooking}
              />
            ))}

            {/* Load More */}
            {hasMore && (
              <div className="text-center">
                <Button variant="outline" onClick={handleLoadMore} disabled={isLoading}>
                  {isLoading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}

            {/* Results Summary */}
            {bookingsData && (
              <div className="text-center text-sm text-muted-foreground">
                Showing {bookingsData.bookings.length} of {bookingsData.totalCount} bookings
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
