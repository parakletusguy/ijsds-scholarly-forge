import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, XCircle, RotateCcw } from 'lucide-react';

interface ReviewStatusIndicatorProps {
  status: string;
  deadline?: string;
  submittedAt?: string;
}

export const ReviewStatusIndicator = ({ status, deadline, submittedAt }: ReviewStatusIndicatorProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          icon: Clock,
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          label: 'Pending',
        };
      case 'in_progress':
        return {
          icon: RotateCcw,
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          label: 'In Progress',
        };
      case 'completed':
        return {
          icon: CheckCircle,
          color: 'bg-green-100 text-green-800 border-green-200',
          label: 'Completed',
        };
      case 'overdue':
        return {
          icon: AlertCircle,
          color: 'bg-red-100 text-red-800 border-red-200',
          label: 'Overdue',
        };
      case 'declined':
        return {
          icon: XCircle,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: 'Declined',
        };
      default:
        return {
          icon: Clock,
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          label: status,
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const isOverdue = deadline && !submittedAt && new Date() > new Date(deadline);
  const finalStatus = isOverdue ? 'overdue' : status;
  const finalConfig = isOverdue ? getStatusConfig('overdue') : config;
  const FinalIcon = finalConfig.icon;

  return (
    <div className="flex items-center gap-2">
      <Badge className={finalConfig.color}>
        <FinalIcon className="h-3 w-3 mr-1" />
        {finalConfig.label}
      </Badge>
      {deadline && (
        <span className="text-xs text-muted-foreground">
          Due: {new Date(deadline).toLocaleDateString()}
        </span>
      )}
      {submittedAt && (
        <span className="text-xs text-muted-foreground">
          Submitted: {new Date(submittedAt).toLocaleDateString()}
        </span>
      )}
    </div>
  );
};