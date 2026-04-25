import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface PaymentStatusBadgeProps {
  vettingFee: boolean;
  processingFee: boolean;
  showLabels?: boolean;
}

export const PaymentStatusBadge = ({ vettingFee, processingFee, showLabels = true }: PaymentStatusBadgeProps) => {
  if (!showLabels) {
    // Compact mode: two small colored dots with a single letter
    return (
      <div className="flex items-center gap-1.5">
        <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${vettingFee ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
          V {vettingFee ? '✓' : '✗'}
        </span>
        <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-sm ${processingFee ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
          P {processingFee ? '✓' : '·'}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 border ${vettingFee ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
        {vettingFee ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
        Vetting {vettingFee ? 'Paid' : 'Unpaid'}
      </span>
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 border ${processingFee ? 'bg-green-50 text-green-700 border-green-200' : 'bg-stone-50 text-stone-500 border-stone-200'}`}>
        {processingFee ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
        Processing {processingFee ? 'Paid' : 'Pending'}
      </span>
    </div>
  );
};
