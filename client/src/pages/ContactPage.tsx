import { ContactSection } from '@/components/landing/ContactSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const supportOptions = [
  {
    title: 'General Support',
    description: 'Get help with your account, billing, or general questions',
    icon: '🎧',
    contact: 'support@eventhub.com',
    hours: '24/7 via email, Mon-Fri 9AM-6PM PST via chat',
  },
  {
    title: 'Sales Inquiries',
    description: 'Learn more about our plans and enterprise solutions',
    icon: '💼',
    contact: 'sales@eventhub.com',
    hours: 'Mon-Fri 9AM-6PM PST',
  },
  {
    title: 'Technical Support',
    description: 'API documentation, integrations, and technical assistance',
    icon: '⚙️',
    contact: 'developers@eventhub.com',
    hours: 'Mon-Fri 9AM-6PM PST',
  },
  {
    title: 'Partnership Opportunities',
    description: 'Explore partnership and integration opportunities',
    icon: '🤝',
    contact: 'partnerships@eventhub.com',
    hours: 'Mon-Fri 9AM-6PM PST',
  },
];

export function ContactPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">Contact Us</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're here to help! Reach out to us through any of the channels below or send us a
            message using the contact form.
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {supportOptions.map((option, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="text-4xl mb-4">{option.icon}</div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4">{option.description}</CardDescription>
                <div className="space-y-2">
                  <p className="font-semibold text-blue-600">{option.contact}</p>
                  <p className="text-sm text-gray-500">{option.hours}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Contact Form Section */}
        <ContactSection />

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <Card className="max-w-4xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Need Immediate Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <h4 className="font-semibold mb-2">📚 Help Center</h4>
                  <p className="text-gray-600 text-sm">
                    Browse our comprehensive documentation and tutorials
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">💬 Live Chat</h4>
                  <p className="text-gray-600 text-sm">
                    Chat with our support team during business hours
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">📱 Mobile App</h4>
                  <p className="text-gray-600 text-sm">
                    Access support directly from our mobile application
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
