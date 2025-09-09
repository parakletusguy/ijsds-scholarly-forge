import React from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
// import Receipt from "./Receipt";
import Receipt from "./generateReceipt";

export default function App() {
  return (
    <div>
      <h1>Generate Receipt</h1>
      <PDFDownloadLink
        document={
          <Receipt
            receiptNo="IJSDS-2025-001"
            name="Emmanuel Olajide"
            amount={5000}
            description="Paper Submission Fee"
            date={new Date().toLocaleDateString()}
          />
        }
        fileName="receipt.pdf"
      >
        {({ loading }) => (loading ? "Loading..." : "Download Receipt")}
      </PDFDownloadLink>
    </div>
  );
}
