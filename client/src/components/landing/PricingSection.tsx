import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const plans = [
  {
    name: 'Participants',
    price: 'Free',
    description: 'Perfect for hackathon participants',
    features: [
      'Pitch unlimited ideas',
      'Browse and join teams',
      'Community voting access',
      'Basic profile creation',
      'Team formation tools',
    ],
    cta: 'Join Free',
    popular: false,
  },
  {
    name: 'Organizers',
    price: '$99',
    period: '/event',
    description: 'For hackathon organizers',
    features: [
      'All participant features',
      'Event analytics dashboard',
      'Moderation tools',
      'Custom branding',
      'Judge management',
      'Export participant data',
    ],
    cta: 'Start Organizing',
    popular: true,
  },
  {
    name: 'Judges',
    price: '$49',
    period: '/event',
    description: 'For hackathon judges',
    features: [
      'Pre-event idea scoring',
      'Feedback management tools',
      'Analytics and insights',
      'Team progress tracking',
      'Scoring templates',
    ],
    cta: 'Start Judging',
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section id="pricing" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-xl text-gray-600 text-center mb-12">
          Free for participants, affordable for organizers and judges
        </p>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`relative ${plan.popular ? 'border-blue-500 shadow-lg scale-105' : ''}`}
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
                  {plan.period && <span className="text-gray-500">{plan.period}</span>}
                </div>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Check className="w-5 h-5 text-green-500 mr-3" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
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
