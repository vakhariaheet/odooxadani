import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ProposalList } from '../../components/proposals/ProposalList';
import {
  useProposals,
  useDeleteProposal,
  useSendProposal,
  useAcceptProposal,
  useRejectProposal,
} from '../../hooks/useProposals';
import type { ListProposalsQuery } from '../../types/proposal';
import { useUser } from '@clerk/clerk-react';

const ITEMS_PER_PAGE = 12;

export function ProposalListPage() {
  const navigate = useNavigate();
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;
  const isFreelancer = userRole === 'freelancer';

  // Debug: Log the user role
  console.log('User role:', userRole, 'Is freelancer:', isFreelancer);
  console.log('User metadata:', user?.publicMetadata);

  const [query, setQuery] = useState<ListProposalsQuery>({
    limit: ITEMS_PER_PAGE,
    offset: 0,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const { data, isLoading, error } = useProposals(query);
  const deleteProposal = useDeleteProposal();
  const sendProposal = useSendProposal();
  const acceptProposal = useAcceptProposal();
  const rejectProposal = useRejectProposal();

  const proposals = data?.data?.proposals || [];
  const totalCount = data?.data?.totalCount || 0;
  const hasMore = data?.data?.hasMore || false;

  const handleQueryChange = (newQuery: ListProposalsQuery) => {
    setQuery(newQuery);
  };

  const handleLoadMore = () => {
    setQuery((prev) => ({
      ...prev,
      offset: (prev.offset || 0) + ITEMS_PER_PAGE,
    }));
  };

  const handleView = (id: string) => {
    navigate(`/proposals/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/proposals/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this proposal?')) {
      return;
    }

    try {
      await deleteProposal.mutateAsync(id);
      toast.success('Proposal deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete proposal');
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Are you sure you want to send this proposal to the client?')) {
      return;
    }

    try {
      await sendProposal.mutateAsync(id);
      toast.success('Proposal sent to client successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send proposal');
    }
  };

  const handleAccept = async (id: string) => {
    if (!confirm('Are you sure you want to accept this proposal?')) {
      return;
    }

    try {
      await acceptProposal.mutateAsync(id);
      toast.success('Proposal accepted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to accept proposal');
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm('Are you sure you want to reject this proposal?')) {
      return;
    }

    try {
      await rejectProposal.mutateAsync(id);
      toast.success('Proposal rejected');
    } catch (error: any) {
      toast.error(error.message || 'Failed to reject proposal');
    }
  };

  const handleCreateNew = () => {
    navigate('/proposals/new');
  };

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Error Loading Proposals</h1>
          <p className="text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ProposalList
        proposals={proposals}
        totalCount={totalCount}
        hasMore={hasMore}
        loading={isLoading}
        query={query}
        onQueryChange={handleQueryChange}
        onLoadMore={handleLoadMore}
        onView={handleView}
        onEdit={isFreelancer ? handleEdit : undefined}
        onDelete={isFreelancer ? handleDelete : undefined}
        onSend={isFreelancer ? handleSend : undefined}
        onAccept={userRole === 'client' ? handleAccept : undefined}
        onReject={userRole === 'client' ? handleReject : undefined}
        onCreateNew={isFreelancer ? handleCreateNew : undefined}
        showCreateButton={isFreelancer}
      />
    </div>
  );
}
