import { ArrowDownAZ, ArrowUpAZ } from "lucide-react";
import React from "react";

function Dropdown() {
  return (
    <div className="text-sm relative">
      <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
        <div className="border-r space-x-4 cursor-pointer bg-background border-foreground/20 p-3 flex w-full items-center">
          <ArrowUpAZ className="h-4" />
          <p className="text-foreground/80 font-medium">Ascending order</p>
        </div>

        <div className="w-full absolute bg-background p-2 space-y-3 rounded-xl border border-foreground/20 top-14 shadow-xl">
          <div className="flex gap-3 p-3 hover:bg-background_light/70 rounded-lg cursor-pointer">
            <ArrowUpAZ className="h-4" />
            <p className="text-foreground/80 font-medium">Ascending order</p>
          </div>
          <div className="flex gap-3 p-3 hover:bg-background_light/70 rounded-lg cursor-pointer">
            <ArrowDownAZ className="h-4" />
            <p className="text-foreground/80 font-medium">Descending order</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dropdown;
