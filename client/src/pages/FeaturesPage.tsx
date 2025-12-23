import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { HowItWorksSection } from '@/components/landing/HowItWorksSection';
import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Zap, Globe, Smartphone } from 'lucide-react';

const additionalFeatures = [
  {
    icon: Shield,
    title: "Bank-Level Security",
    description: "Your data is protected with AES-256 encryption and SOC 2 Type II compliance."
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Optimized for speed with 99.9% uptime and global CDN delivery."
  },
  {
    icon: Globe,
    title: "Global Support",
    description: "Multi-currency support and localization for 15+ languages."
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    description: "Perfect experience on all devices with native mobile apps coming soon."
  }
];

export function FeaturesPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-5 w-5" />
              <span>Back to Home</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Button variant="outline" asChild>
                <Link to="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            Powerful Features for Modern Freelancers
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Everything you need to streamline your workflow, impress clients, 
            and get paid faster. No compromises.
          </p>
        </div>
      </section>

      <FeaturesSection />
      <HowItWorksSection />

      {/* Additional Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Built for Performance & Security
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Enterprise-grade infrastructure with the simplicity freelancers love.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {additionalFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Transform Your Workflow?
          </h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of freelancers who have already streamlined their 
            proposal-to-payment process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-3"
              asChild
            >
              <Link to="/sign-up">Start Free Trial</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-3"
              asChild
            >
              <Link to="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}