import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'CEO & Co-Founder',
    bio: 'Former VP of Events at TechCorp with 10+ years in event management',
    avatar: '👩‍💼',
  },
  {
    name: 'Michael Chen',
    role: 'CTO & Co-Founder',
    bio: 'Ex-Google engineer passionate about building scalable event platforms',
    avatar: '👨‍💻',
  },
  {
    name: 'Emily Rodriguez',
    role: 'Head of Product',
    bio: 'Product leader focused on creating intuitive user experiences',
    avatar: '👩‍🎨',
  },
  {
    name: 'David Kim',
    role: 'Head of Sales',
    bio: 'Sales veteran helping venues and organizers grow their business',
    avatar: '👨‍💼',
  },
];

const milestones = [
  {
    year: '2022',
    title: 'Company Founded',
    description: 'EventHub was born from the need for better event discovery and venue management',
  },
  {
    year: '2023',
    title: 'First 1,000 Users',
    description: 'Reached our first milestone with venues and organizers across 10 cities',
  },
  {
    year: '2024',
    title: 'Series A Funding',
    description: 'Raised $5M to expand our platform and reach more markets',
  },
  {
    year: '2024',
    title: '50,000+ Events',
    description: 'Facilitated over 50,000 successful events and growing rapidly',
  },
];

const values = [
  {
    title: 'User-Centric Design',
    description: "Every feature we build starts with understanding our users' needs",
    icon: '👥',
  },
  {
    title: 'Transparency',
    description: 'Clear pricing, honest communication, and no hidden surprises',
    icon: '🔍',
  },
  {
    title: 'Innovation',
    description: 'Constantly pushing boundaries to improve the event experience',
    icon: '🚀',
  },
  {
    title: 'Community',
    description: 'Building connections between event creators and attendees',
    icon: '🤝',
  },
];

export function AboutPage() {
  return (
    <main className="min-h-screen py-20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6">About EventHub</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform how people discover, book, and manage events by
            connecting organizers, venues, and attendees in one seamless platform.
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-20">
          <Card className="max-w-4xl mx-auto">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl mb-4">Our Mission</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg text-gray-600 leading-relaxed">
                EventHub exists to make event discovery and venue management effortless. We believe
                that great events bring people together, create lasting memories, and drive
                communities forward. Our platform empowers organizers to focus on creating amazing
                experiences while giving venues the tools to maximize their potential.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-4xl mb-4">{value.icon}</div>
                  <CardTitle className="text-xl">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{value.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Our Journey</h2>
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={index} className="flex items-start space-x-6">
                  <div className="flex-shrink-0 w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    {milestone.year}
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-xl font-semibold mb-2">{milestone.title}</h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Team</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="text-6xl mb-4">{member.avatar}</div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-blue-600 font-medium">
                    {member.role}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-20">
          <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <CardContent className="py-16">
              <div className="grid md:grid-cols-4 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">50,000+</div>
                  <div className="text-blue-100">Events Hosted</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">10,000+</div>
                  <div className="text-blue-100">Active Users</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">500+</div>
                  <div className="text-blue-100">Partner Venues</div>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">25</div>
                  <div className="text-blue-100">Cities Served</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Growing Community</h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Whether you're an event organizer, venue owner, or someone who loves great events, we'd
            love to have you on board.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/sign-up">Get Started Today</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/contact">Get in Touch</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
