import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { toast } from 'sonner';
import type {
  Idea,
  IdeaFormData,
  CreateIdeaRequest,
  UpdateIdeaRequest,
  EnhanceIdeaResponse,
} from '../../types/idea';
import {
  COMPLEXITY_LEVELS,
  TIME_COMMITMENTS,
  IDEA_STATUSES,
  VALIDATION_RULES,
} from '../../types/idea';
import { IdeaEnhancementButton } from './IdeaEnhancementButton';

interface IdeaFormProps {
  idea?: Idea;
  onSubmit: (data: CreateIdeaRequest | UpdateIdeaRequest) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const IdeaForm = ({ idea, onSubmit, onCancel, isLoading = false }: IdeaFormProps) => {
  const [newTech, setNewTech] = useState('');
  const [newTag, setNewTag] = useState('');

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<IdeaFormData>({
    defaultValues: {
      title: idea?.title || '',
      description: idea?.description || '',
      problemStatement: idea?.problemStatement || '',
      proposedSolution: idea?.proposedSolution || '',
      techStack: idea?.techStack || [],
      teamSizeNeeded: idea?.teamSizeNeeded || 2,
      complexityLevel: idea?.complexityLevel || 'intermediate',
      timeCommitment: idea?.timeCommitment || 'weekend',
      status: idea?.status || 'published',
      tags: idea?.tags || [],
    },
    mode: 'onChange',
  });

  const watchedDescription = watch('description');
  const watchedTechStack = watch('techStack');
  const watchedTags = watch('tags');

  const addTech = () => {
    if (!newTech.trim()) return;

    const currentTechStack = watchedTechStack || [];
    if (currentTechStack.includes(newTech.trim())) {
      toast.error('Technology already added');
      return;
    }

    if (currentTechStack.length >= VALIDATION_RULES.techStack.maxItems) {
      toast.error(`Maximum ${VALIDATION_RULES.techStack.maxItems} technologies allowed`);
      return;
    }

    setValue('techStack', [...currentTechStack, newTech.trim()]);
    setNewTech('');
  };

  const removeTech = (techToRemove: string) => {
    const currentTechStack = watchedTechStack || [];
    setValue(
      'techStack',
      currentTechStack.filter((tech) => tech !== techToRemove)
    );
  };

  const addTag = () => {
    if (!newTag.trim()) return;

    const currentTags = watchedTags || [];
    if (currentTags.includes(newTag.trim())) {
      toast.error('Tag already added');
      return;
    }

    if (currentTags.length >= VALIDATION_RULES.tags.maxItems) {
      toast.error(`Maximum ${VALIDATION_RULES.tags.maxItems} tags allowed`);
      return;
    }

    if (newTag.length > VALIDATION_RULES.tags.maxLength) {
      toast.error(`Tag length cannot exceed ${VALIDATION_RULES.tags.maxLength} characters`);
      return;
    }

    setValue('tags', [...currentTags, newTag.trim()]);
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = watchedTags || [];
    setValue(
      'tags',
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleEnhancement = (enhancement: EnhanceIdeaResponse) => {
    // Apply the enhanced description
    setValue('description', enhancement.enhancedDescription);

    // Merge suggested tech stack with existing
    const currentTechStack = watchedTechStack || [];
    const newTechStack = [...currentTechStack];

    enhancement.suggestedTechStack.forEach((tech) => {
      if (
        !newTechStack.includes(tech) &&
        newTechStack.length < VALIDATION_RULES.techStack.maxItems
      ) {
        newTechStack.push(tech);
      }
    });

    setValue('techStack', newTechStack);

    toast.success('Idea enhanced! Review the changes and adjust as needed.');
  };

  const onFormSubmit = async (data: IdeaFormData) => {
    try {
      await onSubmit(data);
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          {...register('title', {
            required: 'Title is required',
            minLength: {
              value: VALIDATION_RULES.title.minLength,
              message: `Title must be at least ${VALIDATION_RULES.title.minLength} characters`,
            },
            maxLength: {
              value: VALIDATION_RULES.title.maxLength,
              message: `Title cannot exceed ${VALIDATION_RULES.title.maxLength} characters`,
            },
          })}
          placeholder="Enter your idea title..."
          className={errors.title ? 'border-red-500' : ''}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
      </div>

      {/* Description with AI Enhancement */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="description">Description *</Label>
          <IdeaEnhancementButton
            description={watchedDescription || ''}
            onEnhanced={handleEnhancement}
            disabled={isLoading}
          />
        </div>
        <Textarea
          id="description"
          {...register('description', {
            required: 'Description is required',
            minLength: {
              value: VALIDATION_RULES.description.minLength,
              message: `Description must be at least ${VALIDATION_RULES.description.minLength} characters`,
            },
            maxLength: {
              value: VALIDATION_RULES.description.maxLength,
              message: `Description cannot exceed ${VALIDATION_RULES.description.maxLength} characters`,
            },
          })}
          placeholder="Describe your idea in detail..."
          rows={4}
          className={errors.description ? 'border-red-500' : ''}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{errors.description?.message}</span>
          <span>
            {watchedDescription?.length || 0}/{VALIDATION_RULES.description.maxLength}
          </span>
        </div>
      </div>

      {/* Problem Statement */}
      <div className="space-y-2">
        <Label htmlFor="problemStatement">Problem Statement *</Label>
        <Textarea
          id="problemStatement"
          {...register('problemStatement', {
            required: 'Problem statement is required',
            minLength: {
              value: VALIDATION_RULES.problemStatement.minLength,
              message: `Problem statement must be at least ${VALIDATION_RULES.problemStatement.minLength} characters`,
            },
            maxLength: {
              value: VALIDATION_RULES.problemStatement.maxLength,
              message: `Problem statement cannot exceed ${VALIDATION_RULES.problemStatement.maxLength} characters`,
            },
          })}
          placeholder="What problem does your idea solve?"
          rows={3}
          className={errors.problemStatement ? 'border-red-500' : ''}
        />
        {errors.problemStatement && (
          <p className="text-sm text-red-500">{errors.problemStatement.message}</p>
        )}
      </div>

      {/* Proposed Solution */}
      <div className="space-y-2">
        <Label htmlFor="proposedSolution">Proposed Solution *</Label>
        <Textarea
          id="proposedSolution"
          {...register('proposedSolution', {
            required: 'Proposed solution is required',
            minLength: {
              value: VALIDATION_RULES.proposedSolution.minLength,
              message: `Proposed solution must be at least ${VALIDATION_RULES.proposedSolution.minLength} characters`,
            },
            maxLength: {
              value: VALIDATION_RULES.proposedSolution.maxLength,
              message: `Proposed solution cannot exceed ${VALIDATION_RULES.proposedSolution.maxLength} characters`,
            },
          })}
          placeholder="How will you solve this problem?"
          rows={3}
          className={errors.proposedSolution ? 'border-red-500' : ''}
        />
        {errors.proposedSolution && (
          <p className="text-sm text-red-500">{errors.proposedSolution.message}</p>
        )}
      </div>

      {/* Tech Stack */}
      <div className="space-y-2">
        <Label>Tech Stack * (at least 1 required)</Label>
        <div className="flex gap-2">
          <Input
            value={newTech}
            onChange={(e) => setNewTech(e.target.value)}
            placeholder="Add technology..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTech())}
          />
          <Button type="button" onClick={addTech} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTechStack?.map((tech, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {tech}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => removeTech(tech)}
              />
            </Badge>
          ))}
        </div>
        {(!watchedTechStack || watchedTechStack.length === 0) && (
          <p className="text-sm text-red-500">At least one technology is required</p>
        )}
      </div>

      {/* Team Size and Complexity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="teamSizeNeeded">Team Size Needed *</Label>
          <Input
            id="teamSizeNeeded"
            type="number"
            min={VALIDATION_RULES.teamSizeNeeded.min}
            max={VALIDATION_RULES.teamSizeNeeded.max}
            {...register('teamSizeNeeded', {
              required: 'Team size is required',
              min: {
                value: VALIDATION_RULES.teamSizeNeeded.min,
                message: `Minimum team size is ${VALIDATION_RULES.teamSizeNeeded.min}`,
              },
              max: {
                value: VALIDATION_RULES.teamSizeNeeded.max,
                message: `Maximum team size is ${VALIDATION_RULES.teamSizeNeeded.max}`,
              },
            })}
            className={errors.teamSizeNeeded ? 'border-red-500' : ''}
          />
          {errors.teamSizeNeeded && (
            <p className="text-sm text-red-500">{errors.teamSizeNeeded.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Complexity Level *</Label>
          <Controller
            name="complexityLevel"
            control={control}
            rules={{ required: 'Complexity level is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.complexityLevel ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select complexity" />
                </SelectTrigger>
                <SelectContent>
                  {COMPLEXITY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.complexityLevel && (
            <p className="text-sm text-red-500">{errors.complexityLevel.message}</p>
          )}
        </div>
      </div>

      {/* Time Commitment and Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Time Commitment *</Label>
          <Controller
            name="timeCommitment"
            control={control}
            rules={{ required: 'Time commitment is required' }}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className={errors.timeCommitment ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select time commitment" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_COMMITMENTS.map((commitment) => (
                    <SelectItem key={commitment.value} value={commitment.value}>
                      {commitment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.timeCommitment && (
            <p className="text-sm text-red-500">{errors.timeCommitment.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label>Status</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
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
            )}
          />
        </div>
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags (optional)</Label>
        <div className="flex gap-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
          />
          <Button type="button" onClick={addTag} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {watchedTags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="flex items-center gap-1">
              {tag}
              <X
                className="w-3 h-3 cursor-pointer hover:text-red-500"
                onClick={() => removeTag(tag)}
              />
            </Badge>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isLoading || !isValid || !watchedTechStack?.length}
          className="flex-1"
        >
          {isLoading ? 'Saving...' : idea ? 'Update Idea' : 'Create Idea'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
