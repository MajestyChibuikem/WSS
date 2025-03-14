import React from "react";

function ActionTableRow() {
  return (
    <div>
      {/* <div className="grid grid-cols-5 py-4 px-3 text-sm">
        <p>#100234</p>
        <p>Château Margaux</p>
        <p className="text-xs px-2 py-1 rounded-full bg-yellow-400/10 w-max">
          ADD
        </p>
        <p>Janelle Fosha</p>
        <p>21 Feb, 2025</p>
      </div> */}

      <div className="rounded-xl bg-wBrand-background_light/60 p-4 space-y-1">
        <h3 className="text-sm text-green-400/50 font-medium">ADD</h3>
        <h2 className="">Château Margaux</h2>
        <div className="text-xs flex gap-3 text-gray-400">
          <p>#100234</p>
          <p>Janelle Fosha</p>
          <p>21/02/25</p>
        </div>
      </div>
    </div>
  );
}

export default ActionTableRow;
