import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah K.",
    role: "Graphic Designer",
    content: "ProposalFlow cut my proposal creation time from 3 hours to 20 minutes. The templates are professional and the client portal makes me look so much more credible.",
    rating: 5,
    avatar: "SK"
  },
  {
    name: "Mike R.",
    role: "Web Developer",
    content: "I get paid 40% faster since switching to ProposalFlow. The automated invoicing and payment reminders are game-changers for my cash flow.",
    rating: 5,
    avatar: "MR"
  },
  {
    name: "Lisa M.",
    role: "Marketing Consultant",
    content: "The client portal makes me look so much more professional. My clients love the seamless experience from proposal to payment.",
    rating: 5,
    avatar: "LM"
  },
  {
    name: "David Chen",
    role: "UX Designer",
    content: "The digital signature feature alone has saved me countless hours. No more printing, scanning, or chasing clients for signatures.",
    rating: 5,
    avatar: "DC"
  },
  {
    name: "Emma Wilson",
    role: "Content Writer",
    content: "ProposalFlow's analytics helped me identify which proposals work best. I've increased my acceptance rate by 30%.",
    rating: 5,
    avatar: "EW"
  },
  {
    name: "James Taylor",
    role: "Photographer",
    content: "The custom branding options make my proposals stand out. Clients often comment on how professional everything looks.",
    rating: 5,
    avatar: "JT"
  }
];

export const TestimonialsSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Loved by Freelancers Worldwide
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Join thousands of freelancers who have transformed their workflow with ProposalFlow.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                
                <blockquote className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </blockquote>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 bg-green-50 px-6 py-3 rounded-full">
            <Star className="h-5 w-5 text-yellow-400 fill-current" />
            <span className="font-semibold text-green-800">4.9/5</span>
            <span className="text-green-700">from 2,500+ reviews</span>
          </div>
        </div>
      </div>
    </section>
  );
};