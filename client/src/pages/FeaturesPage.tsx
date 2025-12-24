import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const detailedFeatures = [
  {
    category: 'Event Discovery',
    icon: '🔍',
    features: [
      {
        title: 'Smart Search & Filtering',
        description:
          'Advanced search with filters for location, date, category, price range, and more.',
      },
      {
        title: 'Personalized Recommendations',
        description: 'AI-powered suggestions based on your interests and past event attendance.',
      },
      {
        title: 'Real-time Updates',
        description: 'Get notified instantly when new events match your preferences.',
      },
    ],
  },
  {
    category: 'Venue Management',
    icon: '🏢',
    features: [
      {
        title: 'Real-time Availability',
        description: 'Sync your calendar and manage bookings with live availability updates.',
      },
      {
        title: 'Multi-location Support',
        description: 'Manage multiple venues from a single dashboard with centralized control.',
      },
      {
        title: 'Automated Pricing',
        description: 'Dynamic pricing based on demand, seasonality, and market conditions.',
      },
    ],
  },
  {
    category: 'Booking System',
    icon: '⚡',
    features: [
      {
        title: 'One-click Reservations',
        description: 'Streamlined booking process with instant confirmation and secure payments.',
      },
      {
        title: 'Group Bookings',
        description: 'Special rates and management tools for corporate and large group events.',
      },
      {
        title: 'Flexible Cancellation',
        description: 'Customizable cancellation policies with automated refund processing.',
      },
    ],
  },
  {
    category: 'Analytics & Reporting',
    icon: '📊',
    features: [
      {
        title: 'Revenue Analytics',
        description: 'Detailed financial reports with revenue tracking and forecasting.',
      },
      {
        title: 'Performance Metrics',
        description: 'Track attendance, engagement, and customer satisfaction scores.',
      },
      {
        title: 'Market Insights',
        description: 'Industry benchmarks and competitive analysis to optimize your strategy.',
      },
    ],
  },
];

export function FeaturesPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Powerful Features for Every User</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the tools and capabilities that make EventHub the ultimate platform for
            event discovery, venue management, and seamless bookings.
          </p>
        </div>

        {/* Feature Categories */}
        <div className="space-y-20">
          {detailedFeatures.map((category, categoryIndex) => (
            <div key={categoryIndex}>
              <div className="text-center mb-12">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h2 className="text-3xl font-bold">{category.category}</h2>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {category.features.map((feature, featureIndex) => (
                  <Card key={featureIndex} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-gray-600">
                        {feature.description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust EventHub for their event and venue management needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-blue-600"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
