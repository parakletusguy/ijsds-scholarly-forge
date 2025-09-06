import { PaystackButton } from "react-paystack"
// const publicKey = "pk_test_7d354e4f3e5488bdb829c2a655e4e731f6263ea9"
const publicLiveKey = process.env.VITE_PAYSTACK_PUBLIC_KEY
let publicKey = publicLiveKey
const Paystackbtn = ({info}) => {
    const config = {
        email:info.email,
        amount:info.amount,
        publicKey,
        text:"pay now",
        onSuccess:info.onSuccess,
        onClose:info.onClose
}
return <PaystackButton {...config}/>
}

export default Paystackbtn