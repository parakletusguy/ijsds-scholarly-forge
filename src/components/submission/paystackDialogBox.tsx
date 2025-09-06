import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Paystackbtn from '../paystack/paystackFunction';
export const VettingDialog = ({userData,vet,setvet}) => {
    
    return <Dialog onOpenChange={setvet} open={vet}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pay for Vetting</DialogTitle>
                <DialogDescription>
                    You want to pay for vetting, Click "Pay" to proceed
                </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-between'>
                <button onClick={() => {setvet(false)}}>Cancel</button>
                <div onClick={() => {setvet(false)}}>
                    <Paystackbtn info={userData} />
                </div>
            </div>
        </DialogContent>
    </Dialog>
}

export const ProcessinFeeDialog = ({processing,setprocessing,userData}) => {
  return  <Dialog onOpenChange={setprocessing} open={processing}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pay for Processing</DialogTitle>
                <DialogDescription>
                    This is a fee that preceed processing,upon payment of this fee,
                    Your journal will be processed for publication
                </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-between'>
                <button onClick={() => {setprocessing(false)}}>Cancel</button>

                <div onClick={() => {setprocessing(false)}}>
                    <Paystackbtn info={userData} />
                </div>
            </div>
        </DialogContent>
    </Dialog>
}
