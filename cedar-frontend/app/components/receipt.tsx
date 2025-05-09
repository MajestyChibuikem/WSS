// components/Receipt.tsx
"use client";

import { useRef } from "react";
//@ts-ignore
import html2pdf from "html2pdf.js";

type ReceiptProps = {
  transactionId: string;
  date: string;
  time: string;
  total: string;
  cartItems: Array<{
    id: number;
    name: string;
    price: number;
    quantity: number;
  }>;
  status: "Successful" | "Pending" | "Failed";
};

export default function Receipt({
  transactionId,
  date,
  time,
  total,
  status,
  cartItems,
}: ReceiptProps) {
  const receiptRef = useRef<HTMLDivElement>(null);

  const downloadPDF = () => {
    if (!receiptRef.current) return;

    html2pdf()
      .from(receiptRef.current)
      .set({
        margin: 0.5,
        filename: `shopme-receipt-${transactionId}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "letter", orientation: "portrait" },
      })
      .save();
  };

  return (
    <div className="flex flex-col items-center justify-center h-max w-max">
      <div
        ref={receiptRef}
        className="bg-white rounded-lg shadow-md w-[25rem] max-w-md p-6"
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-wBrand-background">
            ShopMe Receipt
          </h2>
          <p className="text-gray-500 text-sm">
            {date} • {time}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Transaction ID:</span>
            <span className="text-gray-900">{transactionId}</span>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Recipient:</span>
            <span className="text-gray-900">{recipient}</span>
          </div> */}
          {/* Itemized List */}
          <div className="py-1 pb-2">
            <h3 className="font-semibold text-gray-800 mb-2">Items</h3>
            <div className="space-y-1 text-sm">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between text-gray-700 pb-2"
                >
                  <span>
                    {item.name} (x{item.quantity})
                  </span>
                  <span>{(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
          {/* <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Amount:</span>
            <span className="text-gray-900">{amount}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-700 font-medium">Fee:</span>
            <span className="text-gray-900">{fee}</span>
          </div> */}
          <div className="flex justify-between pt-4">
            <span className="text-gray-700 font-semibold">Total:</span>
            <span className="text-gray-900 font-semibold">{total}</span>
          </div>
          <div className="flex justify-between pt-4">
            <span className="text-gray-700 font-medium">Status:</span>
            <span
              className={`font-bold ${
                status === "Successful"
                  ? "text-green-500"
                  : status === "Pending"
                  ? "text-yellow-500"
                  : "text-red-500"
              }`}
            >
              {status}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          downloadPDF();
        }}
        className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow transition"
      >
        Download Receipt PDF
      </button>
    </div>
  );
}
