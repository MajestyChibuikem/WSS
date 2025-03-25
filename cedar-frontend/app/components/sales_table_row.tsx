import React from "react";

function SalesTableRow() {
  return (
    <div className="flex w-full max-w-full bg-wBrand-background_light/60 p-4 px-8 text-sm text-white/70 rounded-xl">
      <div className="w-[10%] text-left">id</div>
      <div className="w-[40%] text-center">item</div>
      <div className="w-[20%] text-center">by</div>
      <div className="w-[20%] text-center">date</div>
      <div className="w-[10%] text-right">cost</div>
    </div>
  );
}

export default SalesTableRow;
