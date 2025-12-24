import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function NewsletterConfirmPage() {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const [preferences, setPreferences] = useState({
    eventUpdates: true,
    venueSpotlight: true,
    weeklyDigest: true,
    exclusiveOffers: true,
    productUpdates: false,
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Track confirmation page visit
    const confirmations = JSON.parse(localStorage.getItem('eventHub_confirmations') || '[]');
    confirmations.push({
      email,
      timestamp: new Date().toISOString(),
      source: 'newsletter_confirm',
    });
    localStorage.setItem('eventHub_confirmations', JSON.stringify(confirmations));
  }, [email]);

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleUpdatePreferences = async () => {
    setIsUpdating(true);

    try {
      // Store preferences locally
      const newsletters = JSON.parse(localStorage.getItem('eventHub_newsletters') || '[]');
      const updatedNewsletters = newsletters.map((newsletter: any) =>
        newsletter.email === email
          ? { ...newsletter, preferences, updatedAt: new Date().toISOString() }
          : newsletter
      );
      localStorage.setItem('eventHub_newsletters', JSON.stringify(updatedNewsletters));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast.success('Preferences updated successfully!');
    } catch (error) {
      toast.error('Failed to update preferences. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

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

      {/* Confirmation Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Success Message */}
            <Card className="text-center mb-8">
              <CardHeader>
                <div className="text-6xl mb-4">🎉</div>
                <CardTitle className="text-3xl mb-2">Newsletter Confirmed!</CardTitle>
                <CardDescription className="text-lg">
                  {email ? `Welcome ${email}! ` : 'Welcome! '}
                  You're now subscribed to EventHub updates and will receive the latest news about
                  events, venues, and exclusive offers.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">⚙️</span>
                  Customize Your Preferences
                </CardTitle>
                <CardDescription>
                  Choose what type of content you'd like to receive from EventHub
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(preferences).map(([key, value]) => {
                    const labels = {
                      eventUpdates: {
                        title: 'Event Updates',
                        description: 'New events in your area and trending events',
                      },
                      venueSpotlight: {
                        title: 'Venue Spotlight',
                        description: 'Featured venues and new venue listings',
                      },
                      weeklyDigest: {
                        title: 'Weekly Digest',
                        description: 'Weekly roundup of platform highlights',
                      },
                      exclusiveOffers: {
                        title: 'Exclusive Offers',
                        description: 'Special discounts and early access to features',
                      },
                      productUpdates: {
                        title: 'Product Updates',
                        description: 'New features and platform improvements',
                      },
                    };

                    return (
                      <div key={key} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <input
                          type="checkbox"
                          id={key}
                          checked={value}
                          onChange={() => handlePreferenceChange(key as keyof typeof preferences)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={key} className="font-medium cursor-pointer">
                            {labels[key as keyof typeof labels].title}
                          </Label>
                          <p className="text-sm text-gray-600 mt-1">
                            {labels[key as keyof typeof labels].description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Button
                  onClick={handleUpdatePreferences}
                  disabled={isUpdating}
                  className="w-full mt-6"
                >
                  {isUpdating ? 'Updating...' : 'Save Preferences'}
                </Button>

                <Alert className="mt-4">
                  <AlertDescription className="text-sm">
                    You can update these preferences anytime by clicking the "Manage Preferences"
                    link in any of our emails, or by contacting our support team.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* What's Next */}
            <Card className="mt-8">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <span className="mr-2">🚀</span>
                  What's Next?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Explore EventHub</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <Link to="/demo" className="text-blue-600 hover:underline">
                          Try our interactive demo
                        </Link>
                      </li>
                      <li>
                        <Link to="/features" className="text-blue-600 hover:underline">
                          Discover platform features
                        </Link>
                      </li>
                      <li>
                        <Link to="/pricing" className="text-blue-600 hover:underline">
                          View pricing plans
                        </Link>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Get Started</h4>
                    <ul className="space-y-1 text-sm">
                      <li>
                        <Link to="/sign-up" className="text-blue-600 hover:underline">
                          Create your free account
                        </Link>
                      </li>
                      <li>
                        <Link to="/dashboard" className="text-blue-600 hover:underline">
                          Browse events near you
                        </Link>
                      </li>
                      <li>
                        <Link to="/contact" className="text-blue-600 hover:underline">
                          Contact our team
                        </Link>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                  <Button size="lg" asChild>
                    <Link to="/sign-up">Start Free Trial</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link to="/demo">Try Demo</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Unsubscribe */}
            <div className="text-center mt-8">
              <p className="text-sm text-gray-500">
                Changed your mind?{' '}
                <button
                  className="text-blue-600 hover:underline"
                  onClick={() => {
                    if (confirm('Are you sure you want to unsubscribe from all EventHub emails?')) {
                      // Handle unsubscribe
                      const newsletters = JSON.parse(
                        localStorage.getItem('eventHub_newsletters') || '[]'
                      );
                      const filtered = newsletters.filter((n: any) => n.email !== email);
                      localStorage.setItem('eventHub_newsletters', JSON.stringify(filtered));
                      toast.success('Successfully unsubscribed');
                    }
                  }}
                >
                  Unsubscribe here
                </button>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
