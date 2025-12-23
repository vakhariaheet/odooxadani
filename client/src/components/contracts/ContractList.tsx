import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ContractStatusBadge } from './ContractStatusBadge';
import { useContracts } from '@/hooks/useContracts';
import { ContractStatus } from '@/types/contract';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { Eye, Plus, Send, FileText, Edit } from 'lucide-react';

interface ContractListProps {
  className?: string;
}

export function ContractList({ className }: ContractListProps) {
  const navigate = useNavigate();
  const { user } = useUser();
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all');

  const userRole = user?.publicMetadata?.role as string;
  const isFreelancer = userRole === 'freelancer';

  const { data, isLoading, error } = useContracts({
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  const contracts = data?.data?.contracts || [];

  const handleViewContract = (contractId: string) => {
    navigate(`/contracts/${contractId}`);
  };

  const handleCreateContract = () => {
    navigate('/contracts/create');
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-muted-foreground">Loading contracts...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Contracts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="text-destructive">Failed to load contracts</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contracts
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as ContractStatus | 'all')}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value={ContractStatus.DRAFT}>Draft</SelectItem>
                <SelectItem value={ContractStatus.SENT}>Sent</SelectItem>
                <SelectItem value={ContractStatus.SIGNED}>Signed</SelectItem>
                <SelectItem value={ContractStatus.COMPLETED}>Completed</SelectItem>
                <SelectItem value={ContractStatus.CANCELLED}>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {isFreelancer && (
              <Button onClick={handleCreateContract} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Contract
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No contracts found</h3>
            <p className="text-muted-foreground mb-4">
              {isFreelancer
                ? "You haven't created any contracts yet."
                : 'No contracts have been sent to you yet.'}
            </p>
            {isFreelancer && (
              <Button onClick={handleCreateContract}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Contract
              </Button>
            )}
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>{isFreelancer ? 'Client' : 'Freelancer'}</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map((contract) => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-medium">{contract.title}</div>
                        {contract.proposalId && (
                          <Badge variant="outline" className="text-xs mt-1">
                            From Proposal
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <ContractStatusBadge status={contract.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(contract.amount, contract.currency)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {isFreelancer ? contract.clientEmail : 'Freelancer'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(contract.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewContract(contract.id)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {isFreelancer && contract.status === ContractStatus.DRAFT && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/contracts/${contract.id}/edit`)}
                              title="Edit Contract"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/contracts/${contract.id}`)}
                              title="View & Send Contract"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
