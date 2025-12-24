import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useLandingData } from '@/hooks/useLandingData';

interface AnimatedCounterProps {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}

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

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(end * easeOutQuart));

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

  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };

  return (
    <span>
      {prefix}
      {formatNumber(count)}
      {suffix}
    </span>
  );
};

export const LiveStatsCounter = () => {
  const { stats, loading } = useLandingData();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  const statsData = [
    {
      label: 'Events Hosted',
      value: stats?.totalEvents || 0,
      icon: '🎉',
      suffix: '+',
      color: 'text-blue-600',
    },
    {
      label: 'Venues Listed',
      value: stats?.totalVenues || 0,
      icon: '🏢',
      suffix: '+',
      color: 'text-green-600',
    },
    {
      label: 'Bookings Made',
      value: stats?.totalBookings || 0,
      icon: '📅',
      suffix: '+',
      color: 'text-purple-600',
    },
    {
      label: 'Happy Users',
      value: stats?.activeUsers || 0,
      icon: '👥',
      suffix: '+',
      color: 'text-orange-600',
    },
  ];

  if (loading) {
    return (
      <section id="stats-section" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">EventHub by the Numbers</h2>
            <p className="text-xl text-gray-600">Join thousands of satisfied users worldwide</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="text-center">
                <CardContent className="p-6">
                  <div className="text-3xl mb-2">⏳</div>
                  <div className="text-2xl font-bold text-gray-400 mb-1">---</div>
                  <div className="text-sm text-gray-500">Loading...</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="stats-section" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">EventHub by the Numbers</h2>
          <p className="text-xl text-gray-600">
            Join thousands of satisfied users who trust EventHub for their events
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          {statsData.map((stat, index) => (
            <Card key={index} className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className={`text-2xl md:text-3xl font-bold mb-1 ${stat.color}`}>
                  {isVisible ? (
                    <AnimatedCounter
                      end={stat.value}
                      suffix={stat.suffix}
                      duration={2000 + index * 200} // Stagger animations
                    />
                  ) : (
                    '0'
                  )}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional metrics */}
        <div className="mt-12 text-center">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">⭐</span>
              <span className="font-semibold">4.9/5</span>
              <span>Average Rating</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">🌍</span>
              <span className="font-semibold">50+</span>
              <span>Cities Worldwide</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span className="text-lg">💰</span>
              <span className="font-semibold">$2M+</span>
              <span>Revenue Generated</span>
            </div>
          </div>
        </div>

        {/* Real-time indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>Live data • Updated in real-time</span>
          </div>
        </div>
      </div>
    </section>
  );
};
