import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { X, Plus, Eye } from 'lucide-react';
import type { Template, CreateTemplateRequest, UpdateTemplateRequest } from '../../types/template';
import { TemplateCategory, TEMPLATE_CATEGORY_LABELS, extractVariables } from '../../types/template';

interface TemplateFormProps {
  template?: Template;
  onSubmit: (data: CreateTemplateRequest | UpdateTemplateRequest) => Promise<void>;
  onCancel?: () => void;
  onPreview?: (content: string, variables: string[]) => void;
  loading?: boolean;
  mode?: 'create' | 'edit';
}

interface FormData {
  name: string;
  description: string;
  content: string;
  category: TemplateCategory;
  isPublic: boolean;
  tags: string[];
}

export function TemplateForm({
  template,
  onSubmit,
  onCancel,
  onPreview,
  loading = false,
  mode = 'create',
}: TemplateFormProps) {
  const [newTag, setNewTag] = useState('');
  const [detectedVariables, setDetectedVariables] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<FormData>({
    defaultValues: {
      name: template?.name || '',
      description: template?.description || '',
      content: template?.content || '',
      category: template?.category || TemplateCategory.OTHER,
      isPublic: template?.isPublic || false,
      tags: template?.tags || [],
    },
  });

  const watchedContent = watch('content');
  const watchedTags = watch('tags');

  // Extract variables from content
  useEffect(() => {
    if (watchedContent) {
      const variables = extractVariables(watchedContent);
      setDetectedVariables(variables);
    }
  }, [watchedContent]);

  const handleAddTag = () => {
    if (newTag.trim() && !watchedTags.includes(newTag.trim())) {
      const updatedTags = [...watchedTags, newTag.trim()];
      setValue('tags', updatedTags);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = watchedTags.filter((tag) => tag !== tagToRemove);
    setValue('tags', updatedTags);
  };

  const handleFormSubmit = async (data: FormData) => {
    const submitData = {
      ...data,
      variables: detectedVariables,
    };
    await onSubmit(submitData);
  };

  const handlePreview = () => {
    if (onPreview && watchedContent) {
      onPreview(watchedContent, detectedVariables);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">
          {mode === 'create' ? 'Create Template' : 'Edit Template'}
        </h2>
        <div className="flex gap-2">
          {onPreview && (
            <Button
              type="button"
              variant="outline"
              onClick={handlePreview}
              disabled={!watchedContent}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
          )}
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Name */}
          <div>
            <Label htmlFor="name">Template Name *</Label>
            <Input
              id="name"
              {...register('name', { required: 'Template name is required' })}
              placeholder="e.g., Web Development Proposal"
            />
            {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Brief description of what this template is for..."
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <Label htmlFor="content">Template Content *</Label>
            <Textarea
              id="content"
              {...register('content', { required: 'Template content is required' })}
              placeholder="Write your template content here. Use {{variable_name}} for dynamic content..."
              rows={15}
              className="font-mono text-sm"
            />
            {errors.content && (
              <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Use double curly braces for variables: {`{{client_name}}`}, {`{{project_budget}}`},
              etc.
            </p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Category */}
          <div>
            <Label htmlFor="category">Category *</Label>
            <Select
              value={watch('category')}
              onValueChange={(value) => setValue('category', value as TemplateCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(TEMPLATE_CATEGORY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Public Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="isPublic">Make Public</Label>
              <p className="text-xs text-muted-foreground">
                Allow other users to discover and use this template
              </p>
            </div>
            <Switch
              id="isPublic"
              checked={watch('isPublic')}
              onCheckedChange={(checked: boolean) => setValue('isPublic', checked)}
            />
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
              />
              <Button type="button" size="sm" onClick={handleAddTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {watchedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Detected Variables */}
          {detectedVariables.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Detected Variables</CardTitle>
                <CardDescription className="text-xs">
                  Variables found in your template content
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-wrap gap-1">
                  {detectedVariables.map((variable) => (
                    <Badge key={variable} variant="outline" className="text-xs">
                      {variable}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={!isValid || loading}>
          {loading ? 'Saving...' : mode === 'create' ? 'Create Template' : 'Update Template'}
        </Button>
      </div>
    </form>
  );
}
