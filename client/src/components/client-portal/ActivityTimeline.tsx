import { Badge } from '@/components/ui/badge';
import type { ClientActivity } from '@/types/client-portal';
import { formatDate, formatCurrency } from '@/utils/formatters';
import { 
  FileText, 
  FileCheck, 
  Receipt, 
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  User
} from 'lucide-react';

interface ActivityTimelineProps {
  activities: ClientActivity[];
  showAll?: boolean;
}

export function ActivityTimeline({ activities, showAll = false }: ActivityTimelineProps) {
  const displayActivities = showAll ? activities : activities.slice(0, 5);

  if (activities.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No recent activity</h3>
        <p className="text-gray-600">Your activity will appear here as you interact with proposals, contracts, and invoices.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {displayActivities.map((activity, index) => (
        <ActivityItem 
          key={activity.id} 
          activity={activity} 
          isLast={index === displayActivities.length - 1}
        />
      ))}
      
      {!showAll && activities.length > 5 && (
        <div className="text-center pt-4 border-t">
          <p className="text-sm text-gray-600">
            Showing {displayActivities.length} of {activities.length} activities
          </p>
        </div>
      )}
    </div>
  );
}

interface ActivityItemProps {
  activity: ClientActivity;
  isLast: boolean;
}

function ActivityItem({ activity, isLast }: ActivityItemProps) {
  const { icon, bgColor } = getActivityIcon(activity.type);
  
  return (
    <div className="flex items-start space-x-4 relative">
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-5 top-10 w-0.5 h-full bg-gray-200" />
      )}
      
      {/* Activity icon */}
      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${bgColor} flex items-center justify-center`}>
        {icon}
      </div>
      
      {/* Activity content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">{activity.title}</h4>
            {!activity.isRead && (
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
            )}
          </div>
          <time className="text-xs text-gray-500 flex-shrink-0">
            {formatDate(activity.timestamp)}
          </time>
        </div>
        
        <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
        
        {/* Activity metadata */}
        {activity.metadata && (
          <div className="flex items-center space-x-4 mt-2">
            {activity.metadata.amount && (
              <Badge variant="secondary" className="text-xs">
                {formatCurrency(activity.metadata.amount)}
              </Badge>
            )}
            
            {activity.metadata.status && (
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(activity.metadata.status)}`}
              >
                {activity.metadata.status}
              </Badge>
            )}
            
            {activity.metadata.freelancerName && (
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{activity.metadata.freelancerName}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getActivityIcon(type: ClientActivity['type']) {
  switch (type) {
    case 'proposal_received':
      return {
        icon: <FileText className="h-5 w-5 text-blue-600" />,
        bgColor: 'bg-blue-100',
      };
    case 'proposal_updated':
      return {
        icon: <FileText className="h-5 w-5 text-orange-600" />,
        bgColor: 'bg-orange-100',
      };
    case 'contract_signed':
      return {
        icon: <FileCheck className="h-5 w-5 text-green-600" />,
        bgColor: 'bg-green-100',
      };
    case 'contract_completed':
      return {
        icon: <CheckCircle className="h-5 w-5 text-green-700" />,
        bgColor: 'bg-green-100',
      };
    case 'invoice_received':
      return {
        icon: <Receipt className="h-5 w-5 text-purple-600" />,
        bgColor: 'bg-purple-100',
      };
    case 'payment_made':
      return {
        icon: <DollarSign className="h-5 w-5 text-green-600" />,
        bgColor: 'bg-green-100',
      };
    default:
      return {
        icon: <AlertCircle className="h-5 w-5 text-gray-600" />,
        bgColor: 'bg-gray-100',
      };
  }
}

function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'sent':
    case 'viewed':
      return 'border-orange-200 text-orange-700 bg-orange-50';
    case 'accepted':
    case 'signed':
    case 'paid':
    case 'completed':
      return 'border-green-200 text-green-700 bg-green-50';
    case 'rejected':
    case 'cancelled':
    case 'overdue':
      return 'border-red-200 text-red-700 bg-red-50';
    case 'draft':
      return 'border-gray-200 text-gray-700 bg-gray-50';
    default:
      return 'border-blue-200 text-blue-700 bg-blue-50';
  }
}