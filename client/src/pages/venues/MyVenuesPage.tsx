import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Building2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { ConfirmDialog } from '../../components/ui/confirm-dialog';
import { VenueList } from '../../components/venues/VenueList';
import { useMyVenues, useDeleteVenue } from '../../hooks/useVenues';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { usePermissions } from '../../hooks/usePermissions';
import { useWishlist } from '../../hooks/useWishlist';
import { toast } from 'sonner';
import type { Venue } from '../../types/venue';

export function MyVenuesPage() {
  const navigate = useNavigate();
  const { data: venuesResponse, isLoading } = useMyVenues();
  const deleteVenueMutation = useDeleteVenue();
  const { dialogState, showConfirm: showConfirmDialog, hideConfirm, handleConfirm } = useConfirmDialog();
  const { canCreateVenues, canEditVenues, canDeleteVenues, getCurrentUserId } = usePermissions();
  const { validateWishlistItems, getWishlistCount } = useWishlist();

  const venues = venuesResponse?.data?.venues || [];
  const totalCount = venuesResponse?.data?.totalCount || 0;

  useEffect(() => {
    document.title = 'My Venues - Odoo Xadani';
  }, []);

  // Validate wishlist items when owner venues are loaded
  useEffect(() => {
    if (!isLoading && venues.length > 0 && getWishlistCount() > 0) {
      const availableVenueIds = venues.map(venue => venue.venueId);
      validateWishlistItems(availableVenueIds);
    }
  }, [isLoading, venues, validateWishlistItems, getWishlistCount]);

  const handleCreateVenue = () => {
    if (canCreateVenues()) {
      navigate('/dashboard/venues/create');
    } else {
      toast.error('You do not have permission to create venues');
    }
  };

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
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Venues</h1>
            <p className="text-muted-foreground">
              Manage your venues and track their performance
            </p>
          </div>
          {canCreateVenues() && (
            <Button onClick={handleCreateVenue} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add New Venue
            </Button>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{totalCount}</p>
                  <p className="text-sm text-muted-foreground">Total Venues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {venues.filter(v => v.status === 'active').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Active Venues</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Venues List */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted rounded-t-lg" />
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-full" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : totalCount === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No venues yet</h3>
              <p className="text-muted-foreground mb-6">
                Get started by creating your first venue listing.
              </p>
              {canCreateVenues() && (
                <Button onClick={handleCreateVenue} className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Create Your First Venue
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <VenueList
            showOwnerActions={true}
            onEditVenue={handleEditVenue}
            onDeleteVenue={handleDeleteVenue}
          />
        )}

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