import type { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  benefits: string[];
  highlighted?: boolean;
}

export const FeatureCard = ({
  title,
  description,
  icon: Icon,
  benefits,
  highlighted = false,
}: FeatureCardProps) => {
  return (
    <Card
      className={`relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
        highlighted ? 'border-primary shadow-md' : ''
      }`}
    >
      {highlighted && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <Badge variant="default" className="bg-primary text-primary-foreground">
            Most Popular
          </Badge>
        </div>
      )}

      <CardHeader className="text-center pb-4">
        <div className="flex justify-center mb-4">
          <div
            className={`p-3 rounded-full ${
              highlighted ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
            }`}
          >
            <Icon className="w-8 h-8" />
          </div>
        </div>
        <CardTitle className="text-xl mb-2">{title}</CardTitle>
        <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
      </CardHeader>

      <CardContent>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-sm">
              <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
              <span className="text-muted-foreground">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
