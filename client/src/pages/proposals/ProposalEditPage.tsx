import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProposalForm } from '../../components/proposals/ProposalForm';
import { useProposal, useUpdateProposal, useSendProposal } from '../../hooks/useProposals';
import type { ProposalFormData } from '../../types/proposal';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

export function ProposalEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useProposal(id!);
  const updateProposal = useUpdateProposal();
  const sendProposal = useSendProposal();

  const proposal = data?.data?.proposal;

  const handleSubmit = async (data: ProposalFormData) => {
    if (!proposal) return;

    try {
      await updateProposal.mutateAsync({
        proposalId: proposal.id,
        data: {
          title: data.title,
          description: data.description,
          clientEmail: data.clientEmail,
          amount: parseFloat(data.amount),
          currency: data.currency,
          deliverables: data.deliverables,
          timeline: data.timeline,
          terms: data.terms,
        },
      });

      toast.success('Proposal updated successfully');
      navigate(`/proposals/${proposal.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update proposal');
    }
  };

  const handleSend = async (data: ProposalFormData) => {
    if (!proposal) return;

    try {
      // First update the proposal
      await updateProposal.mutateAsync({
        proposalId: proposal.id,
        data: {
          title: data.title,
          description: data.description,
          clientEmail: data.clientEmail,
          amount: parseFloat(data.amount),
          currency: data.currency,
          deliverables: data.deliverables,
          timeline: data.timeline,
          terms: data.terms,
        },
      });

      // Then send it
      await sendProposal.mutateAsync(proposal.id);

      toast.success('Proposal updated and sent to client successfully');
      navigate(`/proposals/${proposal.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to update and send proposal');
    }
  };

  const handleBack = () => {
    navigate(`/proposals/${id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading proposal...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">
            {error ? 'Error Loading Proposal' : 'Proposal Not Found'}
          </h1>
          <p className="text-muted-foreground mb-4">
            {error?.message ||
              'The proposal you are looking for does not exist or you do not have permission to edit it.'}
          </p>
          <Button onClick={() => navigate('/proposals')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Proposals
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Proposal
        </Button>
      </div>

      <ProposalForm
        mode="edit"
        proposal={proposal}
        onSubmit={handleSubmit}
        onSend={handleSend}
        loading={updateProposal.isPending || sendProposal.isPending}
      />
    </div>
  );
}
