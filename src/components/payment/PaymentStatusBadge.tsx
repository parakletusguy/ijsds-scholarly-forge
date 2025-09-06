import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
  vettingFee: boolean;
  processingFee: boolean;
  showLabels?: boolean;
}

export const PaymentStatusBadge = ({ vettingFee, processingFee, showLabels = true }: PaymentStatusBadgeProps) => {
  return (
    <div className="flex gap-2 items-center">
      {showLabels && (
        <span className="text-sm text-muted-foreground">Payment Status:</span>
      )}
      
      <div className="flex items-center gap-1">
        {vettingFee ? (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Vetting Paid
          </Badge>
        ) : (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            Vetting Unpaid
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-1">
        {processingFee ? (
          <Badge variant="default" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-200">
            <CheckCircle className="h-3 w-3" />
            Processing Paid
          </Badge>
        ) : (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Processing Pending
          </Badge>
        )}
      </div>
    </div>
  );
};