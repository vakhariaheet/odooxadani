import { Navigation } from '@/components/landing/Navigation';
import { Footer } from '@/components/landing/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  Target,
  Lightbulb,
  Heart,
  ArrowRight,
  Github,
  Linkedin,
  Twitter,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  const stats = [
    { number: '10,000+', label: 'Developers Connected' },
    { number: '2,500+', label: 'Teams Formed' },
    { number: '850+', label: 'Hackathons Won' },
    { number: '95%', label: 'User Satisfaction' },
  ];

  const values = [
    {
      icon: Users,
      title: 'Community First',
      description:
        'We believe the best innovations come from diverse, collaborative teams working together towards common goals.',
    },
    {
      icon: Target,
      title: 'Excellence Driven',
      description:
        "We're committed to helping every developer reach their full potential and achieve hackathon success.",
    },
    {
      icon: Lightbulb,
      title: 'Innovation Focused',
      description:
        'We constantly evolve our platform with cutting-edge technology to serve our community better.',
    },
    {
      icon: Heart,
      title: 'Passion Powered',
      description:
        'Our team is made up of hackathon enthusiasts who understand the challenges and excitement firsthand.',
    },
  ];

  const team = [
    {
      name: 'Sarah Chen',
      role: 'Co-Founder & CEO',
      bio: 'Former Google engineer with 15+ hackathon wins. Passionate about building developer communities.',
      avatar: '/avatars/sarah.jpg',
      social: {
        github: 'https://github.com/sarahchen',
        linkedin: 'https://linkedin.com/in/sarahchen',
        twitter: 'https://twitter.com/sarahchen',
      },
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Co-Founder & CTO',
      bio: 'Full-stack architect who has mentored 200+ developers. Expert in AI and machine learning.',
      avatar: '/avatars/marcus.jpg',
      social: {
        github: 'https://github.com/marcusrod',
        linkedin: 'https://linkedin.com/in/marcusrod',
        twitter: 'https://twitter.com/marcusrod',
      },
    },
    {
      name: 'Priya Patel',
      role: 'Head of Product',
      bio: 'UX designer turned product manager. Focuses on creating intuitive experiences for developers.',
      avatar: '/avatars/priya.jpg',
      social: {
        github: 'https://github.com/priyapatel',
        linkedin: 'https://linkedin.com/in/priyapatel',
        twitter: 'https://twitter.com/priyapatel',
      },
    },
    {
      name: 'Alex Kim',
      role: 'Head of Engineering',
      bio: 'Backend specialist with expertise in scalable systems. Previously at Microsoft and Stripe.',
      avatar: '/avatars/alex.jpg',
      social: {
        github: 'https://github.com/alexkim',
        linkedin: 'https://linkedin.com/in/alexkim',
        twitter: 'https://twitter.com/alexkim',
      },
    },
  ];

  const milestones = [
    {
      year: '2022',
      title: 'The Beginning',
      description:
        'Founded by hackathon enthusiasts who experienced the pain of team formation firsthand.',
    },
    {
      year: '2023',
      title: 'First 1,000 Users',
      description:
        'Reached our first milestone with developers from 50+ countries joining the platform.',
    },
    {
      year: '2023',
      title: 'AI Matching Launch',
      description: 'Introduced our revolutionary AI-powered team matching algorithm.',
    },
    {
      year: '2024',
      title: 'Community Growth',
      description:
        'Expanded to 10,000+ active developers and partnered with major hackathon organizers.',
    },
    {
      year: '2024',
      title: 'Global Recognition',
      description: 'Won "Best Developer Tool" at TechCrunch Disrupt and secured Series A funding.',
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
              Our Story
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Building the Future of
              <br />
              <span className="text-primary">Hackathon Collaboration</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              We started as hackathon participants who were frustrated with the time wasted on team
              formation. Today, we're helping thousands of developers find their perfect teammates
              and win competitions.
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {stats.map((stat, index) => (
                <div key={index}>
                  <div className="text-3xl md:text-4xl font-bold text-primary mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
              <p className="text-xl text-muted-foreground leading-relaxed mb-8">
                To democratize hackathon success by connecting developers with the right teammates
                and providing tools that turn great ideas into winning projects. We believe that
                innovation happens when diverse minds collaborate effectively.
              </p>
              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <blockquote className="text-lg italic text-muted-foreground">
                  "Every developer deserves the chance to be part of a winning team. Our platform
                  removes the barriers and creates opportunities for meaningful collaboration."
                </blockquote>
                <div className="mt-4 text-sm font-semibold">— Sarah Chen, Co-Founder & CEO</div>
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Values</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                The principles that guide everything we do
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, index) => {
                const Icon = value.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="pt-6">
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-full">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                      </div>
                      <h3 className="font-semibold mb-3">{value.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {value.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet Our Team</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Passionate developers and designers who understand the hackathon experience
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {team.map((member, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="pt-6">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {member.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="font-semibold mb-1">{member.name}</h3>
                    <p className="text-sm text-primary mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                      {member.bio}
                    </p>
                    <div className="flex justify-center space-x-3">
                      <a
                        href={member.social.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href={member.social.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 bg-muted rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        <Twitter className="w-4 h-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Key milestones in building the world's best hackathon collaboration platform
              </p>
            </div>

            <div className="max-w-4xl mx-auto">
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {milestone.year.slice(-2)}
                      </div>
                    </div>
                    <div className="flex-grow">
                      <div className="bg-background rounded-lg p-6 shadow-sm border">
                        <div className="flex items-center gap-3 mb-2">
                          <Badge variant="secondary">{milestone.year}</Badge>
                          <h3 className="font-semibold">{milestone.title}</h3>
                        </div>
                        <p className="text-muted-foreground">{milestone.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Join Our Growing Community</h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
              Be part of the platform that's transforming how developers collaborate and win
              hackathons
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
                <Link to="/contact">Get in Touch</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
