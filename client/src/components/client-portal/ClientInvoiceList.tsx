import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useClientInvoices } from '@/hooks/useClientPortal';
import type { ClientInvoice, InvoiceStatus } from '@/types/client-portal';
import { formatCurrency, formatDate } from '@/utils/formatters';
import { 
  Receipt, 
  Search, 
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User,
  Calendar,
  CreditCard,
  AlertTriangle
} from 'lucide-react';

interface ClientInvoiceListProps {
  showHeader?: boolean;
  limit?: number;
}

export function ClientInvoiceList({ showHeader = true, limit }: ClientInvoiceListProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'createdAt' | 'updatedAt' | 'amount'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');

  const { data, isLoading, error } = useClientInvoices({
    status: statusFilter === 'all' ? undefined : statusFilter,
    sortBy,
    sortOrder,
    limit,
  });

  // Filter invoices by search term (client-side)
  const filteredInvoices = data?.invoices.filter(invoice =>
    invoice.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.freelancerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return <InvoiceListSkeleton showHeader={showHeader} />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load invoices</h3>
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
            <Receipt className="h-5 w-5" />
            Invoices ({data?.totalCount || 0})
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
                placeholder="Search invoices..."
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
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
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

        {/* Invoices Table */}
        {filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Your invoices will appear here'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Freelancer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <InvoiceRow key={invoice.id} invoice={invoice} />
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface InvoiceRowProps {
  invoice: ClientInvoice;
}

function InvoiceRow({ invoice }: InvoiceRowProps) {
  const isOverdue = invoice.status !== 'paid' && new Date(invoice.dueDate) < new Date();
  
  return (
    <TableRow className="hover:bg-gray-50">
      <TableCell>
        <div>
          <div className="flex items-center gap-2">
            <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
            {isOverdue && (
              <AlertTriangle className="h-4 w-4 text-red-500" />
            )}
          </div>
          <div className="text-sm font-medium text-gray-700">{invoice.title}</div>
          <div className="text-sm text-gray-600 truncate max-w-xs">
            {invoice.description}
          </div>
          {invoice.contractId && (
            <div className="text-xs text-blue-600 mt-1">
              Contract: {invoice.contractId}
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
            <div className="font-medium text-gray-900">{invoice.freelancerName}</div>
            <div className="text-sm text-gray-600">{invoice.freelancerEmail}</div>
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="font-medium">
          {formatCurrency(invoice.amount, invoice.currency)}
        </div>
      </TableCell>
      
      <TableCell>
        <InvoiceStatusBadge status={invoice.status} isOverdue={isOverdue} />
      </TableCell>
      
      <TableCell>
        <div className="text-sm space-y-1">
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600' : 'text-gray-600'}`}>
            <Calendar className="h-3 w-3" />
            {formatDate(invoice.dueDate)}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="h-3 w-3" />
            Created {formatDate(invoice.createdAt)}
          </div>
          {invoice.paidAt && (
            <div className="flex items-center gap-1 text-xs text-green-600">
              <CheckCircle className="h-3 w-3" />
              Paid {formatDate(invoice.paidAt)}
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
          
          {(invoice.status === 'sent' || invoice.status === 'viewed') && (
            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
              <CreditCard className="h-4 w-4 mr-1" />
              Pay Now
            </Button>
          )}
          
          {invoice.status === 'paid' && (
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Paid
            </Badge>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

function InvoiceStatusBadge({ status, isOverdue }: { status: InvoiceStatus; isOverdue: boolean }) {
  // Override status display if overdue
  if (isOverdue && (status === 'sent' || status === 'viewed')) {
    return (
      <Badge className="bg-red-100 text-red-800">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Overdue
      </Badge>
    );
  }

  const statusConfig = {
    draft: { label: 'Draft', className: 'bg-gray-100 text-gray-800', icon: Receipt },
    sent: { label: 'Sent', className: 'bg-blue-100 text-blue-800', icon: Clock },
    viewed: { label: 'Viewed', className: 'bg-orange-100 text-orange-800', icon: Eye },
    paid: { label: 'Paid', className: 'bg-green-100 text-green-800', icon: CheckCircle },
    overdue: { label: 'Overdue', className: 'bg-red-100 text-red-800', icon: AlertTriangle },
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

function InvoiceListSkeleton({ showHeader }: { showHeader: boolean }) {
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