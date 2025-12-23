import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProposalDetails } from '../../components/proposals/ProposalDetails';
import {
  useProposal,
  useDeleteProposal,
  useSendProposal,
  useAcceptProposal,
  useRejectProposal,
} from '../../hooks/useProposals';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export function ProposalViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;

  const { data, isLoading, error } = useProposal(id!);
  const deleteProposal = useDeleteProposal();
  const sendProposal = useSendProposal();
  const acceptProposal = useAcceptProposal();
  const rejectProposal = useRejectProposal();

  const proposal = data?.data?.proposal;

  const handleEdit = () => {
    navigate(`/proposals/${id}/edit`);
  };

  const handleDelete = async () => {
    if (!proposal || !confirm('Are you sure you want to delete this proposal?')) {
      return;
    }

    try {
      await deleteProposal.mutateAsync(proposal.id);
      toast.success('Proposal deleted successfully');
      navigate('/proposals');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete proposal');
    }
  };

  const handleSend = async () => {
    if (!proposal || !confirm('Are you sure you want to send this proposal to the client?')) {
      return;
    }

    try {
      await sendProposal.mutateAsync(proposal.id);
      toast.success('Proposal sent to client successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send proposal');
    }
  };

  const handleAccept = async () => {
    if (!proposal || !confirm('Are you sure you want to accept this proposal?')) {
      return;
    }

    try {
      await acceptProposal.mutateAsync(proposal.id);
      toast.success('Proposal accepted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept proposal');
    }
  };

  const handleReject = async () => {
    if (!proposal || !confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      await rejectProposal.mutateAsync(proposal.id);
      toast.success('Proposal rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject proposal');
    }
  };

  const handleBack = () => {
    navigate('/proposals');
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
              'The proposal you are looking for does not exist or you do not have permission to view it.'}
          </p>
          <Button onClick={handleBack}>
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
          Back to Proposals
        </Button>
      </div>

      <ProposalDetails
        proposal={proposal}
        onEdit={userRole === 'freelancer' ? handleEdit : undefined}
        onDelete={userRole === 'freelancer' ? handleDelete : undefined}
        onSend={userRole === 'freelancer' ? handleSend : undefined}
        onAccept={userRole === 'client' ? handleAccept : undefined}
        onReject={userRole === 'client' ? handleReject : undefined}
        loading={
          deleteProposal.isPending ||
          sendProposal.isPending ||
          acceptProposal.isPending ||
          rejectProposal.isPending
        }
      />
    </div>
  );
}
