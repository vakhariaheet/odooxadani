/**
 * RegistrationModal Component
 *
 * Modal for event registration with skills input
 */

import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import type { Event } from '../../types/event';

interface RegistrationModalProps {
  event: Event;
  onSubmit: (skills: string[]) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  event,
  onSubmit,
  onClose,
  isLoading = false,
}) => {
  const [skills, setSkills] = useState<string[]>([]);
  const [currentSkill, setCurrentSkill] = useState('');

  const handleAddSkill = () => {
    if (currentSkill.trim() && !skills.includes(currentSkill.trim())) {
      setSkills([...skills, currentSkill.trim()]);
      setCurrentSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(skills);
  };

  // Common skills suggestions
  const suggestedSkills = [
    'JavaScript',
    'TypeScript',
    'React',
    'Node.js',
    'Python',
    'Java',
    'UI/UX Design',
    'Product Management',
    'Data Science',
    'Machine Learning',
    'Mobile Development',
    'Backend Development',
    'DevOps',
    'Blockchain',
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Register for Event</CardTitle>
            <Button variant="ghost" size="icon" onClick={onClose} disabled={isLoading}>
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            {event.requiresApproval
              ? 'Your application will be reviewed by the organizer'
              : 'You will be registered immediately'}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Event Info */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-1">{event.name}</h3>
              <p className="text-sm text-muted-foreground">Organized by {event.organizerName}</p>
            </div>

            {/* Skills Input */}
            <div>
              <Label htmlFor="skills">Your Skills</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Add skills that you can contribute to a team
              </p>

              <div className="flex gap-2 mb-3">
                <Input
                  id="skills"
                  value={currentSkill}
                  onChange={(e) => setCurrentSkill(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="e.g., React, Python, UI Design"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!currentSkill.trim() || isLoading}
                  size="icon"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {/* Current Skills */}
              {skills.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium mb-2">Your Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleRemoveSkill(skill)}
                      >
                        {skill}
                        <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggested Skills */}
              <div>
                <p className="text-sm font-medium mb-2">Suggested Skills:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedSkills
                    .filter((skill) => !skills.includes(skill))
                    .slice(0, 8)
                    .map((skill) => (
                      <Badge
                        key={skill}
                        variant="outline"
                        className="cursor-pointer hover:bg-secondary"
                        onClick={() => {
                          setSkills([...skills, skill]);
                        }}
                      >
                        {skill}
                        <Plus className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {event.requiresApproval ? 'Submit Application' : 'Register Now'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
