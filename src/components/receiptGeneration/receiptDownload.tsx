import React from "react";
import { pdf } from "@react-pdf/renderer";
// import Receipt from "./Receipt";
import Receipt from "./generateReceipt";

export default async function ReceiptDown({name,amount,type}) {
  const blob = await pdf(
          <Receipt
            receiptNo={`IJSDS-${new Date().toLocaleDateString()}`}
            name="Emmanuel Olajide"
            amount={5000}
            description="Paper Submission Fee"
            date={new Date().toLocaleDateString()}
          />
        ).toBlob()

        return blob
}
