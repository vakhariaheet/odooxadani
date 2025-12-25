import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6">Stop Wasting Hackathon Time on Team Formation</h1>
        <p className="text-xl mb-8 max-w-3xl mx-auto">
          HackMatch connects solo hackers with the perfect teammates and validates ideas before the
          event starts. Spend your 24 hours building, not networking.
        </p>
        <div className="flex gap-4 justify-center mb-8">
          <Button asChild size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            <Link to="/sign-up">Find Your Team</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-white text-blue-600 hover:bg-white hover:text-blue-600"
          >
            <Link to="/sign-up">Pitch Your Idea</Link>
          </Button>
        </div>

        {/* Quick navigation */}
        <div className="flex gap-6 justify-center text-sm">
          <button
            onClick={() => scrollToSection('features')}
            className="text-white/80 hover:text-white transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection('how-it-works')}
            className="text-white/80 hover:text-white transition-colors"
          >
            How it Works
          </button>
          <button
            onClick={() => scrollToSection('pricing')}
            className="text-white/80 hover:text-white transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection('contact')}
            className="text-white/80 hover:text-white transition-colors"
          >
            Contact
          </button>
        </div>
      </div>
    </section>
  );
};
