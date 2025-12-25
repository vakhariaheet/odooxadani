import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lightbulb, Trophy, BarChart } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Smart Team Matching',
    description:
      'AI-powered skill matching connects you with complementary teammates based on your expertise and project needs.',
  },
  {
    icon: Lightbulb,
    title: 'Idea Validation',
    description:
      'Get community votes and early feedback on your ideas before investing time in development.',
  },
  {
    icon: Trophy,
    title: 'Judge Pre-Scoring',
    description:
      'Receive early feedback from judges to refine your concept and improve your chances of winning.',
  },
  {
    icon: BarChart,
    title: 'Organizer Analytics',
    description:
      'Event organizers get insights into participant skills and interests for better hackathon planning.',
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">
          Everything You Need for Successful Team Formation
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <feature.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
