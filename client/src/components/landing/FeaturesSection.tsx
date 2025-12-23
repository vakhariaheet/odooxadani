import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  FileText, 
  PenTool, 
  Receipt, 
  TrendingUp, 
  Users, 
  BarChart3 
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: "Smart Proposal Builder",
    description: "Create professional proposals in minutes with reusable templates and smart automation."
  },
  {
    icon: PenTool,
    title: "Digital Signatures",
    description: "Get legally binding signatures without printing or scanning. Fully compliant and secure."
  },
  {
    icon: Receipt,
    title: "Automated Invoicing",
    description: "Generate invoices instantly when proposals are accepted. No manual work required."
  },
  {
    icon: TrendingUp,
    title: "Payment Tracking",
    description: "Monitor payment status and send smart reminders to ensure you get paid on time."
  },
  {
    icon: Users,
    title: "Client Portal",
    description: "Give clients a professional experience for reviewing proposals and making payments."
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track proposal success rates, payment timelines, and optimize your workflow."
  }
];

export const FeaturesSection = () => {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Get Paid Faster
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Streamline your entire freelance workflow from proposal to payment with our comprehensive platform.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <Icon className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600 text-center">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};