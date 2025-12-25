/**
 * IdeaForm Component
 * Form for creating and editing ideas with AI enhancement capabilities
 */

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Plus, X, Lightbulb, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { AiEnhancementButton } from './AiEnhancementButton';
import { useCreateIdea, useUpdateIdea } from '../../hooks/useIdeas';
import type {
  Idea,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  IdeaCategory,
  IdeaDifficulty,
  IdeaStatus,
} from '../../types/idea';
import { IDEA_CATEGORIES, IDEA_DIFFICULTIES, IDEA_STATUSES } from '../../types/idea';
import { toast } from 'sonner';

// Form validation schema
const ideaSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be less than 2000 characters'),
  category: z.enum([
    'web',
    'mobile',
    'ai',
    'blockchain',
    'iot',
    'gaming',
    'fintech',
    'healthtech',
    'edtech',
    'other',
  ]),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  teamSize: z.number().min(1, 'Team size must be at least 1').max(10, 'Team size cannot exceed 10'),
  status: z.enum(['draft', 'published', 'archived']).optional(),
});

type IdeaFormData = z.infer<typeof ideaSchema>;

interface IdeaFormProps {
  idea?: Idea;
  onSuccess?: (idea: Idea) => void;
  onCancel?: () => void;
}

export function IdeaForm({ idea, onSuccess, onCancel }: IdeaFormProps) {
  const [skills, setSkills] = useState<string[]>(idea?.skills || []);
  const [newSkill, setNewSkill] = useState('');

  const createIdea = useCreateIdea();
  const updateIdea = useUpdateIdea();

  const isEditing = !!idea;
  const isLoading = createIdea.isPending || updateIdea.isPending;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<IdeaFormData>({
    resolver: zodResolver(ideaSchema),
    defaultValues: {
      title: idea?.title || '',
      description: idea?.description || '',
      category: idea?.category || 'web',
      difficulty: idea?.difficulty || 'beginner',
      teamSize: idea?.teamSize || 3,
      status: idea?.status || 'published',
    },
  });

  // Reset form when idea changes
  useEffect(() => {
    if (idea) {
      reset({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        difficulty: idea.difficulty,
        teamSize: idea.teamSize,
        status: idea.status,
      });
      setSkills(idea.skills);
    }
  }, [idea, reset]);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim()) && skills.length < 10) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const onSubmit = async (data: IdeaFormData) => {
    if (skills.length === 0) {
      toast.error('Please add at least one skill');
      return;
    }

    try {
      const ideaData = {
        ...data,
        skills,
      };

      if (isEditing && idea) {
        const response = await updateIdea.mutateAsync({
          id: idea.id,
          data: ideaData as UpdateIdeaRequest,
        });
        toast.success('Idea updated successfully!');
        onSuccess?.(response.data);
      } else {
        const response = await createIdea.mutateAsync(ideaData as CreateIdeaRequest);
        toast.success('Idea created successfully! AI enhancements have been applied.');
        onSuccess?.(response.data);
      }
    } catch (error) {
      toast.error(isEditing ? 'Failed to update idea' : 'Failed to create idea');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5" />
          {isEditing ? 'Edit Idea' : 'Submit New Idea'}
        </CardTitle>
        {!isEditing && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <Sparkles className="h-4 w-4" />
            Use AI Enhance buttons to improve your title and description with AI assistance
          </p>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Title */}
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title')}
              placeholder="Enter your hackathon idea title..."
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title.message}</p>}

            {/* AI Enhancement for Title */}
            {!isEditing && (
              <div className="mt-2">
                <AiEnhancementButton
                  type="title"
                  content={watch('title') || ''}
                  context={{
                    category: watch('category'),
                    difficulty: watch('difficulty'),
                    skills,
                  }}
                  onEnhanced={(enhancedTitle) => {
                    setValue('title', enhancedTitle);
                    toast.success('Title enhanced with AI!');
                  }}
                  disabled={!watch('title')?.trim()}
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your idea in detail. What problem does it solve? How would you build it?"
              rows={6}
              className={errors.description ? 'border-red-500' : ''}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">{errors.description.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {watch('description')?.length || 0}/2000 characters
            </p>

            {/* AI Enhancement for Description */}
            {!isEditing && (
              <div className="mt-2">
                <AiEnhancementButton
                  type="description"
                  content={watch('description') || ''}
                  context={{
                    title: watch('title'),
                    category: watch('category'),
                    difficulty: watch('difficulty'),
                    skills,
                  }}
                  onEnhanced={(enhancedDescription) => {
                    setValue('description', enhancedDescription);
                    toast.success('Description enhanced with AI!');
                  }}
                  disabled={
                    !watch('description')?.trim() || (watch('description')?.length || 0) < 10
                  }
                />
              </div>
            )}
          </div>

          {/* Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={watch('category')}
                onValueChange={(value) => setValue('category', value as IdeaCategory)}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">{errors.category.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select
                value={watch('difficulty')}
                onValueChange={(value) => setValue('difficulty', value as IdeaDifficulty)}
              >
                <SelectTrigger className={errors.difficulty ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_DIFFICULTIES.map((difficulty) => (
                    <SelectItem key={difficulty.value} value={difficulty.value}>
                      {difficulty.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.difficulty && (
                <p className="text-sm text-red-600 mt-1">{errors.difficulty.message}</p>
              )}
            </div>
          </div>

          {/* Team Size */}
          <div>
            <Label htmlFor="teamSize">Ideal Team Size *</Label>
            <Input
              id="teamSize"
              type="number"
              min="1"
              max="10"
              {...register('teamSize', { valueAsNumber: true })}
              className={errors.teamSize ? 'border-red-500' : ''}
            />
            {errors.teamSize && (
              <p className="text-sm text-red-600 mt-1">{errors.teamSize.message}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              How many people would be ideal for this project?
            </p>
          </div>

          {/* Skills */}
          <div>
            <Label>Required Skills *</Label>
            <div className="flex gap-2 mt-1">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                placeholder="Add a skill (e.g., React, Python, Design)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSkill();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addSkill}
                disabled={!newSkill.trim() || skills.length >= 10}
                size="sm"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}

            {skills.length === 0 && (
              <p className="text-sm text-red-600 mt-1">Please add at least one skill</p>
            )}

            <p className="text-sm text-gray-500 mt-1">{skills.length}/10 skills added</p>
          </div>

          {/* Status (for editing) */}
          {isEditing && (
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch('status')}
                onValueChange={(value) => setValue('status', value as IdeaStatus)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {IDEA_STATUSES.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? 'Update Idea' : 'Submit Idea'}
            </Button>

            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
