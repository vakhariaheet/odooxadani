import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Edit3, 
  Send, 
  CheckCircle, 
  DollarSign 
} from 'lucide-react';

const steps = [
  {
    icon: Edit3,
    title: "Create",
    description: "Build professional proposals using smart templates and customizable sections.",
    step: "01"
  },
  {
    icon: Send,
    title: "Send",
    description: "Share proposals with clients via secure links with real-time tracking.",
    step: "02"
  },
  {
    icon: CheckCircle,
    title: "Sign",
    description: "Collect digital signatures and approvals with legally binding e-signatures.",
    step: "03"
  },
  {
    icon: DollarSign,
    title: "Get Paid",
    description: "Receive payments faster with automated invoicing and payment reminders.",
    step: "04"
  }
];

export const HowItWorksSection = () => {
  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Our streamlined 4-step process takes you from proposal to payment in record time.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <Card className="border-2 border-gray-100 hover:border-blue-200 transition-colors duration-300 h-full">
                  <CardHeader className="text-center pb-4">
                    <div className="relative mx-auto mb-4">
                      <div className="p-4 bg-blue-600 rounded-full w-fit mx-auto">
                        <Icon className="h-8 w-8 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 bg-blue-100 text-blue-600 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                        {step.step}
                      </div>
                    </div>
                    <CardTitle className="text-xl font-semibold text-gray-900">
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
                
                {/* Arrow connector for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <div className="w-8 h-0.5 bg-blue-300"></div>
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-0 h-0 border-l-4 border-l-blue-300 border-t-2 border-t-transparent border-b-2 border-b-transparent"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};