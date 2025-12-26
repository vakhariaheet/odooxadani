import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { ContactForm } from '@/components/landing/ContactForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Clock,
  Users,
  Headphones,
  FileText,
} from 'lucide-react';

export const ContactPage = () => {
  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help with technical issues or general questions',
      contact: 'support@hackteam.com',
      responseTime: 'Within 24 hours',
    },
    {
      icon: MessageSquare,
      title: 'Live Chat',
      description: 'Chat with our team in real-time during business hours',
      contact: 'Available in app',
      responseTime: 'Immediate',
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Speak directly with our support team for urgent matters',
      contact: '+1 (555) 123-4567',
      responseTime: 'Mon-Fri 9AM-6PM PST',
    },
  ];

  const officeLocations = [
    {
      city: 'San Francisco',
      address: '123 Tech Street, Suite 400\nSan Francisco, CA 94105',
      type: 'Headquarters',
    },
    {
      city: 'New York',
      address: '456 Innovation Ave, Floor 12\nNew York, NY 10001',
      type: 'East Coast Office',
    },
    {
      city: 'London',
      address: '789 Developer Lane\nLondon, UK EC1A 1BB',
      type: 'European Office',
    },
  ];

  const supportCategories = [
    {
      icon: Users,
      title: 'Team Matching Issues',
      description: 'Problems with finding teammates or matching algorithm',
    },
    {
      icon: Headphones,
      title: 'Technical Support',
      description: 'Bug reports, login issues, or platform problems',
    },
    {
      icon: FileText,
      title: 'Account & Billing',
      description: 'Account management, subscription, or payment questions',
    },
    {
      icon: MessageSquare,
      title: 'Feature Requests',
      description: 'Suggestions for new features or improvements',
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
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">We're Here to Help</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Have questions about our platform? Need technical support? Want to share feedback? Our
              team is ready to assist you with anything you need.
            </p>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Multiple Ways to Reach Us</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Choose the contact method that works best for you
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-lg transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-xl">{method.title}</CardTitle>
                      <CardDescription className="text-base">{method.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="font-semibold text-primary">{method.contact}</div>
                        <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                          <Clock className="w-4 h-4" />
                          {method.responseTime}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Send Us a Message</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Fill out the form below and we'll get back to you as soon as possible
              </p>
            </div>

            <ContactForm />
          </div>
        </section>

        {/* Support Categories */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Common Support Topics</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Here are the most common areas where our team can help you
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {supportCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <Card
                    key={index}
                    className="text-center hover:shadow-md transition-all duration-300"
                  >
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Offices</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Visit us at one of our global locations
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {officeLocations.map((office, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <CardTitle className="text-xl">{office.city}</CardTitle>
                    </div>
                    <Badge variant="secondary" className="w-fit">
                      {office.type}
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <address className="text-muted-foreground not-italic leading-relaxed">
                      {office.address.split('\n').map((line, lineIndex) => (
                        <div key={lineIndex}>{line}</div>
                      ))}
                    </address>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Teaser */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Looking for Quick Answers?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Check out our frequently asked questions for instant answers to common queries
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Card className="p-6 max-w-sm">
                <div className="text-2xl font-bold text-primary mb-2">50+</div>
                <div className="text-sm text-muted-foreground">
                  Common questions answered in our FAQ
                </div>
              </Card>
              <Card className="p-6 max-w-sm">
                <div className="text-2xl font-bold text-primary mb-2">24/7</div>
                <div className="text-sm text-muted-foreground">
                  Self-service help available anytime
                </div>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
