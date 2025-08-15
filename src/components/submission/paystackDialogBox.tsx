import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Paystackbtn from '../paystack/paystackFunction';
export const PayDialog = ({open, setopen,userData,vet,setvet}) => {
    
    return <Dialog onOpenChange={setopen} open={open}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pay for Vetting</DialogTitle>
                <DialogDescription>
                    you have to pay for vetting before submission
                </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-between'>
                <button onClick={() => {setopen(false)}}>Cancel</button>
                <Paystackbtn info={userData}/>
            </div>
        </DialogContent>
    </Dialog>
}

export const ProcessinFeeDialog = ({open,setopen,userData}) => {
  return  <Dialog onOpenChange={setopen} open={open}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Pay for Processing</DialogTitle>
                <DialogDescription>
                    This is a fee that preceed processing,upon payment of this fee,
                    Your journal will be processed for publication
                </DialogDescription>
            </DialogHeader>
            <div className='flex items-center justify-between'>
                <button onClick={() => {setopen(false)}}>Cancel</button>
                <Paystackbtn info={userData}/>
            </div>
        </DialogContent>
    </Dialog>
}
