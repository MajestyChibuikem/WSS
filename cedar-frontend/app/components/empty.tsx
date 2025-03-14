import React from "react";

interface Params {
  info: string;
}

function Empty({ info }: Params) {
  return (
    <div className="w-full flex items-center justify-center h-[30rem] text-xl text-white/20">
      <p className="">{info}</p>
    </div>
  );
}

export default Empty;
