import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export const HeroSection = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-5xl font-bold mb-6 max-w-4xl mx-auto">
          Turn Proposals Into Payments Faster
        </h1>
        <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
          The all-in-one platform that takes freelancers from proposal creation 
          to payment receipt in minutes, not weeks.
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
          >
            Watch Demo
          </Button>
        </div>
        <div className="mt-12 max-w-4xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-8 border border-white/20">
            <div className="text-center text-white/80 mb-4">
              Trusted by 10,000+ freelancers worldwide
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-2xl font-bold">40%</div>
                <div className="text-sm opacity-80">Faster payments</div>
              </div>
              <div>
                <div className="text-2xl font-bold">3 hours</div>
                <div className="text-sm opacity-80">Time saved per proposal</div>
              </div>
              <div>
                <div className="text-2xl font-bold">95%</div>
                <div className="text-sm opacity-80">Client satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};