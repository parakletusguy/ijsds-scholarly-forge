import { usePaystackPayment } from "react-paystack";

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

const Paystackbtn = ({ info, onClick }: { info: {
  email: string;
  amount: number;
  metadata?: { custom_fields: { display_name: string; variable_name: string; value: string }[] };
  onSuccess: (response: { reference: string }) => void;
  onClose: () => void;
}, onClick?: () => void }) => {
  const config = {
    email: info.email,
    amount: info.amount,
    publicKey,
    metadata: info.metadata,
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    if (onClick) onClick();
    initializePayment({ onSuccess: info.onSuccess, onClose: info.onClose });
  };

  return (
    <button 
      onClick={handlePayment}
      className="rounded-sm bg-black text-white px-6 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
    >
      Pay Now
    </button>
  );
};

export default Paystackbtn;

