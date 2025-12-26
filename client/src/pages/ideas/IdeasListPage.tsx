import { useNavigate } from 'react-router-dom';
import { IdeaList } from '../../components/ideas/IdeaList';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useDeleteIdea } from '../../hooks/useIdeas';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import type { Idea } from '../../types/idea';

export const IdeasListPage = () => {
  const navigate = useNavigate();
  const deleteIdea = useDeleteIdea();
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();

  const handleCreateNew = () => {
    navigate('/ideas/new');
  };

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
      deleteIdea.mutate(idea.id);
    }
  };

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <IdeaList
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showActions={true}
          showCreateButton={true}
        />
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
