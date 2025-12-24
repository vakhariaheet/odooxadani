import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for event attendees',
    features: [
      'Browse unlimited events',
      'Basic event booking',
      'Email notifications',
      'Mobile app access',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Organizer Pro',
    price: '$29',
    period: 'per month',
    description: 'Advanced tools for event organizers',
    features: [
      'Unlimited event creation',
      'Advanced analytics',
      'Custom branding',
      'Priority support',
      'Marketing tools',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Venue Owner',
    price: '$49',
    period: 'per month',
    description: 'Comprehensive venue management',
    features: [
      'Venue listing & management',
      'Real-time availability',
      'Revenue analytics',
      'Booking management',
      'Multi-location support',
    ],
    cta: 'List Your Venue',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Simple, Transparent Pricing</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'border-blue-500 border-2' : ''}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-gray-600">/{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <span className="text-green-500 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to="/sign-up">{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
