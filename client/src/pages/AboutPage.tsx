import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Users, Lightbulb, Heart } from 'lucide-react';

const values = [
  {
    icon: Target,
    title: "Simplicity First",
    description: "We believe powerful tools should be simple to use. Every feature is designed with freelancer workflows in mind."
  },
  {
    icon: Users,
    title: "Community Driven",
    description: "Our roadmap is shaped by feedback from thousands of freelancers who use ProposalFlow every day."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We're constantly pushing the boundaries of what's possible in proposal and payment automation."
  },
  {
    icon: Heart,
    title: "Freelancer Success",
    description: "Your success is our success. We're committed to helping freelancers thrive in the modern economy."
  }
];

const team = [
  {
    name: "Alex Johnson",
    role: "CEO & Co-founder",
    bio: "Former freelance consultant who experienced the pain of manual proposal processes firsthand.",
    avatar: "AJ"
  },
  {
    name: "Sarah Chen",
    role: "CTO & Co-founder",
    bio: "Ex-Google engineer passionate about building tools that make work more efficient.",
    avatar: "SC"
  },
  {
    name: "Mike Rodriguez",
    role: "Head of Product",
    bio: "Design-focused product leader with 10+ years building user-centric software.",
    avatar: "MR"
  },
  {
    name: "Emma Thompson",
    role: "Head of Customer Success",
    bio: "Dedicated to ensuring every freelancer gets maximum value from ProposalFlow.",
    avatar: "ET"
  }
];

export function AboutPage() {
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
            About ProposalFlow
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            We're on a mission to empower freelancers with the tools they need 
            to focus on what they do best: their craft.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Our Story
              </h2>
            </div>
            
            <div className="prose prose-lg mx-auto text-gray-700">
              <p className="text-xl leading-relaxed mb-8">
                ProposalFlow was born from frustration. As freelancers ourselves, we spent countless 
                hours creating proposals, chasing signatures, and waiting for payments. We knew there 
                had to be a better way.
              </p>
              
              <p className="leading-relaxed mb-8">
                In 2023, we set out to build the platform we wished we had. Not just another proposal 
                tool, but a complete workflow solution that would take freelancers from initial client 
                contact to final payment receipt seamlessly.
              </p>
              
              <p className="leading-relaxed mb-8">
                Today, ProposalFlow serves over 10,000 freelancers worldwide, processing millions in 
                proposals and helping independent professionals get paid 40% faster on average. But 
                we're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              These principles guide everything we do, from product development to customer support.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="border-0 shadow-lg text-center">
                  <CardHeader>
                    <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                      <Icon className="h-8 w-8 text-blue-600" />
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {value.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-600">
                      {value.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're a diverse team of builders, designers, and freelancer advocates 
              working to make your workflow seamless.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {team.map((member, index) => (
              <Card key={index} className="border-0 shadow-lg text-center">
                <CardHeader>
                  <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                    {member.avatar}
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {member.name}
                  </CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">
                    {member.bio}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              ProposalFlow by the Numbers
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">10,000+</div>
              <div className="text-blue-100">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$2M+</div>
              <div className="text-blue-100">Proposals Processed</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">40%</div>
              <div className="text-blue-100">Faster Payments</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">99.9%</div>
              <div className="text-blue-100">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Our Community?
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Become part of the ProposalFlow family and transform your freelance workflow today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 font-semibold px-8 py-3"
              asChild
            >
              <Link to="/sign-up">Start Free Trial</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="font-semibold px-8 py-3"
              asChild
            >
              <Link to="/features">Explore Features</Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterSection />
    </div>
  );
}