import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import type { TestimonialData } from '@/types/landing';

interface TestimonialCardProps {
  testimonial: TestimonialData;
}

export const TestimonialCard = ({ testimonial }: TestimonialCardProps) => {
  const { name, role, company, content, avatar, rating } = testimonial;

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-lg">
      <CardContent className="p-6">
        {/* Rating */}
        <div className="flex gap-1 mb-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Star
              key={index}
              className={`w-4 h-4 ${
                index < rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/30'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <blockquote className="text-muted-foreground mb-6 leading-relaxed">"{content}"</blockquote>

        {/* Author */}
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={avatar} alt={name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {name
                .split(' ')
                .map((n) => n[0])
                .join('')}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-sm">{name}</div>
            <div className="text-xs text-muted-foreground">
              {role} at {company}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
