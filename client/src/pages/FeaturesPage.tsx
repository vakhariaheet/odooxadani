import {
  Users,
  Lightbulb,
  Target,
  Clock,
  Shield,
  Zap,
  BarChart3,
  MessageSquare,
  Star,
  ArrowRight,
  CheckCircle,
} from 'lucide-react';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export const FeaturesPage = () => {
  const coreFeatures = [
    {
      title: 'AI-Powered Team Matching',
      description:
        'Advanced algorithms analyze skills, experience, and personality to create perfectly balanced teams.',
      icon: Users,
      benefits: [
        'Skill complementarity analysis',
        'Experience level balancing',
        'Communication style matching',
        'Timezone optimization',
        'Project interest alignment',
      ],
    },
    {
      title: 'Community Idea Validation',
      description:
        'Get real feedback from experienced developers and judges before committing to an idea.',
      icon: Lightbulb,
      benefits: [
        'Community voting system',
        'Expert judge feedback',
        'Market viability scoring',
        'Technical feasibility analysis',
        'Improvement suggestions',
      ],
      highlighted: true,
    },
    {
      title: 'Success Analytics',
      description:
        'Track your performance, build reputation, and continuously improve your hackathon skills.',
      icon: BarChart3,
      benefits: [
        'Performance dashboards',
        'Skill progression tracking',
        'Achievement badges',
        'Team collaboration metrics',
        'Winning pattern analysis',
      ],
    },
  ];

  const additionalFeatures = [
    {
      icon: Clock,
      title: 'Real-time Collaboration',
      description: 'Built-in tools for seamless team coordination during hackathons',
    },
    {
      icon: Shield,
      title: 'Verified Profiles',
      description: 'Skill verification system ensures authentic team member capabilities',
    },
    {
      icon: Zap,
      title: 'Quick Matching',
      description: 'Find your perfect team in under 5 minutes with our smart algorithms',
    },
    {
      icon: MessageSquare,
      title: 'Team Chat',
      description: 'Integrated messaging for pre-event planning and coordination',
    },
    {
      icon: Target,
      title: 'Goal Setting',
      description: 'Set and track team objectives throughout the hackathon journey',
    },
    {
      icon: Star,
      title: 'Reputation System',
      description: 'Build credibility through successful collaborations and achievements',
    },
  ];

  const userTypes = [
    {
      title: 'For Beginners',
      description:
        "New to hackathons? We'll help you find experienced mentors and welcoming teams.",
      features: [
        'Beginner-friendly team matching',
        'Mentorship program access',
        'Learning resource library',
        'Skill development tracking',
        'Confidence building workshops',
      ],
      color: 'bg-blue-50 border-blue-200',
    },
    {
      title: 'For Experienced Developers',
      description:
        'Seasoned hackathon participant? Connect with other experts and lead winning teams.',
      features: [
        'Expert-level team formation',
        'Leadership opportunity matching',
        'Advanced project idea validation',
        'Judge network access',
        'Startup connection opportunities',
      ],
      color: 'bg-purple-50 border-purple-200',
    },
    {
      title: 'For Team Leaders',
      description:
        'Looking to build and lead a team? Find the right mix of skills and personalities.',
      features: [
        'Team composition optimization',
        'Leadership skill assessment',
        'Project management tools',
        'Team performance analytics',
        'Conflict resolution support',
      ],
      color: 'bg-green-50 border-green-200',
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
              Complete Feature Suite
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Everything You Need to Win Hackathons
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              From intelligent team matching to idea validation and success tracking, our
              comprehensive platform covers every aspect of hackathon success.
            </p>
            <Button asChild size="lg">
              <Link to="/sign-up">
                Explore All Features
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Core Features */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Core Features</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The essential tools that make hackathon team formation effortless and effective
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {coreFeatures.map((feature, index) => (
                <FeatureCard
                  key={index}
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  benefits={feature.benefits}
                  highlighted={feature.highlighted}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Additional Features Grid */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Additional Capabilities</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Extra features that enhance your hackathon experience
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {additionalFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-all duration-300"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features by User Type */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Tailored for Every Developer</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Whether you're just starting out or a seasoned hackathon veteran, we have features
                designed for your experience level
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {userTypes.map((userType, index) => (
                <Card key={index} className={`${userType.color} border-2`}>
                  <CardHeader>
                    <CardTitle className="text-xl">{userType.title}</CardTitle>
                    <CardDescription className="text-base">{userType.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {userType.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Our Platform?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                See how we compare to traditional hackathon team formation methods
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-6 font-semibold">Feature</th>
                          <th className="text-center p-6 font-semibold text-muted-foreground">
                            Traditional Method
                          </th>
                          <th className="text-center p-6 font-semibold text-primary">
                            Our Platform
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="p-6">Team Formation Time</td>
                          <td className="p-6 text-center text-muted-foreground">6-8 hours</td>
                          <td className="p-6 text-center text-primary font-semibold">5 minutes</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Skill Matching</td>
                          <td className="p-6 text-center text-muted-foreground">Random/Manual</td>
                          <td className="p-6 text-center text-primary font-semibold">AI-Powered</td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Idea Validation</td>
                          <td className="p-6 text-center text-muted-foreground">None</td>
                          <td className="p-6 text-center text-primary font-semibold">
                            Community + Judges
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="p-6">Success Rate</td>
                          <td className="p-6 text-center text-muted-foreground">~25%</td>
                          <td className="p-6 text-center text-primary font-semibold">85%</td>
                        </tr>
                        <tr>
                          <td className="p-6">Post-Event Networking</td>
                          <td className="p-6 text-center text-muted-foreground">Limited</td>
                          <td className="p-6 text-center text-primary font-semibold">
                            Built-in Community
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

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Experience All Features?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join our platform and get access to all features that will transform your hackathon
              journey
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
