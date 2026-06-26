import { usePaystackPayment } from "react-paystack";

const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY as string;

const Paystackbtn = ({
  info,
  onClick,
}: {
  info: {
    email: string;
    amount: number;
    metadata?: {
      custom_fields: {
        display_name: string;
        variable_name: string;
        value: string;
      }[];
    };
    onSuccess: (response: { reference: string }) => void;
    onClose: () => void;
  };
  onClick?: () => void;
}) => {
  const config = {
    email: info.email,
    amount: info.amount,
    publicKey,
    metadata: info.metadata,
    subaccount: "ACCT_hsp64u9cvOn5yfh",
  };

  const initializePayment = usePaystackPayment(config);

  const handlePayment = () => {
    if (onClick) onClick();
    try {
      initializePayment({ onSuccess: info.onSuccess, onClose: info.onClose });
    } catch (err) {
      console.error("Paystack initialization failed:", err);
      alert(
        "Payment could not be initialized. Please disable any ad blocker and try again.",
      );
    }
  };

  return (
    <button
      type="button"
      onClick={handlePayment}
      className="bg-primary hover:bg-[#8f3514] text-white px-6 py-3 text-[10px] font-bold uppercase tracking-[0.2em] transition-colors shrink-0"
    >
      Pay Now
    </button>
  );
};

export default Paystackbtn;
