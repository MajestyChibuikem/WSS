import React, { useRef, useState } from "react";
import { Sale } from "../store/slices/salesSlice";
import { formatDecimal } from "../utils/helpers";
import { format, parseISO } from "date-fns";
import { Download } from "lucide-react";
//@ts-ignore
import html2pdf from "html2pdf.js";
import Receipt from "./receipt";

function SalesTableRow({ sales }: { sales: Sale }) {
  const rowRef = useRef(null);

  const [receiptData, setReceiptData] = useState<null | {
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
  }>(null);

  const downloadPDF = () => {
    const cartItems = sales.items.map((item) => ({
      id: item.product_id,
      name: item.product_name,
      price: parseFloat(item.price), // Convert string to number
      quantity: item.quantity,
    }));

    const formattedDate = format(parseISO(sales.date), "yyyy-MM-dd");
    const formattedTime = format(parseISO(sales.date), "HH:mm:ss");

    setReceiptData({
      transactionId: String(sales.id),
      date: formattedDate,
      time: formattedTime,
      total: sales.total,
      cartItems,
      status: "Successful",
    });
  };

  return (
    <div className="flex w-full gap-x-6 max-w-full bg-wBrand-background_light/60 p-4 px-8 text-sm items-center text-white rounded-xl">
      <div className="w-[10%] text-left">#{sales.id}</div>
      <div className="w-[30%]">
        {sales.items
          .map((item) => `${item.product_name} (${item.quantity})`)
          .join(", ")}
      </div>
      <div className="w-[20%]">{sales.username}</div>
      <div className="w-[20%]">
        {format(parseISO(sales.date), "do MMM yy, h:mma")}
      </div>
      <div className="w-[10%] text-right">
        {formatDecimal(Number(sales.total)).formatted}
      </div>
      <button className="p-3 w-[10%] flex justify-center rounded-xl">
        <Download
          onClick={downloadPDF}
          className="size-5 mx-auto text-wBrand-accent"
        />
      </button>

      {receiptData && (
        <section
          onClick={() => setReceiptData(null)}
          className="fixed top-0 right-0 w-full h-full bg-wBrand-background/90 z-20 flex justify-center pt-[10%]"
        >
          <Receipt {...receiptData} />
        </section>
      )}
    </div>
  );
}

export default SalesTableRow;
