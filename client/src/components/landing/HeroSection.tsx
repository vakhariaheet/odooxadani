import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          Find Perfect Venues, Create Amazing Events
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
          Discover venues, manage bookings, and create unforgettable experiences all in one platform
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link to="/dashboard">Find Events</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-black border-white bg-white hover:bg-transparent hover:text-white"
            asChild
          >
            <Link to="/sign-up">List Your Venue</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
