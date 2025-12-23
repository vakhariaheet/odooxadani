import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { ProposalStatusBadge } from './ProposalStatusBadge';
import type { Proposal } from '../../types/proposal';
import { ProposalStatus } from '../../types/proposal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Calendar,
  DollarSign,
  Mail,
  FileText,
  Clock,
  Eye,
} from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

interface ProposalDetailsProps {
  proposal: Proposal;
  onEdit?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
  onAccept?: () => void;
  onReject?: () => void;
  loading?: boolean;
}

export function ProposalDetails({
  proposal,
  onEdit,
  onDelete,
  onSend,
  onAccept,
  onReject,
  loading = false,
}: ProposalDetailsProps) {
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{proposal.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {formatDate(proposal.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  {formatCurrency(proposal.amount, proposal.currency)}
                </span>
              </div>
            </div>
            <ProposalStatusBadge status={proposal.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {proposal.clientEmail}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {proposal.timeline}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button variant="outline" size="sm" onClick={onEdit} disabled={loading}>
                  <Edit className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}

              {canSend && onSend && (
                <Button onClick={onSend} disabled={loading}>
                  <Send className="w-4 h-4 mr-1" />
                  Send to Client
                </Button>
              )}

              {canRespond && onAccept && onReject && (
                <>
                  <Button
                    onClick={onAccept}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    Accept
                  </Button>
                  <Button variant="destructive" onClick={onReject} disabled={loading}>
                    <X className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}

              {canDelete && onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onDelete}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Timeline */}
      {(proposal.viewedAt || proposal.respondedAt) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Timeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Created on {formatDate(proposal.createdAt)}</span>
              </div>

              {proposal.status !== ProposalStatus.DRAFT && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">
                    Sent to client on {formatDate(proposal.updatedAt)}
                  </span>
                </div>
              )}

              {proposal.viewedAt && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">
                    Viewed by client on {formatDate(proposal.viewedAt)}
                  </span>
                </div>
              )}

              {proposal.respondedAt && (
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      proposal.status === ProposalStatus.ACCEPTED ? 'bg-green-500' : 'bg-red-500'
                    }`}
                  ></div>
                  <span className="text-sm">
                    {proposal.status === ProposalStatus.ACCEPTED ? 'Accepted' : 'Rejected'} on{' '}
                    {formatDate(proposal.respondedAt)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Project Description
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: proposal.description }}
          />
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {proposal.deliverables.map((deliverable, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">{deliverable}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Terms & Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-wrap text-sm text-muted-foreground">{proposal.terms}</div>
        </CardContent>
      </Card>

      {/* Project Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Project Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {formatCurrency(proposal.amount, proposal.currency)}
              </div>
              <div className="text-sm text-muted-foreground">Total Value</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{proposal.timeline}</div>
              <div className="text-sm text-muted-foreground">Timeline</div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{proposal.deliverables.length}</div>
              <div className="text-sm text-muted-foreground">Deliverables</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
