import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateContract, useUpdateContract } from '@/hooks/useContracts';
import type {
  Contract,
  ContractFormData,
  CreateContractRequest,
  UpdateContractRequest,
} from '@/types/contract';
import { Plus, Trash2, Save, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface ContractFormProps {
  contract?: Contract;
  mode: 'create' | 'edit';
  proposalId?: string;
}

const currencies = [
  { value: 'USD', label: 'USD ($)' },
  { value: 'EUR', label: 'EUR (€)' },
  { value: 'GBP', label: 'GBP (£)' },
  { value: 'INR', label: 'INR (₹)' },
];

export function ContractForm({ contract, mode, proposalId }: ContractFormProps) {
  const navigate = useNavigate();
  const createContractMutation = useCreateContract();
  const updateContractMutation = useUpdateContract();

  const [formData, setFormData] = useState<ContractFormData>({
    title: contract?.title || '',
    content: contract?.content || '',
    clientId: contract?.clientId || '',
    clientEmail: contract?.clientEmail || '',
    amount: contract?.amount?.toString() || '',
    currency: contract?.currency || 'USD',
    deliverables: contract?.deliverables || [''],
    timeline: contract?.timeline || '',
    terms: contract?.terms || '',
  });

  const [errors, setErrors] = useState<Partial<ContractFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<ContractFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Contract content is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Client email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }

    if (!formData.amount.trim()) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(Number(formData.amount)) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount';
    }

    if (!formData.timeline.trim()) {
      newErrors.timeline = 'Timeline is required';
    }

    const validDeliverables = formData.deliverables.filter((d) => d.trim());
    if (validDeliverables.length === 0) {
      newErrors.deliverables = ['At least one deliverable is required'];
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const validDeliverables = formData.deliverables.filter((d) => d.trim());

    try {
      if (mode === 'create') {
        const createData: CreateContractRequest = {
          proposalId,
          title: formData.title.trim(),
          content: formData.content.trim(),
          clientId: formData.clientId.trim() || formData.clientEmail.trim(), // Use email as ID if no ID provided
          clientEmail: formData.clientEmail.trim(),
          amount: Number(formData.amount),
          currency: formData.currency,
          deliverables: validDeliverables,
          timeline: formData.timeline.trim(),
          terms: formData.terms.trim(),
        };

        await createContractMutation.mutateAsync(createData);
        toast.success('Contract created successfully!');
        navigate('/contracts');
      } else if (contract) {
        const updateData: UpdateContractRequest = {
          title: formData.title.trim(),
          content: formData.content.trim(),
          amount: Number(formData.amount),
          currency: formData.currency,
          deliverables: validDeliverables,
          timeline: formData.timeline.trim(),
          terms: formData.terms.trim(),
        };

        await updateContractMutation.mutateAsync({
          contractId: contract.id,
          data: updateData,
        });
        toast.success('Contract updated successfully!');
        navigate(`/contracts/${contract.id}`);
      }
    } catch (error) {
      toast.error(`Failed to ${mode} contract`);
    }
  };

  const addDeliverable = () => {
    setFormData((prev) => ({
      ...prev,
      deliverables: [...prev.deliverables, ''],
    }));
  };

  const removeDeliverable = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index),
    }));
  };

  const updateDeliverable = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      deliverables: prev.deliverables.map((item, i) => (i === index ? value : item)),
    }));
  };

  const isLoading = createContractMutation.isPending || updateContractMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-6 w-6" />
            {mode === 'create' ? 'Create New Contract' : 'Edit Contract'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Contract Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Website Development Contract"
                  disabled={isLoading}
                />
                {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="clientEmail">Client Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={formData.clientEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, clientEmail: e.target.value }))
                  }
                  placeholder="client@example.com"
                  disabled={isLoading}
                />
                {errors.clientEmail && (
                  <p className="text-sm text-destructive">{errors.clientEmail}</p>
                )}
              </div>
            </div>

            {/* Amount and Currency */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="amount">Contract Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData((prev) => ({ ...prev, amount: e.target.value }))}
                  placeholder="0.00"
                  disabled={isLoading}
                />
                {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, currency: value }))}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencies.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label htmlFor="timeline">Project Timeline *</Label>
              <Input
                id="timeline"
                value={formData.timeline}
                onChange={(e) => setFormData((prev) => ({ ...prev, timeline: e.target.value }))}
                placeholder="e.g., 4-6 weeks, By March 15th, 2024"
                disabled={isLoading}
              />
              {errors.timeline && <p className="text-sm text-destructive">{errors.timeline}</p>}
            </div>

            {/* Contract Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Contract Terms & Conditions *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData((prev) => ({ ...prev, content: e.target.value }))}
                placeholder="Describe the work to be performed, payment terms, responsibilities, etc."
                rows={8}
                disabled={isLoading}
              />
              {errors.content && <p className="text-sm text-destructive">{errors.content}</p>}
            </div>

            {/* Deliverables */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Deliverables *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addDeliverable}
                  disabled={isLoading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Deliverable
                </Button>
              </div>
              <div className="space-y-2">
                {formData.deliverables.map((deliverable, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={deliverable}
                      onChange={(e) => updateDeliverable(index, e.target.value)}
                      placeholder={`Deliverable ${index + 1}`}
                      disabled={isLoading}
                    />
                    {formData.deliverables.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeDeliverable(index)}
                        disabled={isLoading}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              {errors.deliverables && (
                <p className="text-sm text-destructive">{errors.deliverables[0]}</p>
              )}
            </div>

            {/* Additional Terms */}
            <div className="space-y-2">
              <Label htmlFor="terms">Additional Terms & Conditions</Label>
              <Textarea
                id="terms"
                value={formData.terms}
                onChange={(e) => setFormData((prev) => ({ ...prev, terms: e.target.value }))}
                placeholder="Any additional terms, conditions, or notes..."
                rows={4}
                disabled={isLoading}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/contracts')}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {mode === 'create' ? 'Creating...' : 'Updating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {mode === 'create' ? 'Create Contract' : 'Update Contract'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
