import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Play, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react';

const demoFeatures = [
  {
    icon: CheckCircle,
    title: "Proposal Creation",
    description: "See how to create professional proposals in under 5 minutes"
  },
  {
    icon: Users,
    title: "Client Collaboration",
    description: "Watch clients review and approve proposals in real-time"
  },
  {
    icon: Clock,
    title: "Digital Signatures",
    description: "Experience seamless e-signature collection process"
  },
  {
    icon: TrendingUp,
    title: "Payment Tracking",
    description: "Monitor payment status and automated follow-ups"
  }
];

export function DemoPage() {
  return (
    <div className="min-h-screen bg-gray-50">
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
            See ProposalFlow in Action
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Watch our interactive demo to see how ProposalFlow transforms your 
            freelance workflow from proposal to payment.
          </p>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-900 rounded-lg overflow-hidden shadow-2xl">
              <div className="aspect-video bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-700 transition-colors cursor-pointer">
                    <Play className="h-8 w-8 text-white ml-1" />
                  </div>
                  <h3 className="text-white text-xl font-semibold mb-2">
                    ProposalFlow Demo Video
                  </h3>
                  <p className="text-gray-300">
                    5 minutes • See the complete workflow
                  </p>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-8">
              <p className="text-gray-600 mb-4">
                This demo shows the complete ProposalFlow experience from creating 
                your first proposal to receiving payment.
              </p>
              <Button size="lg" asChild>
                <Link to="/sign-up">Start Your Free Trial</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Features */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              What You'll See in the Demo
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our demo covers all the key features that make ProposalFlow the 
              preferred choice for freelancers worldwide.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {demoFeatures.map((feature, index) => {
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

      {/* Interactive Demo Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Try Our Interactive Demo
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience ProposalFlow firsthand with our interactive demo. 
              No signup required!
            </p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 border border-blue-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Play className="h-6 w-6 text-white ml-1" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  Interactive Demo Coming Soon
                </h3>
                <p className="text-gray-600 mb-6">
                  We're building an interactive demo that will let you explore 
                  ProposalFlow's features without creating an account.
                </p>
                <Button size="lg" asChild>
                  <Link to="/sign-up">Start Free Trial Instead</Link>
                </Button>
              </div>
            </div>
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
            Join thousands of freelancers who have streamlined their 
            proposal-to-payment process with ProposalFlow.
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
    </div>
  );
}