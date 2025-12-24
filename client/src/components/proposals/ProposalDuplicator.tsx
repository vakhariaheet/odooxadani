import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { proposalsApi } from '@/services/proposalsApi';
import { Copy, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface ProposalDuplicatorProps {
  proposalId: string;
  proposalTitle: string;
}

export const ProposalDuplicator: React.FC<ProposalDuplicatorProps> = ({
  proposalId,
  proposalTitle,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const duplicateMutation = useMutation({
    mutationFn: () => proposalsApi.duplicate(proposalId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
      setIsOpen(false);
      toast.success('Proposal duplicated successfully!');

      // Navigate to the new proposal
      if (data.proposal?.id) {
        navigate(`/proposals/${data.proposal.id}/edit`);
      }
    },
    onError: (error) => {
      console.error('Failed to duplicate proposal:', error);
      toast.error('Failed to duplicate proposal. Please try again.');
    },
  });

  const handleDuplicate = () => {
    duplicateMutation.mutate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Copy className="h-4 w-4" />
          <span>Duplicate</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Copy className="h-5 w-5" />
            <span>Duplicate Proposal</span>
          </DialogTitle>
          <DialogDescription>
            Create a copy of "{proposalTitle}" that you can modify and send to a new client.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900">What will be copied:</p>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Title (with "Copy" suffix)</li>
                  <li>• Description and content</li>
                  <li>• Deliverables list</li>
                  <li>• Timeline and terms</li>
                  <li>• Amount and currency</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Copy className="h-5 w-5 text-gray-600 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-900">What will be reset:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Status (set to Draft)</li>
                  <li>• Client email (you'll need to update)</li>
                  <li>• Analytics and view history</li>
                  <li>• Comments and version history</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleDuplicate}
            disabled={duplicateMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>{duplicateMutation.isPending ? 'Duplicating...' : 'Duplicate Proposal'}</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
