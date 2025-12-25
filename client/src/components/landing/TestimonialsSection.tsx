import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Full-Stack Developer',
    content:
      'Found my perfect team in 15 minutes instead of 3 hours. We spent the entire hackathon building instead of networking.',
    rating: 5,
  },
  {
    name: 'Mike Rodriguez',
    role: 'UI/UX Designer',
    content:
      'Our idea got 50+ votes before the event. We knew we were on the right track and refined our approach based on feedback.',
    rating: 5,
  },
  {
    name: 'Lisa Park',
    role: 'Event Organizer',
    content:
      'As an organizer, the analytics helped us plan better workshops and understand what participants were most interested in.',
    rating: 5,
  },
];

export const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
