import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { useCreateProposal, useSendProposal } from '../../hooks/useProposals';
import type { ProposalFormData } from '../../types/proposal';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ProposalCreatePage() {
  const navigate = useNavigate();
  const createProposal = useCreateProposal();
  const sendProposal = useSendProposal();

  const handleSubmit = async (data: ProposalFormData) => {
    try {
      const response = await createProposal.mutateAsync({
        title: data.title,
        description: data.description,
        clientEmail: data.clientEmail,
        amount: parseFloat(data.amount),
        currency: data.currency,
        deliverables: data.deliverables,
        timeline: data.timeline,
        terms: data.terms,
      });

      toast.success('Proposal created successfully');
      navigate(`/proposals/${response.data.proposal.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create proposal');
    }
  };

  const handleSend = async (data: ProposalFormData) => {
    try {
      // First create the proposal
      const response = await createProposal.mutateAsync({
        title: data.title,
        description: data.description,
        clientEmail: data.clientEmail,
        amount: parseFloat(data.amount),
        currency: data.currency,
        deliverables: data.deliverables,
        timeline: data.timeline,
        terms: data.terms,
      });

      // Then send it
      await sendProposal.mutateAsync(response.data.proposal.id);

      toast.success('Proposal created and sent to client successfully');
      navigate(`/proposals/${response.data.proposal.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create and send proposal');
    }
  };

  const handleBack = () => {
    navigate('/proposals');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proposals
        </Button>
      </div>

      <ProposalForm
        mode="create"
        onSubmit={handleSubmit}
        onSend={handleSend}
        loading={createProposal.isPending || sendProposal.isPending}
      />
    </div>
  );
}
