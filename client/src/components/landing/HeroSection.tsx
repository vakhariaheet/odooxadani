import { Button } from '@/components/ui/button';
import { ArrowRight, Users, Lightbulb, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

export const HeroSection = () => {
  const { isSignedIn } = useAuth();

  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-background via-background to-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            Find Your Perfect
            <br />
            <span className="text-primary">Hackathon Team</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Stop wasting hackathon hours on team formation. Match with skilled developers, validate
            your ideas with the community, and enter events ready to build.
          </p>

          {/* Key Benefits */}
          <div className="flex flex-wrap justify-center gap-6 mb-10 text-sm md:text-base">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="w-5 h-5 text-primary" />
              <span>Skill-based matching</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lightbulb className="w-5 h-5 text-primary" />
              <span>Community validation</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Trophy className="w-5 h-5 text-primary" />
              <span>Judge pre-scoring</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isSignedIn ? (
              <Button asChild size="lg" className="text-lg px-8 py-6">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild size="lg" className="text-lg px-8 py-6">
                  <Link to="/sign-up">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="text-lg px-8 py-6">
                  <Link to="/how-it-works">See How It Works</Link>
                </Button>
              </>
            )}
          </div>

          {/* Social Proof */}
          <div className="mt-12 pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground mb-4">
              Trusted by participants from top hackathons
            </p>
            <div className="flex flex-wrap justify-center gap-8 opacity-60">
              {/* Mock hackathon logos - replace with real ones */}
              <div className="text-xs font-semibold px-3 py-1 bg-muted rounded">
                TechCrunch Disrupt
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-muted rounded">
                AngelHack Global
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-muted rounded">
                NASA Space Apps
              </div>
              <div className="text-xs font-semibold px-3 py-1 bg-muted rounded">
                Junction Helsinki
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </section>
  );
};
