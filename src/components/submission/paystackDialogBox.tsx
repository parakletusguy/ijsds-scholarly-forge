import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Paystackbtn from '../paystack/paystackFunction';

export const VettingDialog = ({ userData, vet, setvet }) => {
  return (
    <Dialog onOpenChange={setvet} open={vet}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Vetting Fee</DialogTitle>
          <DialogDescription>
            A vetting fee of ₦5,125 is required to begin the editorial review
            of your manuscript. Click "Pay Now" to proceed securely via Paystack.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setvet(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          {/* Do NOT close dialog here — let onSuccess/onClose callbacks handle it */}
          <Paystackbtn info={userData} onClick={() => setvet(false)} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const ProcessinFeeDialog = ({ processing, setprocessing, userData }) => {
  return (
    <Dialog onOpenChange={setprocessing} open={processing}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Processing Fee</DialogTitle>
          <DialogDescription>
            A processing fee of ₦20,500 is required to proceed to publication.
            Upon successful payment your article will be scheduled for production.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setprocessing(false)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <Paystackbtn info={userData} onClick={() => setprocessing(false)} />

        </div>
      </DialogContent>
    </Dialog>
  );
};
