import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight, Star, Users, Zap, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { PricingTier } from '@/types/landing';

export const PricingPage = () => {
  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'free',
      description: 'Perfect for getting started with hackathon team formation',
      features: [
        'Basic team matching',
        'Idea submission and voting',
        'Community access',
        'Profile creation',
        'Up to 3 hackathons per month',
        'Basic analytics',
      ],
      ctaText: 'Get Started Free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 9,
      period: 'month',
      description: 'Advanced features for serious hackathon participants',
      features: [
        'Everything in Free',
        'Priority team matching',
        'Advanced idea analytics',
        'Judge feedback access',
        'Unlimited hackathons',
        'Team performance insights',
        'Early access to new features',
        'Premium support',
      ],
      highlighted: true,
      ctaText: 'Start Pro Trial',
    },
    {
      id: 'team',
      name: 'Team',
      price: 29,
      period: 'month',
      description: 'For organizations and hackathon organizers',
      features: [
        'Everything in Pro',
        'Team management dashboard',
        'Custom matching criteria',
        'Bulk user invitations',
        'Advanced analytics & reporting',
        'API access',
        'Custom branding',
        'Dedicated account manager',
      ],
      ctaText: 'Contact Sales',
    },
  ];

  const faqs = [
    {
      question: 'Is the free plan really free forever?',
      answer:
        'Yes! Our free plan includes core team matching and idea validation features with no time limit. Perfect for occasional hackathon participants.',
    },
    {
      question: 'Can I cancel my subscription anytime?',
      answer:
        'Absolutely. You can cancel your subscription at any time from your account settings. No questions asked, no cancellation fees.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. All payments are processed securely through Stripe.',
    },
    {
      question: 'Do you offer student discounts?',
      answer:
        'Yes! Students get 50% off Pro plans with a valid .edu email address. Contact support to verify your student status.',
    },
  ];

  const features = [
    {
      icon: Users,
      title: 'Smart Matching',
      description: 'AI-powered algorithm finds your perfect teammates',
    },
    {
      icon: Zap,
      title: 'Fast Setup',
      description: 'Get matched and start collaborating in minutes',
    },
    {
      icon: Star,
      title: 'Proven Results',
      description: '85% of our teams reach hackathon finals',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-4">
              Simple, Transparent Pricing
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Choose Your Plan</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Start free and upgrade as you grow. All plans include our core team matching and idea
              validation features.
            </p>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <div key={index} className="flex flex-col items-center">
                    <div className="p-3 bg-primary/10 rounded-full mb-4">
                      <Icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.id}
                  className={`relative ${
                    tier.highlighted ? 'border-primary shadow-lg scale-105' : ''
                  }`}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Crown className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8">
                    <CardTitle className="text-2xl mb-2">{tier.name}</CardTitle>
                    <div className="mb-4">
                      <span className="text-4xl font-bold">${tier.price}</span>
                      {tier.period !== 'free' && (
                        <span className="text-muted-foreground">/{tier.period}</span>
                      )}
                    </div>
                    <CardDescription className="text-base">{tier.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      asChild
                      className="w-full"
                      variant={tier.highlighted ? 'default' : 'outline'}
                      size="lg"
                    >
                      <Link to={tier.id === 'free' ? '/sign-up' : '/contact'}>
                        {tier.ctaText}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Compare Plans</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See what's included in each plan
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-6 font-semibold">Feature</th>
                          <th className="text-center p-6 font-semibold">Free</th>
                          <th className="text-center p-6 font-semibold text-primary">Pro</th>
                          <th className="text-center p-6 font-semibold">Team</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-6">Team Matching</td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Idea Validation</td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Priority Matching</td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Judge Feedback</td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">API Access</td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                        <tr>
                          <td className="p-6">Custom Branding</td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <X className="w-5 h-5 text-muted-foreground mx-auto" />
                          </td>
                          <td className="p-6 text-center">
                            <Check className="w-5 h-5 text-primary mx-auto" />
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Common questions about our pricing and plans
              </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-6">
              {faqs.map((faq, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Find Your Perfect Team?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Start with our free plan and upgrade when you're ready for more advanced features
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/sign-up">
                  Start Free Today
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/contact">Contact Sales</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
