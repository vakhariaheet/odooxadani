import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PenTool, Users, MessageSquare } from 'lucide-react';

const steps = [
  {
    icon: PenTool,
    title: 'Pitch Your Idea',
    description:
      'Submit your hackathon concept with the skills you need and what you bring to the table.',
    step: '01',
  },
  {
    icon: Users,
    title: 'Find Your Team',
    description: 'Browse ideas and connect with complementary teammates who share your vision.',
    step: '02',
  },
  {
    icon: MessageSquare,
    title: 'Get Feedback',
    description:
      'Receive votes and judge feedback to refine your approach before the event starts.',
    step: '03',
  },
];

export const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <Card
              key={index}
              className="text-center relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
            >
              <CardHeader>
                <div className="absolute -top-4 -left-4 bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                  {step.step}
                </div>
                <step.icon className="w-12 h-12 mx-auto text-blue-600 mb-4" />
                <CardTitle>{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{step.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
