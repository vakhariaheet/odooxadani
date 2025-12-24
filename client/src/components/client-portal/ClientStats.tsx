import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { ClientDashboard } from '@/types/client-portal';
import { formatCurrency } from '@/utils/formatters';
import { 
  FileText, 
  FileCheck, 
  Receipt, 
  TrendingUp
} from 'lucide-react';

interface ClientStatsProps {
  dashboard: ClientDashboard;
  className?: string;
}

export function ClientStats({ dashboard, className }: ClientStatsProps) {
  // Calculate percentages for progress bars
  const proposalAcceptanceRate = dashboard.totalProposals > 0 
    ? (dashboard.acceptedProposals / dashboard.totalProposals) * 100 
    : 0;
    
  const contractCompletionRate = (dashboard.activeContracts + dashboard.completedContracts) > 0
    ? (dashboard.completedContracts / (dashboard.activeContracts + dashboard.completedContracts)) * 100
    : 0;
    
  const invoicePaymentRate = (dashboard.outstandingInvoices + dashboard.paidInvoices) > 0
    ? (dashboard.paidInvoices / (dashboard.outstandingInvoices + dashboard.paidInvoices)) * 100
    : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}>
      {/* Proposal Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proposal Performance</CardTitle>
          <FileText className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Acceptance Rate</span>
              <span className="text-sm font-medium">{proposalAcceptanceRate.toFixed(1)}%</span>
            </div>
            <Progress value={proposalAcceptanceRate} className="h-2" />
            
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <div className="font-medium text-green-600">{dashboard.acceptedProposals}</div>
                <div className="text-gray-500">Accepted</div>
              </div>
              <div>
                <div className="font-medium text-orange-600">{dashboard.pendingProposals}</div>
                <div className="text-gray-500">Pending</div>
              </div>
              <div>
                <div className="font-medium text-red-600">{dashboard.rejectedProposals}</div>
                <div className="text-gray-500">Rejected</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contract Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Contract Progress</CardTitle>
          <FileCheck className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Completion Rate</span>
              <span className="text-sm font-medium">{contractCompletionRate.toFixed(1)}%</span>
            </div>
            <Progress value={contractCompletionRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="font-medium text-green-600">{dashboard.completedContracts}</div>
                <div className="text-gray-500">Completed</div>
              </div>
              <div>
                <div className="font-medium text-blue-600">{dashboard.activeContracts}</div>
                <div className="text-gray-500">Active</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice Statistics */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Payment Status</CardTitle>
          <Receipt className="h-4 w-4 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment Rate</span>
              <span className="text-sm font-medium">{invoicePaymentRate.toFixed(1)}%</span>
            </div>
            <Progress value={invoicePaymentRate} className="h-2" />
            
            <div className="grid grid-cols-2 gap-2 text-center text-xs">
              <div>
                <div className="font-medium text-green-600">{dashboard.paidInvoices}</div>
                <div className="text-gray-500">Paid</div>
              </div>
              <div>
                <div className="font-medium text-red-600">{dashboard.outstandingInvoices}</div>
                <div className="text-gray-500">Outstanding</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-600" />
            Financial Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {formatCurrency(dashboard.totalSpent)}
              </div>
              <div className="text-sm text-gray-600">Total Spent</div>
              <div className="text-xs text-gray-500 mt-1">This year</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">
                {formatCurrency(dashboard.outstandingInvoices * 1000)} {/* Placeholder calculation */}
              </div>
              <div className="text-sm text-gray-600">Pending Payments</div>
              <div className="text-xs text-gray-500 mt-1">{dashboard.outstandingInvoices} invoices</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {dashboard.activeContracts > 0 
                  ? formatCurrency(dashboard.totalSpent / Math.max(dashboard.completedContracts, 1))
                  : formatCurrency(0)
                }
              </div>
              <div className="text-sm text-gray-600">Avg Project Value</div>
              <div className="text-xs text-gray-500 mt-1">Per completed contract</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}