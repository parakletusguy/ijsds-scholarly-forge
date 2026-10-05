import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Paystackbtn from '../paystack/paystackFunction';

export const VettingDialog = ({ userData, vet, setvet }) => {
  return (
    <Dialog onOpenChange={setvet} open={vet}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pay Gate 1 Evaluation Fee</DialogTitle>
          <DialogDescription>
            An initial evaluation fee of ₦5,000 is required to initiate Stage 2 integrity screening and verification of your manuscript. Click "Pay Now" to proceed securely via Paystack.
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
          <DialogTitle>Pay Gate 2 Publication Fee (APC)</DialogTitle>
          <DialogDescription>
            A Gate 2 publication fee (APC) of ₦25,500 is required to advance to the upcoming 28th monthly batch release and Crossref DOI registration.
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
