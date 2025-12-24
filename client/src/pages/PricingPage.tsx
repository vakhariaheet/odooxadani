import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

const detailedPlans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for event attendees and casual users',
    features: [
      'Browse unlimited events',
      'Basic event booking',
      'Email notifications',
      'Mobile app access',
      'Basic customer support',
      'Event calendar sync',
    ],
    limitations: [
      'No event creation',
      'Limited to 5 bookings per month',
      'Basic search filters only',
    ],
    cta: 'Get Started Free',
    popular: false,
    color: 'gray',
  },
  {
    name: 'Organizer Pro',
    price: '$29',
    period: 'per month',
    description: 'Advanced tools for professional event organizers',
    features: [
      'Unlimited event creation',
      'Advanced analytics dashboard',
      'Custom branding & themes',
      'Priority customer support',
      'Marketing automation tools',
      'Attendee management system',
      'Custom registration forms',
      'Payment processing integration',
      'Social media promotion tools',
      'Email marketing campaigns',
    ],
    limitations: [],
    cta: 'Start 14-Day Free Trial',
    popular: true,
    color: 'blue',
  },
  {
    name: 'Venue Owner',
    price: '$49',
    period: 'per month',
    description: 'Comprehensive venue management suite',
    features: [
      'Unlimited venue listings',
      'Real-time availability calendar',
      'Revenue analytics & reporting',
      'Booking management system',
      'Multi-location support',
      'Dynamic pricing tools',
      'Customer relationship management',
      'Automated booking confirmations',
      'Integration with existing systems',
      'Dedicated account manager',
    ],
    limitations: [],
    cta: 'List Your Venue',
    popular: false,
    color: 'purple',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'pricing',
    description: 'Tailored solutions for large organizations',
    features: [
      'Everything in Venue Owner',
      'Custom integrations',
      'White-label solutions',
      'Advanced security features',
      'Dedicated infrastructure',
      '24/7 premium support',
      'Custom reporting',
      'API access',
      'Training & onboarding',
      'SLA guarantees',
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false,
    color: 'gold',
  },
];

const faqs = [
  {
    question: 'Can I change plans at any time?',
    answer:
      "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences.",
  },
  {
    question: 'Is there a free trial available?',
    answer:
      'We offer a 14-day free trial for our Organizer Pro and Venue Owner plans. No credit card required to start.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, PayPal, and bank transfers for annual plans. All payments are processed securely.',
  },
  {
    question: 'Do you offer discounts for annual billing?',
    answer:
      'Yes! Save 20% when you choose annual billing on any paid plan. Contact us for custom enterprise pricing.',
  },
];

export function PricingPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Choose Your Perfect Plan</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Transparent pricing with no hidden fees. Start free and scale as you grow.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8 max-w-7xl mx-auto mb-20">
          {detailedPlans.map((plan, index) => (
            <Card
              key={index}
              className={`relative hover:shadow-lg transition-shadow ${plan.popular ? 'border-blue-500 border-2 scale-105' : ''}`}
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
                  {plan.price !== 'Custom' && <span className="text-gray-600">/{plan.period}</span>}
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <span className="text-green-500 mr-2 mt-0.5">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                  {plan.limitations.map((limitation, limitationIndex) => (
                    <li key={limitationIndex} className="flex items-start">
                      <span className="text-red-500 mr-2 mt-0.5">✗</span>
                      <span className="text-sm text-gray-500">{limitation}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
                  variant={plan.popular ? 'default' : 'outline'}
                  asChild
                >
                  <Link to={plan.name === 'Enterprise' ? '/contact' : '/sign-up'}>{plan.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-8 rounded-lg">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Our team is here to help you choose the right plan for your needs.
          </p>
          <Button size="lg" variant="secondary" asChild>
            <Link to="/contact">Contact Our Sales Team</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
