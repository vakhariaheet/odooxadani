import { useState, useEffect } from 'react';
import { Users, Lightbulb, UserCheck, Trophy } from 'lucide-react';
import type { PlatformMetrics, AnimatedCounterProps } from '@/types/landing';

const AnimatedCounter = ({
  end,
  duration = 2000,
  prefix = '',
  suffix = '',
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [end, duration]);

  return (
    <span className="font-bold text-2xl md:text-3xl text-primary">
      {prefix}
      {count.toLocaleString()}
      {suffix}
    </span>
  );
};

export const StatsSection = () => {
  const [metrics, setMetrics] = useState<PlatformMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadMetrics = async () => {
      try {
        // Try to load real metrics (will be available after integration)
        const response = await fetch('/api/analytics/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data.data);
        } else {
          throw new Error('API not available');
        }
      } catch (error) {
        // Fallback to mock data
        setMetrics({
          totalParticipants: 1247,
          totalIdeas: 389,
          teamsFormed: 156,
          successfulProjects: 89,
          lastUpdated: new Date().toISOString(),
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadMetrics();
  }, []);

  if (isLoading || !metrics) {
    return (
      <section className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-pulse">Loading platform metrics...</div>
          </div>
        </div>
      </section>
    );
  }

  const stats = [
    {
      icon: Users,
      label: 'Active Participants',
      value: metrics.totalParticipants,
      suffix: '+',
    },
    {
      icon: Lightbulb,
      label: 'Ideas Pitched',
      value: metrics.totalIdeas,
      suffix: '+',
    },
    {
      icon: UserCheck,
      label: 'Teams Formed',
      value: metrics.teamsFormed,
      suffix: '+',
    },
    {
      icon: Trophy,
      label: 'Successful Projects',
      value: metrics.successfulProjects,
      suffix: '+',
    },
  ];

  return (
    <section className="py-16 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Platform Impact</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join thousands of participants who have found their perfect teammates and validated
            winning ideas
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-primary/10 rounded-full">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="mb-2">
                  <AnimatedCounter
                    end={stat.value}
                    suffix={stat.suffix}
                    duration={2000 + index * 200}
                  />
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date(metrics.lastUpdated).toLocaleDateString()}
          </p>
        </div>
      </div>
    </section>
  );
};
