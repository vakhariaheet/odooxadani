import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { VenueList } from '../../components/venues/VenueList';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { useDeleteVenue } from '../../hooks/useVenues';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { usePermissions } from '../../hooks/usePermissions';
import { toast } from 'sonner';
import type { Venue } from '../../types/venue';

export function VenuesPage() {
  const navigate = useNavigate();
  const deleteVenueMutation = useDeleteVenue();
  const { dialogState, showConfirm: showConfirmDialog, hideConfirm, handleConfirm } = useConfirmDialog();
  const { canEditVenues, canDeleteVenues, getCurrentUserId } = usePermissions();

  useEffect(() => {
    document.title = 'Find Venues - Odoo Xadani';
  }, []);

  const handleEditVenue = (venue: Venue) => {
    const currentUserId = getCurrentUserId();
    const isOwner = Boolean(currentUserId && venue.ownerId === currentUserId);
    
    if (canEditVenues(isOwner)) {
      navigate(`/dashboard/venues/${venue.venueId}/edit`);
    } else {
      toast.error('You do not have permission to edit this venue');
    }
  };

  const handleDeleteVenue = async (venue: Venue) => {
    const currentUserId = getCurrentUserId();
    const isOwner = Boolean(currentUserId && venue.ownerId === currentUserId);
    
    if (!canDeleteVenues(isOwner)) {
      toast.error('You do not have permission to delete this venue');
      return;
    }

    const confirmed = await showConfirmDialog({
      title: 'Delete Venue',
      message: `Are you sure you want to delete "${venue.name}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger',
    });

    if (confirmed) {
      try {
        await deleteVenueMutation.mutateAsync(venue.venueId);
        toast.success('Venue deleted successfully');
      } catch {
        toast.error('Failed to delete venue. Please try again.');
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Find the Perfect Venue</h1>
        <p className="text-muted-foreground text-lg">
          Discover amazing spaces for your events. From intimate gatherings to large celebrations.
        </p>
      </div>

      <VenueList 
        onEditVenue={handleEditVenue}
        onDeleteVenue={handleDeleteVenue}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        onClose={hideConfirm}
        onConfirm={handleConfirm}
        title={dialogState.title}
        message={dialogState.message}
        confirmText={dialogState.confirmText}
        cancelText={dialogState.cancelText}
        variant={dialogState.variant}
      />
    </div>
  );
}