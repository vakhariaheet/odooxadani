import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Event Organizer',
    content:
      'EventHub transformed how I manage events. The booking system is seamless and my attendees love the user experience.',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Chen',
    role: 'Venue Owner',
    content:
      'Since joining EventHub, our venue bookings increased by 40%. The analytics help us optimize our pricing and availability.',
    avatar: '👨‍💻',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Event Attendee',
    content:
      'Finding and booking events has never been easier. I love the personalized recommendations and instant confirmations.',
    avatar: '👩‍🎨',
  },
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of satisfied users who trust EventHub for their event needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="text-center">
                <div className="text-4xl mb-4">{testimonial.avatar}</div>
                <div>
                  <h4 className="font-semibold text-lg">{testimonial.name}</h4>
                  <p className="text-blue-600 font-medium">{testimonial.role}</p>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-center italic">
                  "{testimonial.content}"
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
