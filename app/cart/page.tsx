import React from "react";
import CartCard from "../components/cart_card";
import { wineInventory } from "../utils/mock_data";

function Page() {
  return (
    <div>
      <section className="w-[50vw] space-y-2 px-10 divide-y divide-foreground/10">
        {wineInventory.slice(0, 2).map((wine, idx) => (
          <CartCard key={idx} wine={wine} />
        ))}
      </section>
    </div>
  );
}

export default Page;
