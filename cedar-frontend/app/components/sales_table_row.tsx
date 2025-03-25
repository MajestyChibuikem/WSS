import React from "react";
import { Sale } from "../store/slices/salesSlice";
import { formatDecimal } from "../utils/helpers";
import { format, parseISO } from "date-fns";

function SalesTableRow({ sales }: { sales: Sale }) {
  return (
    <div className="flex w-full gap-x-6 max-w-full bg-wBrand-background_light/60 p-4 px-8 text-sm text-white rounded-xl">
      <div className="w-[10%] text-left">#{sales.id}</div>
      <div className="w-[40%]">{sales.items.join(", ")}</div>
      <div className="w-[20%]">{sales.username}</div>
      <div className="w-[20%]">
        {format(parseISO(sales.date), "do MMM yy, h:mma")}
      </div>
      <div className="w-[10%] text-right">
        {formatDecimal(Number(sales.total)).formatted}
      </div>
    </div>
  );
}

export default SalesTableRow;
