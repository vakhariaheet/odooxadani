import { Card, CardContent } from '@/components/ui/card';
import { Users, Target, Zap } from 'lucide-react';

const values = [
  {
    icon: Users,
    title: 'Community First',
    description:
      'We believe the best hackathon projects come from diverse, collaborative teams working together.',
  },
  {
    icon: Target,
    title: 'Focus on Building',
    description:
      'Our mission is to eliminate time wasted on logistics so you can focus on what matters: creating amazing projects.',
  },
  {
    icon: Zap,
    title: 'Innovation Through Connection',
    description:
      'Great ideas become reality when the right people come together with the right tools and support.',
  },
];

export const AboutSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold mb-6">About HackMatch</h2>
          <p className="text-xl text-gray-600 mb-8">
            We're passionate hackathon participants who got tired of spending precious hours on team
            formation instead of building. HackMatch was born from our own frustration and the
            belief that there had to be a better way.
          </p>
          <p className="text-lg text-gray-600">
            Founded in 2024 by a team of developers, designers, and hackathon enthusiasts, we've
            participated in over 50 hackathons combined and know exactly what it takes to form
            winning teams quickly and efficiently.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {values.map((value, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-8">
                <value.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-semibold mb-4">Our Mission</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            To revolutionize hackathon team formation by connecting the right people with the right
            ideas at the right time, enabling participants to spend their energy on innovation
            rather than networking.
          </p>
        </div>
      </div>
    </section>
  );
};
