import { InteractiveDemo } from '@/components/landing/InteractiveDemo';
import { FeaturedEventsCarousel } from '@/components/landing/FeaturedEventsCarousel';
import { FeaturedVenuesGrid } from '@/components/landing/FeaturedVenuesGrid';
import { LiveStatsCounter } from '@/components/landing/LiveStatsCounter';
import { FooterSection } from '@/components/landing/FooterSection';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function DemoPage() {
  return (
    <main className="min-h-screen">
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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6 leading-tight">Experience EventHub Live</h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Take an interactive tour of our platform and see how easy it is to discover events, find
            venues, and manage bookings
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="#demo">Start Interactive Demo</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-black border-white bg-white hover:bg-transparent hover:text-white"
              asChild
            >
              <Link to="/sign-up">Start Free Trial</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <div id="demo">
        <InteractiveDemo />
      </div>

      {/* Real Platform Data */}
      <FeaturedEventsCarousel />
      <FeaturedVenuesGrid />

      {/* Platform Stats */}
      <LiveStatsCounter />

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of event professionals who trust EventHub for their event management
            needs
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild>
              <Link to="/sign-up">Start Free Trial</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-blue-600 border-white bg-white hover:bg-transparent hover:text-white"
              asChild
            >
              <Link to="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </section>

      <FooterSection />
    </main>
  );
}
