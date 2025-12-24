import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const steps = [
  {
    step: '1',
    title: 'Browse Events',
    description: 'Discover events by category, location, and date with our smart filtering system.',
    icon: '🎯',
  },
  {
    step: '2',
    title: 'Book Instantly',
    description: 'Secure your spot with real-time availability and instant confirmation.',
    icon: '📅',
  },
  {
    step: '3',
    title: 'Manage Everything',
    description: 'Track bookings, communicate with organizers, and enjoy seamless experiences.',
    icon: '✨',
  },
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Get started in three simple steps and transform your event experience
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <Card className="relative hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <div className="text-4xl mb-4 mt-4">{step.icon}</div>
                  <CardTitle className="text-xl">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{step.description}</CardDescription>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
