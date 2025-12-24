import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientContracts } from '@/hooks/useClientPortal';
import type { ClientContract, ContractStatus } from '@/types/client-portal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  FileCheck, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  PenTool,
  FileSignature
} from 'lucide-react';

interface ClientContractListProps {
  showHeader?: boolean;
  limit?: number;
}

export function ClientContractList({ showHeader = true, limit }: ClientContractListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useClientContracts({
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy,
    sortOrder,
    limit,
  });

  // Filter contracts by search term (client-side)
  const filteredContracts = data?.contracts.filter(contract =>
    contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contract.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <ContractListSkeleton showHeader={showHeader} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load contracts</h3>
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
            <FileCheck className="h-5 w-5" />
            Contracts ({data?.totalCount || 0})
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
                placeholder="Search contracts..."
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
              <SelectItem value="signed">Signed</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
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

        {/* Contracts Table */}
        {filteredContracts.length === 0 ? (
          <div className="text-center py-12">
            <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No contracts found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your contracts will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Contract</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timeline</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContracts.map((contract) => (
                  <ContractRow key={contract.id} contract={contract} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ContractRowProps {
  contract: ClientContract;
}

function ContractRow({ contract }: ContractRowProps) {
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="font-medium text-gray-900">{contract.title}</div>
          <div className="text-sm text-gray-600 truncate max-w-xs">
            {contract.description}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-gray-600" />
          </div>
          <div>
            <div className="font-medium text-gray-900">{contract.freelancerName}</div>
            <div className="text-sm text-gray-600">{contract.freelancerEmail}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {formatCurrency(contract.amount, contract.currency)}
        </div>
      </TableCell>
      
      <TableCell>
        <ContractStatusBadge status={contract.status} />
      </TableCell>
      
      <TableCell>
        <div className="text-sm space-y-1">
          <div className="flex items-center gap-1 text-gray-600">
            <Calendar className="h-3 w-3" />
            Start: {formatDate(contract.startDate)}
          </div>
          {contract.endDate && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-3 w-3" />
              End: {formatDate(contract.endDate)}
            </div>
          )}
          {contract.signedAt && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <FileSignature className="h-3 w-3" />
              Signed {formatDate(contract.signedAt)}
            </div>
          )}
          {contract.completedAt && (
            <div className="flex items-center gap-1 text-xs text-blue-600">
              <CheckCircle className="h-3 w-3" />
              Completed {formatDate(contract.completedAt)}
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
          
          {contract.status === 'sent' && (
            <Button size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700">
              <PenTool className="h-4 w-4 mr-1" />
              Sign
            </Button>
          )}
          
          {contract.status === 'signed' && !contract.completedAt && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              In Progress
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const statusConfig = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: FileCheck },
    sent: { label: 'Awaiting Signature', className: 'bg-orange-100 text-orange-800', icon: Clock },
    signed: { label: 'Active', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle },
    cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
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

function ContractListSkeleton({ showHeader }: { showHeader: boolean }) {
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