import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link, useSearchParams } from 'react-router-dom';

export function SuccessPage() {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type') || 'contact';

  useEffect(() => {
    // Track success page visit
    const visits = JSON.parse(localStorage.getItem('eventHub_successVisits') || '[]');
    visits.push({
      type,
      timestamp: new Date().toISOString(),
      referrer: document.referrer,
    });
    localStorage.setItem('eventHub_successVisits', JSON.stringify(visits));
  }, [type]);

  const getContent = () => {
    switch (type) {
      case 'newsletter':
        return {
          icon: '📧',
          title: 'Welcome to EventHub!',
          description:
            "Thank you for subscribing to our newsletter. You'll receive the latest updates about events, venues, and exclusive offers.",
          nextSteps: [
            'Check your email for a confirmation message',
            'Add hello@eventhub.com to your contacts',
            'Follow us on social media for daily updates',
            'Explore our platform to discover amazing events',
          ],
        };
      case 'lead':
        return {
          icon: '🚀',
          title: "We'll Be In Touch Soon!",
          description:
            'Thank you for your interest in EventHub. Our team will contact you within 24 hours to discuss your event management needs.',
          nextSteps: [
            'Expect a call or email within 24 hours',
            'Prepare any questions about your event needs',
            'Check out our demo while you wait',
            'Follow us for the latest platform updates',
          ],
        };
      default:
        return {
          icon: '✅',
          title: 'Message Sent Successfully!',
          description:
            "Thank you for contacting EventHub. We've received your message and will respond as soon as possible.",
          nextSteps: [
            "We'll respond within 24 hours",
            'Check your email for our reply',
            'Explore our platform in the meantime',
            'Follow us on social media',
          ],
        };
    }
  };

  const content = getContent();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              EventHub
            </Link>
            <div className="flex space-x-4">
              <Button variant="outline" asChild>
                <Link to="/">Back to Home</Link>
              </Button>
              <Button asChild>
                <Link to="/sign-up">Get Started</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Success Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardHeader className="pb-4">
                <div className="text-6xl mb-4">{content.icon}</div>
                <CardTitle className="text-3xl mb-2">{content.title}</CardTitle>
                <CardDescription className="text-lg">{content.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">What happens next?</h3>
                    <ul className="space-y-2 text-left">
                      {content.nextSteps.map((step, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-green-500 mr-2 mt-1">✓</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
                    <Button size="lg" asChild>
                      <Link to="/demo">Try Our Demo</Link>
                    </Button>
                    <Button size="lg" variant="outline" asChild>
                      <Link to="/">Explore Events</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Resources */}
            <div className="mt-12 grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">📚</span>
                    Learn More
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>
                      <Link to="/features" className="text-blue-600 hover:underline">
                        Platform Features
                      </Link>
                    </li>
                    <li>
                      <Link to="/pricing" className="text-blue-600 hover:underline">
                        Pricing Plans
                      </Link>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline">
                        Help Center
                      </a>
                    </li>
                    <li>
                      <a href="#" className="text-blue-600 hover:underline">
                        API Documentation
                      </a>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <span className="mr-2">🌐</span>
                    Stay Connected
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <span className="mr-2">🐦</span>
                      Follow us on Twitter
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <span className="mr-2">💼</span>
                      Connect on LinkedIn
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <span className="mr-2">📘</span>
                      Like us on Facebook
                    </a>
                    <a href="#" className="flex items-center text-blue-600 hover:underline">
                      <span className="mr-2">📧</span>
                      Email Newsletter
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
