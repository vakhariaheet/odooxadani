import type { LucideIcon } from 'lucide-react';

interface ProcessStepProps {
  step: number;
  title: string;
  description: string;
  icon: LucideIcon;
  isLast?: boolean;
}

export const ProcessStep = ({
  step,
  title,
  description,
  icon: Icon,
  isLast = false,
}: ProcessStepProps) => {
  return (
    <div className="relative">
      {/* Step connector line */}
      {!isLast && (
        <div className="hidden md:block absolute top-12 left-1/2 w-full h-0.5 bg-border transform translate-x-1/2 z-0" />
      )}

      <div className="relative z-10 text-center">
        {/* Step number and icon */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <Icon className="w-8 h-8 text-primary-foreground" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-background border-2 border-primary rounded-full flex items-center justify-center text-xs font-bold text-primary">
              {step}
            </div>
          </div>
        </div>

        {/* Step content */}
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed max-w-xs mx-auto">
          {description}
        </p>
      </div>
    </div>
  );
};
