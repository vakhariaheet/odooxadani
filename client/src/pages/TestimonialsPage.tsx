import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { TestimonialCard } from '@/components/landing/TestimonialCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star, Trophy, Users, Target, ArrowRight, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { TestimonialData } from '@/types/landing';

export const TestimonialsPage = () => {
  const featuredTestimonials: TestimonialData[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Full Stack Developer',
      company: 'TechCorp',
      content:
        'Found my perfect hackathon team in minutes! We won first place at TechCrunch Disrupt thanks to the amazing matching algorithm. The platform helped us identify complementary skills and work styles before we even met.',
      rating: 5,
      avatar: '/avatars/sarah.jpg',
    },
    {
      id: '2',
      name: 'Marcus Rodriguez',
      role: 'Product Designer',
      company: 'StartupXYZ',
      content:
        'The idea validation feature helped us pivot early and focus on what judges actually wanted to see. We got feedback from 50+ developers before the hackathon and refined our concept. Game changer!',
      rating: 5,
      avatar: '/avatars/marcus.jpg',
    },
    {
      id: '3',
      name: 'Priya Patel',
      role: 'Data Scientist',
      company: 'AI Labs',
      content:
        'As someone new to hackathons, this platform gave me the confidence to participate and connect with experienced developers. My first hackathon team made it to the finals, and I learned so much!',
      rating: 5,
      avatar: '/avatars/priya.jpg',
    },
  ];

  const allTestimonials: TestimonialData[] = [
    ...featuredTestimonials,
    {
      id: '4',
      name: 'Alex Kim',
      role: 'Backend Engineer',
      company: 'CloudTech',
      content:
        'The skill matching is incredibly accurate. I was paired with a frontend developer and designer whose experience levels perfectly complemented mine. We built something amazing together.',
      rating: 5,
    },
    {
      id: '5',
      name: 'Jessica Wong',
      role: 'Mobile Developer',
      company: 'AppStudio',
      content:
        'Love how the platform considers timezone and communication preferences. Our remote team coordination was seamless, even though we were spread across three continents.',
      rating: 5,
    },
    {
      id: '6',
      name: 'David Thompson',
      role: 'DevOps Engineer',
      company: 'InfraCorp',
      content:
        'The reputation system helped me find reliable teammates. Everyone on my team had great collaboration ratings, and it showed in our project execution. We won the technical excellence award!',
      rating: 5,
    },
    {
      id: '7',
      name: 'Maria Garcia',
      role: 'UX Designer',
      company: 'DesignHub',
      content:
        'Finally, a platform that values design skills in hackathons! I was matched with developers who appreciated good UX, and we created something both functional and beautiful.',
      rating: 5,
    },
    {
      id: '8',
      name: 'James Liu',
      role: 'AI Researcher',
      company: 'MLTech',
      content:
        'The idea validation community is fantastic. Got detailed technical feedback on my ML concept from experts in the field. The insights helped us avoid major pitfalls during implementation.',
      rating: 5,
    },
    {
      id: '9',
      name: 'Emma Johnson',
      role: 'Frontend Developer',
      company: 'WebCraft',
      content:
        'As a junior developer, I was worried about finding a team that would welcome me. The platform matched me with patient mentors who helped me contribute meaningfully to our winning project.',
      rating: 5,
    },
    {
      id: '10',
      name: "Ryan O'Connor",
      role: 'Blockchain Developer',
      company: 'CryptoSolutions',
      content:
        "The platform's understanding of niche technologies is impressive. Found teammates with complementary blockchain and smart contract skills. Our DeFi project won the innovation prize.",
      rating: 5,
    },
    {
      id: '11',
      name: 'Lisa Zhang',
      role: 'Product Manager',
      company: 'ProductCo',
      content:
        'Great for non-technical roles too! I was matched with developers who valued product thinking and user research. Our market-focused approach led to a successful pitch.',
      rating: 5,
    },
    {
      id: '12',
      name: 'Michael Brown',
      role: 'Game Developer',
      company: 'GameStudio',
      content:
        'Found an amazing team for a game jam through this platform. The matching algorithm understood the unique dynamics of game development teams. We shipped a polished prototype in 48 hours.',
      rating: 5,
    },
  ];

  const successStats = [
    {
      icon: Trophy,
      number: '850+',
      label: 'Hackathon Wins',
      description: 'Teams formed on our platform',
    },
    {
      icon: Users,
      number: '2,500+',
      label: 'Successful Teams',
      description: 'Created through our matching',
    },
    {
      icon: Target,
      number: '95%',
      label: 'Satisfaction Rate',
      description: 'From our community members',
    },
    {
      icon: Star,
      number: '4.9/5',
      label: 'Average Rating',
      description: 'Across all testimonials',
    },
  ];

  const categories = [
    {
      title: 'First-Time Winners',
      description: 'Developers who won their first hackathon using our platform',
      count: 12,
    },
    {
      title: 'Team Leaders',
      description: 'Experienced developers who formed and led successful teams',
      count: 8,
    },
    {
      title: 'Career Changers',
      description: 'People who discovered new opportunities through hackathon networking',
      count: 15,
    },
    {
      title: 'Remote Teams',
      description: 'Distributed teams that collaborated successfully across timezones',
      count: 6,
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
              Success Stories
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Real Stories from Real Winners</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Discover how thousands of developers have transformed their hackathon experience,
              found amazing teammates, and built winning projects using our platform.
            </p>
          </div>
        </section>

        {/* Success Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {successStats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="text-2xl md:text-3xl font-bold text-primary mb-1">
                      {stat.number}
                    </div>
                    <div className="font-semibold mb-1">{stat.label}</div>
                    <div className="text-sm text-muted-foreground">{stat.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Featured Testimonials */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Success Stories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Hear from hackathon winners who found their perfect teams and achieved their goals
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {featuredTestimonials.map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>

            {/* Detailed Featured Story */}
            <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <Quote className="w-12 h-12 text-primary flex-shrink-0 mt-2" />
                  <div className="flex-1">
                    <blockquote className="text-lg leading-relaxed mb-6">
                      "I was skeptical about online team formation, but this platform completely
                      changed my perspective. The algorithm matched me with teammates whose skills
                      perfectly complemented mine. We went from strangers to a cohesive team in
                      hours, not days. Our project won first place at AngelHack Global, and we're
                      now working together on a startup. This platform doesn't just form teams—it
                      creates lasting professional relationships."
                    </blockquote>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src="/avatars/featured.jpg" alt="Sarah Chen" />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          SC
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold">Sarah Chen</div>
                        <div className="text-sm text-muted-foreground">
                          Full Stack Developer at TechCorp • Winner of TechCrunch Disrupt 2024
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Categories */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Success Across All Backgrounds
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Our platform helps developers at every stage of their journey
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <div className="text-2xl font-bold text-primary mb-2">{category.count}</div>
                    <h3 className="font-semibold mb-2">{category.title}</h3>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* All Testimonials */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">More Success Stories</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Read testimonials from our growing community of successful hackathon participants
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allTestimonials.slice(3).map((testimonial) => (
                <TestimonialCard key={testimonial.id} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </section>

        {/* Video Testimonials Teaser */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Watch Success Stories</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Coming soon: Video testimonials from our community members sharing their hackathon
              journey and how our platform made the difference.
            </p>
            <div className="bg-background rounded-2xl p-12 max-w-2xl mx-auto border-2 border-dashed border-border">
              <div className="text-6xl mb-4">🎥</div>
              <div className="text-lg font-semibold mb-2">Video Testimonials</div>
              <div className="text-muted-foreground">
                In-depth interviews with winning teams coming soon
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Write Your Success Story?
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Join thousands of developers who have transformed their hackathon experience and
              achieved their goals with the perfect teammates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
                <Link to="/sign-up">
                  Start Your Journey
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
              >
                <Link to="/how-it-works">See How It Works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
