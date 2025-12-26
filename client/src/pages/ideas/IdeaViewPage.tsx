import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { IdeaDetails } from '../../components/ideas/IdeaDetails';
import { useIdea, useDeleteIdea } from '../../hooks/useIdeas';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import type { Idea } from '../../types/idea';

export const IdeaViewPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const deleteIdea = useDeleteIdea();
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();

  const { data: idea, isLoading, error } = useIdea(id);

  const handleEdit = (idea: Idea) => {
    navigate(`/ideas/${idea.id}/edit`);
  };

  const handleDelete = async (idea: Idea) => {
    const confirmed = await showConfirm({
      title: 'Delete Idea',
      message: `Are you sure you want to delete "${idea.title}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      deleteIdea.mutate(idea.id, {
        onSuccess: () => {
          navigate('/ideas');
        },
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span className="ml-2">Loading idea...</span>
        </div>
      </div>
    );
  }

  if (error || !idea) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error ? 'Failed to load idea' : 'Idea not found'}</p>
          <Button onClick={() => navigate('/ideas')} variant="outline">
            Back to Ideas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/ideas')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Ideas
          </Button>
        </div>

        {/* Idea Details */}
        <IdeaDetails idea={idea} onEdit={handleEdit} onDelete={handleDelete} showActions={true} />
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={hideConfirm}
        onConfirm={dialogState.onConfirm || (() => {})}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        confirmVariant={dialogState.variant}
        isLoading={deleteIdea.isPending}
      />
    </>
  );
};
