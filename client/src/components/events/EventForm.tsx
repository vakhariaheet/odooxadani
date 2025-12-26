/**
 * EventForm Component
 *
 * Form for creating and editing events with validation
 */

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { CalendarIcon, Plus, X, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import { useEnhanceEvent } from '../../hooks/useEvents';
import type { Event, CreateEventRequest, UpdateEventRequest } from '../../types/event';
import { HACKATHON_CATEGORIES } from '../../types/event';

// Form validation schema
const eventFormSchema = z
  .object({
    name: z.string().min(1, 'Event name is required').max(100, 'Name too long'),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(2000, 'Description too long'),
    startDate: z.date({ message: 'Start date is required' }),
    endDate: z.date({ message: 'End date is required' }),
    registrationDeadline: z.date({ message: 'Registration deadline is required' }),
    location: z.string().min(1, 'Location is required').max(200, 'Location too long'),
    maxParticipants: z
      .number()
      .min(1, 'Must allow at least 1 participant')
      .max(10000, 'Too many participants'),
    categories: z.array(z.string()).min(1, 'At least one category is required'),
    rules: z.string().min(10, 'Rules must be at least 10 characters').max(5000, 'Rules too long'),
    isPublic: z.boolean(),
    requiresApproval: z.boolean(),
    tags: z.array(z.string()).optional(),
    prizes: z.array(
      z.object({
        position: z.number().min(1),
        title: z.string().min(1, 'Prize title is required'),
        description: z.string().min(1, 'Prize description is required'),
        value: z.string().optional(),
      })
    ),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: 'End date must be after start date',
    path: ['endDate'],
  })
  .refine((data) => data.registrationDeadline < data.startDate, {
    message: 'Registration deadline must be before start date',
    path: ['registrationDeadline'],
  });

type EventFormData = z.infer<typeof eventFormSchema>;

interface EventFormProps {
  event?: Event;
  onSubmit: (data: CreateEventRequest | UpdateEventRequest) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const EventForm: React.FC<EventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  isLoading = false,
  isEditing = false,
}) => {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(event?.categories || []);
  const [selectedTags, setSelectedTags] = useState<string[]>(event?.tags || []);
  const enhanceEventMutation = useEnhanceEvent();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger, // Add trigger for manual validation
    getValues, // Add getValues to check form state
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      name: event?.name || '',
      description: event?.description || '',
      startDate: event ? new Date(event.startDate) : undefined,
      endDate: event ? new Date(event.endDate) : undefined,
      registrationDeadline: event ? new Date(event.registrationDeadline) : undefined,
      location: event?.location || '',
      maxParticipants: event?.maxParticipants || 50,
      categories: event?.categories || [],
      rules: event?.rules || '',
      isPublic: event?.isPublic ?? true,
      requiresApproval: event?.requiresApproval ?? false,
      tags: event?.tags || [],
      prizes: event?.prizes || [
        { position: 1, title: '1st Place', description: 'Winner prize', value: '' },
        { position: 2, title: '2nd Place', description: 'Runner-up prize', value: '' },
        { position: 3, title: '3rd Place', description: 'Third place prize', value: '' },
      ],
    },
    mode: 'onChange', // This ensures validation happens on every change
  });

  const {
    fields: prizeFields,
    append: appendPrize,
    remove: removePrize,
  } = useFieldArray({
    control,
    name: 'prizes',
  });

  const watchedName = watch('name');
  const watchedDescription = watch('description');

  // Custom validation check
  const isFormValid = () => {
    const values = getValues();
    return (
      values.name?.trim() &&
      values.description?.trim() &&
      values.location?.trim() &&
      values.rules?.trim() &&
      values.startDate &&
      values.endDate &&
      values.registrationDeadline &&
      values.maxParticipants > 0 &&
      selectedCategories.length > 0 &&
      Object.keys(errors).length === 0
    );
  };

  // Update categories when selection changes
  useEffect(() => {
    setValue('categories', selectedCategories);
  }, [selectedCategories, setValue]);

  // Update tags when selection changes
  useEffect(() => {
    setValue('tags', selectedTags);
  }, [selectedTags, setValue]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleTagRemove = (indexToRemove: number) => {
    setSelectedTags((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  const handleTagAdd = (newTag: string) => {
    const cleanTag = newTag
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, '-');
    if (cleanTag && !selectedTags.includes(cleanTag)) {
      setSelectedTags((prev) => [...prev, cleanTag]);
    }
  };

  const handleSelectiveEnhance = async (
    type: 'title' | 'description' | 'categories' | 'tags' | 'rules' | 'all'
  ) => {
    if (!watchedName || !watchedDescription) {
      toast.error('Please enter event name and description first');
      return;
    }

    enhanceEventMutation.mutate(
      {
        name: watchedName,
        description: watchedDescription,
        categories: selectedCategories,
        location: watch('location'),
        enhanceType: type, // Add this parameter
      },
      {
        onSuccess: (enhancement) => {
          // Apply AI enhancements based on type
          if (type === 'title' || type === 'all') {
            if (enhancement.enhancedTitle) {
              setValue('name', enhancement.enhancedTitle);
            }
          }

          if (type === 'description' || type === 'all') {
            if (enhancement.enhancedDescription) {
              setValue('description', enhancement.enhancedDescription);
            }
          }

          if (type === 'rules' || type === 'all') {
            if (enhancement.generatedRules) {
              setValue('rules', enhancement.generatedRules);
            }
          }

          if (type === 'categories' || type === 'all') {
            if (enhancement.suggestedCategories && enhancement.suggestedCategories.length > 0) {
              setSelectedCategories(enhancement.suggestedCategories);
            }
          }

          if (type === 'tags' || type === 'all') {
            if (enhancement.suggestedTags && enhancement.suggestedTags.length > 0) {
              // Add new tags to existing ones instead of replacing
              setSelectedTags((prev) => {
                const newTags = enhancement.suggestedTags!.filter((tag) => !prev.includes(tag));
                return [...prev, ...newTags];
              });
            }
          }

          const typeMessages = {
            title: 'Event title rewritten with AI!',
            description: 'Event description enhanced with AI!',
            categories: 'Categories suggested with AI!',
            tags: 'New tags added with AI!',
            rules: 'Rules generated with AI!',
            all: 'Event enhanced with AI! Check all updated fields.',
          };

          toast.success(typeMessages[type]);
        },
      }
    );
  };

  const onFormSubmit = (data: EventFormData) => {
    console.log('Form submitted with data:', data); // Debug log
    console.log('isPublic value:', data.isPublic); // Debug isPublic specifically
    const formattedData = {
      ...data,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      registrationDeadline: data.registrationDeadline.toISOString(),
    };

    onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      {/* AI Enhancement All Button */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">AI Enhancement</h3>
              <p className="text-sm text-muted-foreground">
                Let AI enhance your entire event or specific sections
              </p>
            </div>
            <Button
              type="button"
              variant="default"
              onClick={() => handleSelectiveEnhance('all')}
              disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {enhanceEventMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Enhance Everything
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="name">Event Name *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectiveEnhance('title')}
                disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
              >
                {enhanceEventMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI Rewrite
              </Button>
            </div>
            <Input
              id="name"
              {...register('name')}
              placeholder="Enter event name"
              className={errors.name ? 'border-destructive' : ''}
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="description">Description *</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleSelectiveEnhance('description')}
                disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
              >
                {enhanceEventMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                AI Enhance
              </Button>
            </div>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Describe your event..."
              rows={4}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="location">Location *</Label>
            <Input
              id="location"
              {...register('location')}
              placeholder="e.g., San Francisco, CA or Virtual"
              className={errors.location ? 'border-destructive' : ''}
            />
            {errors.location && (
              <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="maxParticipants">Max Participants *</Label>
            <Input
              id="maxParticipants"
              type="number"
              {...register('maxParticipants', { valueAsNumber: true })}
              placeholder="50"
              min="1"
              max="10000"
              className={errors.maxParticipants ? 'border-destructive' : ''}
            />
            {errors.maxParticipants && (
              <p className="text-sm text-destructive mt-1">{errors.maxParticipants.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dates */}
      <Card>
        <CardHeader>
          <CardTitle>Event Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Registration Deadline *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('registrationDeadline') && 'text-muted-foreground',
                      errors.registrationDeadline && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('registrationDeadline') ? (
                      format(watch('registrationDeadline'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('registrationDeadline')}
                    onSelect={(date: Date | undefined) => setValue('registrationDeadline', date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.registrationDeadline && (
                <p className="text-sm text-destructive mt-1">
                  {errors.registrationDeadline.message}
                </p>
              )}
            </div>

            <div>
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('startDate') && 'text-muted-foreground',
                      errors.startDate && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('startDate') ? (
                      format(watch('startDate'), 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('startDate')}
                    onSelect={(date: Date | undefined) => setValue('startDate', date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.startDate && (
                <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
              )}
            </div>

            <div>
              <Label>End Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !watch('endDate') && 'text-muted-foreground',
                      errors.endDate && 'border-destructive'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watch('endDate') ? format(watch('endDate'), 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watch('endDate')}
                    onSelect={(date: Date | undefined) => setValue('endDate', date!)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.endDate && (
                <p className="text-sm text-destructive mt-1">{errors.endDate.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Categories *</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectiveEnhance('categories')}
              disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
            >
              {enhanceEventMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Suggest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {HACKATHON_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => handleCategoryToggle(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          {errors.categories && (
            <p className="text-sm text-destructive mt-2">{errors.categories.message}</p>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tags</CardTitle>
              <p className="text-sm text-muted-foreground">
                Search tags to help participants find your event
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectiveEnhance('tags')}
              disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
            >
              {enhanceEventMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Generate
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedTags.map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => handleTagRemove(index)}
              >
                {tag}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {selectedTags.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Add tags manually or use AI Enhancement to generate relevant tags
              </p>
            )}
          </div>

          {/* Manual tag input */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a tag (e.g., react, nodejs, beginner-friendly)"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  handleTagAdd(input.value);
                  input.value = '';
                }
              }}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={(e) => {
                const input = (e.target as HTMLElement).parentElement?.querySelector(
                  'input'
                ) as HTMLInputElement;
                if (input) {
                  handleTagAdd(input.value);
                  input.value = '';
                }
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Prizes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Prizes</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                appendPrize({
                  position: prizeFields.length + 1,
                  title: `${prizeFields.length + 1}${prizeFields.length === 0 ? 'st' : prizeFields.length === 1 ? 'nd' : prizeFields.length === 2 ? 'rd' : 'th'} Place`,
                  description: '',
                  value: '',
                })
              }
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Prize
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {prizeFields.map((field, index) => (
            <div key={field.id} className="flex gap-4 items-start">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input {...register(`prizes.${index}.title`)} placeholder="Prize title" />
                <Input
                  {...register(`prizes.${index}.description`)}
                  placeholder="Prize description"
                />
                <Input {...register(`prizes.${index}.value`)} placeholder="Value (optional)" />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => removePrize(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Rules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Rules & Guidelines *</CardTitle>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSelectiveEnhance('rules')}
              disabled={enhanceEventMutation.isPending || !watchedName || !watchedDescription}
            >
              {enhanceEventMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              AI Generate Rules
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            {...register('rules')}
            placeholder="Enter event rules and guidelines..."
            rows={6}
            className={errors.rules ? 'border-destructive' : ''}
          />
          {errors.rules && <p className="text-sm text-destructive mt-1">{errors.rules.message}</p>}
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic">Public Event</Label>
              <p className="text-sm text-muted-foreground">Make this event visible to everyone</p>
            </div>
            <Switch
              id="isPublic"
              checked={watch('isPublic')}
              onCheckedChange={async (checked: boolean) => {
                setValue('isPublic', checked);
                await trigger(); // Trigger validation for entire form
              }}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requiresApproval">Requires Approval</Label>
              <p className="text-sm text-muted-foreground">
                Manually approve participant registrations
              </p>
            </div>
            <Switch
              id="requiresApproval"
              checked={watch('requiresApproval')}
              onCheckedChange={async (checked: boolean) => {
                setValue('requiresApproval', checked);
                await trigger(); // Trigger validation for entire form
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={!isFormValid() || isLoading} className="flex-1">
          {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          {isEditing ? 'Update Event' : 'Create Event'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
};
