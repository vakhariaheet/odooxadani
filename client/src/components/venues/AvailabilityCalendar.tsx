import { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { useVenueAvailability } from '../../hooks/useVenues';
import { toast } from 'sonner';
import type { AvailabilitySlot, TimeSlot } from '../../types/venue';

interface AvailabilityCalendarProps {
  venueId: string;
  onTimeSlotSelect?: (date: string, timeSlot: TimeSlot) => void;
  maxCapacity?: number;
}

export function AvailabilityCalendar({ venueId, onTimeSlotSelect, maxCapacity = 100 }: AvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ date: string; slot: TimeSlot } | null>(null);
  const [guestCount, setGuestCount] = useState('');

  // Calculate date range (current month)
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];

  const { data: availabilityResponse, isLoading, error } = useVenueAvailability(
    venueId,
    { startDate, endDate }
  );

  const availability = availabilityResponse?.data || [];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setSelectedDate(null);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  const getDateString = (day: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, day).toISOString().split('T')[0];
  };

  const getAvailabilityForDate = (dateString: string): AvailabilitySlot | null => {
    return availability.find(slot => slot.date === dateString) || null;
  };

  const getAvailableSlots = (dateString: string): number => {
    const dayAvailability = getAvailabilityForDate(dateString);
    if (!dayAvailability) return 0;
    return dayAvailability.timeSlots.filter(slot => slot.available).length;
  };

  const isDateInPast = (day: number): boolean => {
    const dateString = getDateString(day);
    const today = new Date().toISOString().split('T')[0];
    return dateString < today;
  };

  const handleTimeSlotClick = (date: string, slot: TimeSlot) => {
    setSelectedTimeSlot({ date, slot });
    setShowBookingDialog(true);
  };

  const handleBookingSubmit = async () => {
    if (!selectedTimeSlot || !guestCount) {
      toast.error('Please enter the number of guests');
      return;
    }

    const guests = parseInt(guestCount);
    if (guests <= 0 || guests > maxCapacity) {
      toast.error(`Guest count must be between 1 and ${maxCapacity}`);
      return;
    }

    try {
      // ⚠️ PLACEHOLDER NOTICE ⚠️
      // This is a UI mockup for the booking system module (F04)
      // Actual booking API call will be implemented in F04
      // DO NOT implement real booking logic here
      console.log('PLACEHOLDER: Booking timeslot (F04 will implement):', {
        venueId,
        date: selectedTimeSlot.date,
        timeSlot: selectedTimeSlot.slot,
        guestCount: guests
      });

      // Simulate API call for demo purposes only
      await new Promise(resolve => setTimeout(resolve, 1000));

      toast.success(`Time slot selection recorded for ${guests} guests! (Booking system coming in F04)`);
      
      // Call the callback if provided
      onTimeSlotSelect?.(selectedTimeSlot.date, selectedTimeSlot.slot);
      
      // Reset and close dialog
      setShowBookingDialog(false);
      setSelectedTimeSlot(null);
      setGuestCount('');
    } catch (err) {
      console.error('Time slot selection error:', err);
      toast.error('Failed to record time slot selection. Please try again.');
    }
  };

  const handleDialogClose = () => {
    setShowBookingDialog(false);
    setSelectedTimeSlot(null);
    setGuestCount('');
  };
  const formatTime = (time: string): string => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (error) {
    console.error('Availability error:', error);
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-destructive">Failed to load availability. Please try again.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Availability Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[140px] text-center">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {/* Day headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Calendar days */}
                {getDaysInMonth().map((day, index) => {
                  if (day === null) {
                    return <div key={index} className="p-2" />;
                  }

                  const dateString = getDateString(day);
                  const availableSlots = getAvailableSlots(dateString);
                  const isPast = isDateInPast(day);
                  const isSelected = selectedDate === dateString;
                  const isToday = dateString === new Date().toISOString().split('T')[0];

                  return (
                    <button
                      key={day}
                      className={`
                        p-2 text-sm rounded-lg transition-colors relative
                        ${isPast 
                          ? 'text-muted-foreground cursor-not-allowed' 
                          : 'hover:bg-muted cursor-pointer'
                        }
                        ${isSelected ? 'bg-primary text-primary-foreground' : ''}
                        ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}
                      `}
                      onClick={() => !isPast && setSelectedDate(dateString)}
                      disabled={isPast}
                    >
                      <div className="font-medium">{day}</div>
                      {!isPast && availableSlots > 0 && (
                        <div className="text-xs text-green-600 font-medium">
                          {availableSlots} slots
                        </div>
                      )}
                      {!isPast && availableSlots === 0 && (
                        <div className="text-xs text-red-600">
                          Booked
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-100 border border-green-300 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                  <span>Booked</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded"></div>
                  <span>Past</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Time Slots for Selected Date */}
      {selectedDate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Available Times - {new Date(selectedDate).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const dayAvailability = getAvailabilityForDate(selectedDate);
              
              if (!dayAvailability) {
                return (
                  <p className="text-center text-muted-foreground py-4">
                    No availability data for this date.
                  </p>
                );
              }

              const availableSlots = dayAvailability.timeSlots.filter(slot => slot.available);
              const bookedSlots = dayAvailability.timeSlots.filter(slot => !slot.available);

              if (availableSlots.length === 0) {
                return (
                  <p className="text-center text-muted-foreground py-4">
                    No available time slots for this date.
                  </p>
                );
              }

              return (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Available Times</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSlots.map((slot, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          className="justify-start text-green-700 border-green-200 hover:bg-green-50"
                          onClick={() => handleTimeSlotClick(selectedDate, slot)}
                        >
                          <Clock className="h-4 w-4 mr-2" />
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {bookedSlots.length > 0 && (
                    <div>
                      <h4 className="font-medium text-red-700 mb-2">Booked Times</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {bookedSlots.map((slot, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="justify-start text-red-700 bg-red-50"
                          >
                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={handleDialogClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Book Time Slot</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedTimeSlot && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Selected Time Slot</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Date:</strong> {new Date(selectedTimeSlot.date).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {formatTime(selectedTimeSlot.slot.startTime)} - {formatTime(selectedTimeSlot.slot.endTime)}</p>
                </div>
              </div>
            )}
            
            <div>
              <Label htmlFor="guestCount">Number of Guests *</Label>
              <div className="flex items-center gap-2 mt-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <Input
                  id="guestCount"
                  type="number"
                  placeholder="Enter number of guests"
                  value={guestCount}
                  onChange={(e) => setGuestCount(e.target.value)}
                  min="1"
                  max={maxCapacity}
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Maximum capacity: {maxCapacity} guests
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleDialogClose}>
              Cancel
            </Button>
            <Button onClick={handleBookingSubmit} disabled={!guestCount}>
              Book Time Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}