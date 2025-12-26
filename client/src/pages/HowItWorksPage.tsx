import { User, Lightbulb, Users, Trophy, ArrowRight, CheckCircle } from 'lucide-react';
import { ProcessStep } from '@/components/landing/ProcessStep';
import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export const HowItWorksPage = () => {
  const steps = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Showcase your skills, experience, and what kind of projects excite you',
      icon: User,
    },
    {
      step: 2,
      title: 'Pitch Your Ideas',
      description: 'Share your hackathon ideas and get community feedback before the event',
      icon: Lightbulb,
    },
    {
      step: 3,
      title: 'Find Your Team',
      description: 'Match with complementary skills or join existing teams with great ideas',
      icon: Users,
    },
    {
      step: 4,
      title: 'Win Together',
      description: 'Enter hackathons with validated ideas and perfect teammates',
      icon: Trophy,
    },
  ];

  const benefits = [
    'Save 6+ hours typically spent on team formation',
    'Increase your winning chances by 3x with validated ideas',
    'Connect with developers across all skill levels',
    'Get judge insights before the competition starts',
    'Build lasting professional relationships',
    'Access exclusive hackathon opportunities',
  ];

  const detailedSteps = [
    {
      title: 'Step 1: Build Your Developer Profile',
      description:
        'Create a comprehensive profile that showcases who you are as a developer and what you bring to a team.',
      details: [
        'Add your technical skills and proficiency levels',
        'Showcase past projects and achievements',
        'Set your availability and preferred hackathon types',
        'Define your role preferences (frontend, backend, design, etc.)',
        'Add your communication preferences and timezone',
      ],
    },
    {
      title: 'Step 2: Share and Validate Ideas',
      description:
        'Submit your hackathon ideas to get community feedback and validation before the event.',
      details: [
        'Describe your idea with clear problem and solution',
        'Get community votes and detailed feedback',
        'Receive technical feasibility assessments',
        'See market potential scoring from other developers',
        'Iterate and improve based on community input',
      ],
    },
    {
      title: 'Step 3: Smart Team Matching',
      description:
        'Our algorithm finds the perfect teammates based on skills, experience, and project compatibility.',
      details: [
        'AI-powered skill complementarity analysis',
        'Experience level balancing for optimal learning',
        'Personality and communication style matching',
        'Timezone and location preference alignment',
        'Project interest and domain expertise matching',
      ],
    },
    {
      title: 'Step 4: Hackathon Success',
      description:
        'Enter hackathons with confidence, knowing you have a great team and validated idea.',
      details: [
        'Pre-event team coordination and planning',
        'Access to judge evaluation criteria',
        'Real-time collaboration tools during events',
        'Post-event project showcase and networking',
        'Performance tracking and improvement insights',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-background via-background to-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Transform your hackathon experience in four simple steps. From solo developer to
              winning team member in minutes.
            </p>
            <Button asChild size="lg">
              <Link to="/sign-up">
                Get Started Now
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* Process Overview */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Four Steps to Success</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our streamlined process gets you from idea to winning team faster than ever
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-8 md:gap-4">
              {steps.map((step, index) => (
                <ProcessStep
                  key={step.step}
                  step={step.step}
                  title={step.title}
                  description={step.description}
                  icon={step.icon}
                  isLast={index === steps.length - 1}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Detailed Steps */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Deep Dive Into Each Step</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here's exactly what happens at each stage of your journey
              </p>
            </div>

            <div className="space-y-8">
              {detailedSteps.map((step, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      {step.title}
                    </CardTitle>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="grid md:grid-cols-2 gap-3">
                      {step.details.map((detail, detailIndex) => (
                        <li key={detailIndex} className="flex items-start gap-2">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Why Developers Love Our Process
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Our streamlined approach eliminates the common pain points of hackathon
                  participation and maximizes your chances of success.
                </p>
                <ul className="space-y-4">
                  {benefits.map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle className="w-6 h-6 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-8">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">85%</div>
                  <div className="text-sm text-muted-foreground mb-6">
                    of teams formed on our platform reach the finals
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">6.2hrs</div>
                  <div className="text-sm text-muted-foreground mb-6">
                    average time saved on team formation
                  </div>
                  <div className="text-4xl font-bold text-primary mb-2">3x</div>
                  <div className="text-sm text-muted-foreground">
                    higher winning rate vs. random teams
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Your Hackathon Experience?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of developers who have found their perfect teammates and won hackathons
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/sign-up">
                  Start Building Your Profile
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/features">Explore Features</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
