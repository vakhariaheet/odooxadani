import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import type { Proposal } from '../../types/proposal';
import { ProposalStatus } from '../../types/proposal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Eye, Edit, Trash2, Send, Check, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface ProposalCardProps {
  proposal: Proposal;
  onView: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSend?: (id: string) => void;
  onAccept?: (id: string) => void;
  onReject?: (id: string) => void;
  loading?: boolean;
}

export function ProposalCard({
  proposal,
  onView,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  loading = false,
}: ProposalCardProps) {
  const { user } = useUser();
  const userRole = user?.publicMetadata?.role as string;
  const isFreelancer = userRole === 'freelancer';
  const isClient = userRole === 'client';
  const isOwner = isFreelancer && proposal.freelancerId === user?.id;

  const canEdit = isOwner && proposal.status === ProposalStatus.DRAFT;
  const canDelete = isOwner && proposal.status !== ProposalStatus.ACCEPTED;
  const canSend = isOwner && proposal.status === ProposalStatus.DRAFT;
  const canRespond =
    isClient &&
    (proposal.status === ProposalStatus.SENT || proposal.status === ProposalStatus.VIEWED);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg line-clamp-2">{proposal.title}</CardTitle>
          <ProposalStatusBadge status={proposal.status} />
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatCurrency(proposal.amount, proposal.currency)}</span>
          <span>•</span>
          <span>{formatDate(proposal.createdAt)}</span>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Client</p>
            <p className="text-sm">{proposal.clientEmail}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Timeline</p>
            <p className="text-sm">{proposal.timeline}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Deliverables</p>
            <div className="flex flex-wrap gap-1">
              {proposal.deliverables.slice(0, 3).map((deliverable, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {deliverable}
                </Badge>
              ))}
              {proposal.deliverables.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{proposal.deliverables.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          <div className="text-sm text-muted-foreground line-clamp-2">
            {proposal.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 border-t">
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onView(proposal.id)}
            disabled={loading}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-1" />
            View
          </Button>

          {canEdit && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(proposal.id)}
              disabled={loading}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}

          {canSend && onSend && (
            <Button
              variant="default"
              size="sm"
              onClick={() => onSend(proposal.id)}
              disabled={loading}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}

          {canRespond && onAccept && onReject && (
            <>
              <Button
                variant="default"
                size="sm"
                onClick={() => onAccept(proposal.id)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onReject(proposal.id)}
                disabled={loading}
              >
                <X className="w-4 h-4" />
              </Button>
            </>
          )}

          {canDelete && onDelete && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(proposal.id)}
              disabled={loading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
