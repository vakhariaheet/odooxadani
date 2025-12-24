import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link } from 'react-router-dom';

const DemoEventList = () => (
  <div className="space-y-4">
    <div className="flex gap-4 mb-6">
      <Input placeholder="Search events..." className="flex-1" />
      <Select>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="tech">Technology</SelectItem>
          <SelectItem value="music">Music</SelectItem>
          <SelectItem value="food">Food & Drink</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid gap-4">
      {[
        { title: 'Tech Conference 2024', date: 'Mar 15', price: '$299', attendees: '342/500' },
        { title: 'Music Festival', date: 'Apr 20', price: '$150', attendees: '1850/2000' },
        { title: 'Food & Wine Expo', date: 'May 10', price: '$89', attendees: '267/300' },
      ].map((event, index) => (
        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{event.title}</h4>
                <p className="text-sm text-gray-600">
                  {event.date} • {event.attendees} attending
                </p>
              </div>
              <Badge variant="secondary">{event.price}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const DemoVenueSearch = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4 mb-6">
      <Input placeholder="Location" />
      <Input placeholder="Date" type="date" />
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Capacity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="50">Up to 50</SelectItem>
          <SelectItem value="100">Up to 100</SelectItem>
          <SelectItem value="300">Up to 300</SelectItem>
        </SelectContent>
      </Select>
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Price Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="budget">$0-$200/hr</SelectItem>
          <SelectItem value="mid">$200-$500/hr</SelectItem>
          <SelectItem value="premium">$500+/hr</SelectItem>
        </SelectContent>
      </Select>
    </div>

    <div className="grid gap-4">
      {[
        { name: 'Grand Ballroom', location: 'Downtown', price: '$500/hr', rating: '4.8 ⭐' },
        { name: 'Rooftop Terrace', location: 'SOMA', price: '$350/hr', rating: '4.9 ⭐' },
        { name: 'Conference Center', location: 'Financial', price: '$750/hr', rating: '4.7 ⭐' },
      ].map((venue, index) => (
        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-semibold">{venue.name}</h4>
                <p className="text-sm text-gray-600">
                  {venue.location} • {venue.rating}
                </p>
              </div>
              <Badge variant="outline">{venue.price}</Badge>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

const DemoBookingForm = () => (
  <div className="space-y-4">
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Grand Ballroom</CardTitle>
        <CardDescription>March 15, 2024 • 2:00 PM - 6:00 PM</CardDescription>
      </CardHeader>
    </Card>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="text-sm font-medium">Event Name</label>
        <Input placeholder="Annual Company Meeting" />
      </div>
      <div>
        <label className="text-sm font-medium">Expected Guests</label>
        <Input placeholder="150" type="number" />
      </div>
    </div>

    <div>
      <label className="text-sm font-medium">Special Requirements</label>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {['Catering', 'A/V Equipment', 'Parking', 'Security'].map((item) => (
          <label key={item} className="flex items-center space-x-2 text-sm">
            <input type="checkbox" className="rounded" />
            <span>{item}</span>
          </label>
        ))}
      </div>
    </div>

    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span>Venue (4 hours)</span>
        <span>$2,000</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span>Service Fee</span>
        <span>$100</span>
      </div>
      <div className="border-t pt-2 flex justify-between items-center font-semibold">
        <span>Total</span>
        <span>$2,100</span>
      </div>
    </div>

    <Button className="w-full" size="lg">
      Confirm Booking
    </Button>
  </div>
);

const DemoDashboard = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">12</div>
          <div className="text-sm text-gray-600">Active Events</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">$15,420</div>
          <div className="text-sm text-gray-600">Revenue</div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">1,247</div>
          <div className="text-sm text-gray-600">Attendees</div>
        </CardContent>
      </Card>
    </div>

    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Recent Bookings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[
            {
              event: 'Tech Conference',
              venue: 'Grand Ballroom',
              status: 'Confirmed',
              amount: '$2,100',
            },
            {
              event: 'Wedding Reception',
              venue: 'Rooftop Terrace',
              status: 'Pending',
              amount: '$1,400',
            },
            {
              event: 'Corporate Meeting',
              venue: 'Conference Center',
              status: 'Confirmed',
              amount: '$3,000',
            },
          ].map((booking, index) => (
            <div
              key={index}
              className="flex justify-between items-center py-2 border-b last:border-b-0"
            >
              <div>
                <div className="font-medium">{booking.event}</div>
                <div className="text-sm text-gray-600">{booking.venue}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{booking.amount}</div>
                <Badge
                  variant={booking.status === 'Confirmed' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {booking.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const InteractiveDemo = () => {
  const [currentStep, setCurrentStep] = useState(0);

  const demoSteps = [
    {
      title: 'Browse Events',
      description: 'Discover events that match your interests',
      component: <DemoEventList />,
    },
    {
      title: 'Find Venues',
      description: 'Search for the perfect venue for your event',
      component: <DemoVenueSearch />,
    },
    {
      title: 'Book Instantly',
      description: 'Complete your booking in just a few clicks',
      component: <DemoBookingForm />,
    },
    {
      title: 'Manage Everything',
      description: 'Track your events and bookings in one place',
      component: <DemoDashboard />,
    },
  ];

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">See EventHub in Action</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience how easy it is to discover events, find venues, and manage bookings
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Step Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {demoSteps.map((step, index) => (
              <Button
                key={index}
                variant={currentStep === index ? 'default' : 'outline'}
                onClick={() => setCurrentStep(index)}
                className="flex-1 min-w-0 sm:flex-none"
                size="sm"
              >
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </Button>
            ))}
          </div>

          {/* Current Step Info */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-semibold mb-2">{demoSteps[currentStep].title}</h3>
            <p className="text-gray-600">{demoSteps[currentStep].description}</p>
          </div>

          {/* Demo Content */}
          <div className="bg-gray-50 rounded-lg p-6 min-h-96 border">
            {demoSteps[currentStep].component}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
            >
              Previous
            </Button>
            <Button
              onClick={() => setCurrentStep(Math.min(demoSteps.length - 1, currentStep + 1))}
              disabled={currentStep === demoSteps.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        <div className="text-center mt-12">
          <Button size="lg" asChild>
            <Link to="/sign-up">Start Your Free Trial</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
