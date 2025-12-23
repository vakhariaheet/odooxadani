import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, X, Save, Send } from 'lucide-react';
import type { Proposal, ProposalFormData } from '../../types/proposal';
import { CURRENCY_OPTIONS, ProposalStatus } from '../../types/proposal';

interface ProposalFormProps {
  proposal?: Proposal;
  onSubmit: (data: ProposalFormData) => void;
  onSend?: (data: ProposalFormData) => void;
  loading?: boolean;
  mode: 'create' | 'edit';
}

export function ProposalForm({
  proposal,
  onSubmit,
  onSend,
  loading = false,
  mode,
}: ProposalFormProps) {
  const [deliverable, setDeliverable] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>(proposal?.deliverables || []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<Omit<ProposalFormData, 'deliverables'>>({
    defaultValues: {
      title: proposal?.title || '',
      description: proposal?.description || '',
      clientEmail: proposal?.clientEmail || '',
      amount: proposal?.amount?.toString() || '',
      currency: proposal?.currency || 'USD',
      timeline: proposal?.timeline || '',
      terms: proposal?.terms || '',
    },
    mode: 'onChange',
  });

  const handleAddDeliverable = () => {
    if (deliverable.trim()) {
      setDeliverables([...deliverables, deliverable.trim()]);
      setDeliverable('');
    }
  };

  const handleRemoveDeliverable = (index: number) => {
    setDeliverables(deliverables.filter((_, i) => i !== index));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddDeliverable();
    }
  };

  const handleFormSubmit = (data: Omit<ProposalFormData, 'deliverables'>) => {
    const formData: ProposalFormData = {
      ...data,
      deliverables,
    };
    onSubmit(formData);
  };

  const handleSendSubmit = (data: Omit<ProposalFormData, 'deliverables'>) => {
    const formData: ProposalFormData = {
      ...data,
      deliverables,
    };
    onSend!(formData);
  };

  const canSend = mode === 'edit' && proposal?.status === ProposalStatus.DRAFT && onSend;

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{mode === 'create' ? 'Create New Proposal' : 'Edit Proposal'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
              placeholder="Enter proposal title"
              className={errors.title ? 'border-destructive' : ''}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
          </div>

          {/* Client Email */}
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Client Email *</Label>
            <Input
              id="clientEmail"
              type="email"
              {...register('clientEmail', {
                required: 'Client email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter a valid email address',
                },
              })}
              placeholder="client@example.com"
              className={errors.clientEmail ? 'border-destructive' : ''}
            />
            {errors.clientEmail && (
              <p className="text-sm text-destructive">{errors.clientEmail.message}</p>
            )}
          </div>

          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                {...register('amount', {
                  required: 'Amount is required',
                  min: { value: 0.01, message: 'Amount must be greater than 0' },
                })}
                placeholder="0.00"
                className={errors.amount ? 'border-destructive' : ''}
              />
              {errors.amount && <p className="text-sm text-destructive">{errors.amount.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={watch('currency')}
                onValueChange={(value) => setValue('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <Label htmlFor="timeline">Timeline *</Label>
            <Input
              id="timeline"
              {...register('timeline', { required: 'Timeline is required' })}
              placeholder="e.g., 2-3 weeks, 1 month"
              className={errors.timeline ? 'border-destructive' : ''}
            />
            {errors.timeline && (
              <p className="text-sm text-destructive">{errors.timeline.message}</p>
            )}
          </div>

          {/* Deliverables */}
          <div className="space-y-2">
            <Label>Deliverables *</Label>
            <div className="flex gap-2">
              <Input
                value={deliverable}
                onChange={(e) => setDeliverable(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a deliverable"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleAddDeliverable}
                disabled={!deliverable.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {deliverables.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {deliverables.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => handleRemoveDeliverable(index)}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            )}

            {deliverables.length === 0 && (
              <p className="text-sm text-destructive">At least one deliverable is required</p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Describe the project in detail..."
              rows={6}
              className={errors.description ? 'border-destructive' : ''}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="space-y-2">
            <Label htmlFor="terms">Terms & Conditions *</Label>
            <Textarea
              id="terms"
              {...register('terms', { required: 'Terms are required' })}
              placeholder="Payment terms, revision policy, etc."
              rows={4}
              className={errors.terms ? 'border-destructive' : ''}
            />
            {errors.terms && <p className="text-sm text-destructive">{errors.terms.message}</p>}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={loading || !isValid || deliverables.length === 0}
              className="flex-1"
            >
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Create Proposal' : 'Save Changes'}
            </Button>

            {canSend && (
              <Button
                type="button"
                variant="default"
                disabled={loading || !isValid || deliverables.length === 0}
                onClick={handleSubmit(handleSendSubmit)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4 mr-2" />
                Save & Send
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
