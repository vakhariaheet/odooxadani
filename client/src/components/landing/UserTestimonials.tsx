import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  company: string;
  content: string;
  avatar: string;
  rating: number;
  eventType: string;
  location: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    role: 'Event Director',
    company: 'TechCorp',
    content:
      "EventHub transformed how we manage corporate events. The booking system is seamless, and our attendees love the user experience. We've seen a 40% increase in event satisfaction scores.",
    avatar: '👩‍💼',
    rating: 5,
    eventType: 'Corporate',
    location: 'San Francisco',
  },
  {
    id: 2,
    name: 'Michael Chen',
    role: 'Venue Owner',
    company: 'Grand Ballroom',
    content:
      'Since joining EventHub, our venue bookings increased by 60%. The analytics help us optimize pricing and availability. The platform pays for itself within the first month.',
    avatar: '👨‍💻',
    rating: 5,
    eventType: 'Weddings',
    location: 'New York',
  },
  {
    id: 3,
    name: 'Emily Rodriguez',
    role: 'Wedding Planner',
    company: 'Dream Events',
    content:
      'Finding and booking venues has never been easier. The real-time availability and instant confirmations save me hours every week. My clients are always impressed with the smooth process.',
    avatar: '👩‍🎨',
    rating: 5,
    eventType: 'Weddings',
    location: 'Los Angeles',
  },
  {
    id: 4,
    name: 'David Park',
    role: 'Marketing Manager',
    company: 'StartupHub',
    content:
      "EventHub's event discovery features are incredible. We've found amazing venues we never knew existed and connected with vendors that perfectly match our brand aesthetic.",
    avatar: '👨‍🚀',
    rating: 5,
    eventType: 'Networking',
    location: 'Austin',
  },
  {
    id: 5,
    name: 'Lisa Thompson',
    role: 'Conference Organizer',
    company: 'Global Conferences',
    content:
      'The platform handles everything from venue booking to attendee management. The integration capabilities are outstanding, and the support team is incredibly responsive.',
    avatar: '👩‍🏫',
    rating: 5,
    eventType: 'Conferences',
    location: 'Chicago',
  },
  {
    id: 6,
    name: 'James Wilson',
    role: 'Restaurant Owner',
    company: "Wilson's Bistro",
    content:
      'EventHub opened up a new revenue stream for our restaurant. We now host private events regularly, and the booking management system makes everything effortless.',
    avatar: '👨‍🍳',
    rating: 5,
    eventType: 'Private Dining',
    location: 'Seattle',
  },
];

export const UserTestimonials = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-rotate testimonials
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating);
  };

  const visibleTestimonials = [
    testimonials[currentIndex],
    testimonials[(currentIndex + 1) % testimonials.length],
    testimonials[(currentIndex + 2) % testimonials.length],
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Loved by Event Professionals</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            See what event organizers, venue owners, and attendees are saying about EventHub
          </p>
        </div>

        {/* Featured Testimonial */}
        <div className="max-w-4xl mx-auto mb-12">
          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">{testimonials[currentIndex].avatar}</div>
              <blockquote className="text-xl italic text-gray-700 mb-6 leading-relaxed">
                "{testimonials[currentIndex].content}"
              </blockquote>
              <div className="flex justify-center items-center space-x-4">
                <div>
                  <div className="font-semibold text-lg">{testimonials[currentIndex].name}</div>
                  <div className="text-blue-600 font-medium">
                    {testimonials[currentIndex].role} at {testimonials[currentIndex].company}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {testimonials[currentIndex].location} • {testimonials[currentIndex].eventType}{' '}
                    Events
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl">{renderStars(testimonials[currentIndex].rating)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Testimonial Grid */}
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
          {visibleTestimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className={`hover:shadow-lg transition-all cursor-pointer ${
                index === 0 ? 'ring-2 ring-blue-300' : ''
              }`}
              onClick={() =>
                setCurrentIndex(testimonials.findIndex((t) => t.id === testimonial.id))
              }
              onMouseEnter={() => setIsAutoPlaying(false)}
              onMouseLeave={() => setIsAutoPlaying(true)}
            >
              <CardHeader className="text-center pb-2">
                <div className="text-3xl mb-2">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-blue-600 font-medium text-sm">{testimonial.role}</p>
                  <p className="text-gray-500 text-xs">{testimonial.company}</p>
                </div>
                <div className="flex justify-center items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {testimonial.eventType}
                  </Badge>
                  <span className="text-xs text-gray-500">{testimonial.location}</span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-gray-600 text-center italic text-sm line-clamp-3">
                  "{testimonial.content}"
                </CardDescription>
                <div className="text-center mt-3">
                  <span className="text-sm">{renderStars(testimonial.rating)}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Navigation Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setCurrentIndex(index);
                setIsAutoPlaying(false);
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className="text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">4.9/5</div>
              <div className="text-sm text-gray-600">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">10,000+</div>
              <div className="text-sm text-gray-600">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">99.9%</div>
              <div className="text-sm text-gray-600">Uptime</div>
            </div>
          </div>

          <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
            Join Our Happy Customers
          </Button>
        </div>
      </div>
    </section>
  );
};
