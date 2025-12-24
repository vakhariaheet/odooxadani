import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientProposals } from '@/hooks/useClientPortal';
import type { ClientProposal, ProposalStatus } from '@/types/client-portal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  FileText, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar
} from 'lucide-react';

interface ClientProposalListProps {
  showHeader?: boolean;
  limit?: number;
}

export function ClientProposalList({ showHeader = true, limit }: ClientProposalListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useClientProposals({
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy,
    sortOrder,
    limit,
  });

  // Filter proposals by search term (client-side)
  const filteredProposals = data?.proposals.filter(proposal =>
    proposal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proposal.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <ProposalListSkeleton showHeader={showHeader} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load proposals</h3>
            <p className="text-gray-600">Please try refreshing the page</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Proposals ({data?.totalCount || 0})
          </CardTitle>
        </CardHeader>
      )}
      
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search proposals..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="viewed">Viewed</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
            const [field, order] = value.split('-');
            setSortBy(field as typeof sortBy);
            setSortOrder(order as typeof sortOrder);
          }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="createdAt-desc">Newest First</SelectItem>
              <SelectItem value="createdAt-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
              <SelectItem value="updatedAt-desc">Recently Updated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Proposals Table */}
        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No proposals found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Proposals sent to you will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proposal</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProposals.map((proposal) => (
                  <ProposalRow key={proposal.id} proposal={proposal} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ProposalRowProps {
  proposal: ClientProposal;
}

function ProposalRow({ proposal }: ProposalRowProps) {
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{proposal.title}</div>
          <div className="text-sm text-gray-600 truncate max-w-xs">
            {proposal.description}
          </div>
          {proposal.expiresAt && (
            <div className="flex items-center gap-1 text-xs text-orange-600 mt-1">
              <Clock className="h-3 w-3" />
              Expires {formatDate(proposal.expiresAt)}
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{proposal.freelancerName}</div>
            <div className="text-sm text-gray-600">{proposal.freelancerEmail}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {formatCurrency(proposal.amount, proposal.currency)}
        </div>
      </TableCell>
      
      <TableCell>
        <ProposalStatusBadge status={proposal.status} />
      </TableCell>
      
      <TableCell>
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-3 w-3" />
            {formatDate(proposal.createdAt)}
          </div>
          {proposal.viewedAt && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Eye className="h-3 w-3" />
              Viewed {formatDate(proposal.viewedAt)}
            </div>
          )}
        </div>
      </TableCell>
      
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Button size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            View
          </Button>
          
          {proposal.status === 'sent' || proposal.status === 'viewed' ? (
            <div className="flex gap-1">
              <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                <CheckCircle className="h-4 w-4 mr-1" />
                Accept
              </Button>
              <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </div>
          ) : null}
        </div>
      </TableCell>
    </TableRow>
  );
}

function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const statusConfig = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileText },
    sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800', icon: Clock },
    viewed: { label: 'Viewed', className: 'bg-orange-100 text-orange-800', icon: Eye },
    accepted: { label: 'Accepted', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800', icon: XCircle },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge className={config.className}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}

function ProposalListSkeleton({ showHeader }: { showHeader: boolean }) {
  return (
    <Card>
      {showHeader && (
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
      )}
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-48" />
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-8 w-24" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}