import { Badge } from '@/components/ui/badge';
import { ContractStatus } from '@/types/contract';

interface ContractStatusBadgeProps {
  status: ContractStatus;
  className?: string;
}

const statusConfig = {
  [ContractStatus.DRAFT]: {
    label: 'Draft',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
  },
  [ContractStatus.SENT]: {
    label: 'Sent',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  [ContractStatus.SIGNED]: {
    label: 'Signed',
    variant: 'default' as const,
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [ContractStatus.COMPLETED]: {
    label: 'Completed',
    variant: 'default' as const,
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200',
  },
  [ContractStatus.CANCELLED]: {
    label: 'Cancelled',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 hover:bg-red-200',
  },
};

export function ContractStatusBadge({ status, className }: ContractStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={`${config.className} ${className || ''}`}>
      {config.label}
    </Badge>
  );
}
