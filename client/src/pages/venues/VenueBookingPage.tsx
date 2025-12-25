import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Clock, Users, DollarSign } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Separator } from '../../components/ui/separator';
import { useVenueDetails } from '../../hooks/useVenues';
import { formatPrice, formatCapacity } from '../../types/venue';
import { toast } from 'sonner';

export function VenueBookingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: venueResponse, isLoading, error } = useVenueDetails(id || '');
  const venue = venueResponse?.data;

  // ⚠️ PLACEHOLDER NOTICE ⚠️
  // This is a UI mockup for the booking system module (F04)
  // Actual booking functionality will be implemented in F04
  // DO NOT implement real booking logic here

  const [bookingData, setBookingData] = useState({
    eventDate: '',
    startTime: '09:00',
    endTime: '17:00',
    guestCount: '',
    eventType: '',
    specialRequests: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
  });

  useEffect(() => {
    if (venue) {
      document.title = `Book ${venue.name} - Odoo Xadani`;
    }
  }, [venue]);

  const handleInputChange = (field: string, value: string) => {
    setBookingData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!bookingData.eventDate || !bookingData.guestCount || !bookingData.contactName || !bookingData.contactEmail) {
        toast.error('Please fill in all required fields');
        return;
      }

      // ⚠️ PLACEHOLDER NOTICE ⚠️
      // This is a UI mockup for the booking system module (F04)
      // Actual booking API call will be implemented in F04
      // DO NOT implement real booking logic here
      console.log('PLACEHOLDER: Booking data (F04 will implement):', { venueId: id, ...bookingData });
      
      // Simulate API call for demo purposes only
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Booking form submitted! (Actual booking system coming in F04)');
      navigate('/venues');
    } catch (err) {
      console.error('Booking form submission error:', err);
      toast.error('Failed to submit booking form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-96 bg-muted rounded"></div>
            <div className="h-64 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !venue) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">Venue Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The venue you're trying to book doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate('/venues')}>
              Browse All Venues
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Back Button */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(`/venues/${id}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Venue Details
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Booking Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Book {venue.name}</CardTitle>
              <p className="text-muted-foreground">
                Fill out the form below to request a booking for this venue.
              </p>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Event Details</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="eventDate">Event Date *</Label>
                      <Input
                        id="eventDate"
                        type="date"
                        value={bookingData.eventDate}
                        onChange={(e) => handleInputChange('eventDate', e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="guestCount">Number of Guests *</Label>
                      <Input
                        id="guestCount"
                        type="number"
                        placeholder="e.g., 50"
                        value={bookingData.guestCount}
                        onChange={(e) => handleInputChange('guestCount', e.target.value)}
                        min="1"
                        max={venue.capacity.max}
                        required
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Max capacity: {formatCapacity(venue.capacity)}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={bookingData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={bookingData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Input
                      id="eventType"
                      placeholder="e.g., Wedding, Corporate Event, Birthday Party"
                      value={bookingData.eventType}
                      onChange={(e) => handleInputChange('eventType', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      placeholder="Any special requirements or requests for your event..."
                      value={bookingData.specialRequests}
                      onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <Separator />

                {/* Contact Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div>
                    <Label htmlFor="contactName">Full Name *</Label>
                    <Input
                      id="contactName"
                      placeholder="Your full name"
                      value={bookingData.contactName}
                      onChange={(e) => handleInputChange('contactName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contactEmail">Email Address *</Label>
                      <Input
                        id="contactEmail"
                        type="email"
                        placeholder="your.email@example.com"
                        value={bookingData.contactEmail}
                        onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="contactPhone">Phone Number</Label>
                      <Input
                        id="contactPhone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={bookingData.contactPhone}
                        onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Submit Button */}
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate(`/venues/${id}`)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Booking Request'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Booking Summary */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Venue Info */}
              <div className="space-y-2">
                <h4 className="font-medium">{venue.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {venue.location.city}, {venue.location.state}
                </p>
              </div>

              <Separator />

              {/* Pricing Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Base Price:</span>
                  <span className="font-medium ml-auto">{formatPrice(venue.pricing)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Capacity:</span>
                  <span className="font-medium ml-auto">{formatCapacity(venue.capacity)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Date:</span>
                  <span className="font-medium ml-auto">
                    {bookingData.eventDate || 'Not selected'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Time:</span>
                  <span className="font-medium ml-auto">
                    {bookingData.startTime} - {bookingData.endTime}
                  </span>
                </div>
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground space-y-1">
                <p>• This is a booking request, not a confirmed reservation</p>
                <p>• The venue owner will contact you to confirm availability</p>
                <p>• Final pricing may vary based on your specific requirements</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}