import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    title: 'Event Discovery',
    description:
      'Smart filtering and personalized recommendations to find events that match your interests and preferences.',
    icon: '🔍',
  },
  {
    title: 'Venue Management',
    description:
      'Real-time availability tracking and comprehensive booking management for venue owners.',
    icon: '🏢',
  },
  {
    title: 'Seamless Booking',
    description:
      'One-click reservations with secure payments and instant confirmation for hassle-free experiences.',
    icon: '⚡',
  },
  {
    title: 'Analytics & Insights',
    description:
      'Performance insights and revenue tracking to help you make data-driven decisions.',
    icon: '📊',
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Why Choose EventHub?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Everything you need to discover, book, and manage events in one powerful platform
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
