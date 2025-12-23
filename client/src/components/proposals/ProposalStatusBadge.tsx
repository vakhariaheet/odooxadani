import { Badge } from '../ui/badge';
import { ProposalStatus, PROPOSAL_STATUS_CONFIG } from '../../types/proposal';

interface ProposalStatusBadgeProps {
  status: ProposalStatus;
  className?: string;
}

export function ProposalStatusBadge({ status, className }: ProposalStatusBadgeProps) {
  const config = PROPOSAL_STATUS_CONFIG[status];

  return (
    <Badge
      variant={config.color}
      className={`${config.bgColor} ${config.textColor} ${className || ''}`}
    >
      {config.label}
    </Badge>
  );
}
