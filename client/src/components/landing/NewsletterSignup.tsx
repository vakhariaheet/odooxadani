import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export const NewsletterSignup = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);

    try {
      // Store newsletter signup locally
      const newsletters = JSON.parse(localStorage.getItem('eventHub_newsletters') || '[]');
      const newSignup = {
        email,
        timestamp: new Date().toISOString(),
        source: 'landing_page',
        id: Date.now(),
      };

      newsletters.push(newSignup);
      localStorage.setItem('eventHub_newsletters', JSON.stringify(newsletters));

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubscribed(true);
      setEmail('');
      toast.success('Successfully subscribed to our newsletter!');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubscribed) {
    return (
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <Card className="border-blue-200">
              <CardContent className="p-8 text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-2xl font-bold mb-2 text-blue-900">Welcome to EventHub!</h3>
                <p className="text-blue-700 mb-6">
                  Thank you for subscribing! You'll receive the latest updates about events, venues,
                  and exclusive offers.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setIsSubscribed(false)}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100"
                >
                  Subscribe Another Email
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-blue-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <CardTitle className="text-2xl">Stay in the Loop</CardTitle>
              <CardDescription className="text-lg">
                Get the latest updates on new events, venue listings, and exclusive offers delivered
                to your inbox
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="newsletter-email" className="sr-only">
                    Email address
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      id="newsletter-email"
                      type="email"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1"
                      required
                    />
                    <Button type="submit" disabled={isSubmitting} className="px-8">
                      {isSubmitting ? 'Subscribing...' : 'Subscribe'}
                    </Button>
                  </div>
                </div>

                <Alert>
                  <AlertDescription className="text-sm text-gray-600">
                    By subscribing, you agree to receive marketing emails from EventHub. You can
                    unsubscribe at any time. We respect your privacy and will never share your
                    email.
                  </AlertDescription>
                </Alert>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Join over 10,000 event enthusiasts who trust EventHub
                </p>
                <div className="flex justify-center items-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center">
                    <span className="mr-2">✨</span>
                    <span>Weekly event highlights</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🎯</span>
                    <span>Exclusive venue deals</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2">🚀</span>
                    <span>Early access to features</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
