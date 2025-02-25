import { ArrowUpNarrowWide, ChevronDown, Plus } from "lucide-react";
import { wineInventory } from "./utils/mock_data";
import TableRowDashboard from "./components/table_row_dashboard";

export default function Home() {
  return (
    <main className="w-[100vw] px-10 space-y-8 py-6">
      <section className="flex gap-x-2 text-xs items-center">
        <button className="h-7 w-7 rounded-full flex items-center justify-center border border-accent/50">
          <Plus className="h-4 w-4 stroke-accent" />
        </button>
        <button className="flex gap-x-2 h-8 px-2 pr-3 items-center rounded-full border border-foreground/10">
          <div className="h-5 w-5 rounded-full bg-white"></div>
          <p>Joe Shlonger</p>
        </button>
        <button className="flex gap-x-2 h-8 px-2 pr-3 items-center rounded-full border border-foreground/10">
          <div className="h-5 w-5 rounded-full bg-white"></div>
          <p>Alice Rice</p>
        </button>
      </section>

      <section className="w-full">
        <div className="flex justify-between">
          {/* <h1 className="text-2xl font-medium text-foreground/20">Dashboard</h1> */}
          <div></div>
          <div>
            <button className="h-7 text-xs rounded-full px-1 pl-3 bg-gray-400/30 items-center justify-center flex">
              <p>Sept 1 - Nov 30, 2024</p>
              <span>
                <ChevronDown className="h-4" />
              </span>
            </button>
          </div>
        </div>
      </section>

      <section className="flex justify-between items-center">
        <div className="space-y-2">
          <h3 className="font-medium">Revenue</h3>
          <div className="flex items-center gap-4">
            <h4 className="text-4xl font-semibold">
              N200,459<span className="text-foreground/40">.83</span>
            </h4>
            <div className="flex gap-x-1">
              <div className="h-5 text-xs flex items-center px-1 rounded-full bg-accent text-black w-max">
                <ArrowUpNarrowWide className="h-3 w-3" />
                <p>7.9%</p>
              </div>
              <div className="h-5 text-xs flex items-center px-1 rounded-full bg-accent text-black w-max">
                N59,000.40
              </div>
            </div>
          </div>
          <div className="text-xs font-medium flex gap-2 text-gray-400">
            <p>vs. prev. N109,245.32 </p>
            <button className="flex w-max">
              <p>Jun 1 - Aug 31, 2025</p> <ChevronDown className="h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-x-4">
          <div className="relative w-max">
            <div className="w-[13rem] h-[6rem] flex flex-col justify-center border relative z-10 border-foreground/30 bg-background rounded-xl p-3 space-y-1">
              <h5 className="text-xs text-gray-400 font-medium">
                Total bottles in stock
              </h5>
              <h4 className="text-xl font-semibold">5000</h4>
              <div className="flex justify-between text-xs gap-1 text-gray-300">
                <div className="flex gap-x-1 ">
                  <p>Red: </p> <p>3H</p>
                </div>
                <div className="flex gap-x-1 ">
                  <p>White: </p> <p>5H</p>
                </div>
                <div className="flex gap-x-1 ">
                  <p>Rose: </p> <p>2H</p>
                </div>
              </div>
            </div>
            <div className="w-[11.3rem] h-[4rem] -top-2 translate-x-[50%] right-[50%] absolute rounded-xl bg-foreground/10"></div>
          </div>

          <div className="relative w-max">
            <div className="w-[13rem] h-[6rem] flex flex-col justify-center border relative z-10 border-foreground/30 bg-background rounded-xl p-3 space-y-1">
              <h5 className="text-xs text-gray-400 font-medium">
                Total Value of Inventory
              </h5>
              <h4 className="text-xl font-semibold">N300,000</h4>
              <div className="flex justify-between text-xs gap-1 text-gray-300">
                <div className="flex gap-x-1 ">
                  <p>Red: </p> <p>80K</p>
                </div>
                <div className="flex gap-x-1 ">
                  <p>White: </p> <p>10K</p>
                </div>
                <div className="flex gap-x-1 ">
                  <p>Rose: </p> <p>50K</p>
                </div>
              </div>
            </div>
            <div className="w-[11.3rem] h-[4rem] -top-2 translate-x-[50%] right-[50%] absolute rounded-xl bg-foreground/10"></div>
          </div>

          <div className="relative">
            <h3 className=" font-medium absolute -top-8 text-foreground/80">
              Top Bestsellers
            </h3>
            <div className="flex gap-x-2">
              <div className="h-[6rem] w-[6rem] text-xs bg-accent/10 rounded-xl flex flex-col justify-center items-center p-1 gap-y-2">
                <h4 className="text-sm">Château...</h4>
                <p className="rounded-full bg-accent/30 w-max py-1 px-2">
                  300K
                </p>
                <p>+10%</p>
              </div>

              <div className="h-[6rem] w-[6rem] text-xs bg-gray-300/10 rounded-xl flex flex-col justify-center items-center p-1 gap-y-2">
                <h4 className="text-sm">Château...</h4>
                <p className="rounded-full bg-foreground/30 w-max py-1 px-2">
                  230K
                </p>
                <p>+10%</p>
              </div>

              <div className="h-[6rem] w-[6rem] text-xs bg-background border border-foreground/20 rounded-xl flex flex-col justify-center items-center p-1 gap-y-2">
                <h4 className="text-sm">Château...</h4>
                <p className="rounded-full border border-foreground/30 w-max py-1 px-2">
                  100K
                </p>
                <p>+10%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-3">
        <div className="p-1 bg-gray-300/5 mx-auto w-max relative rounded-full flex gap-4">
          <div className="flex justify-between w-max bg-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
          <div className="flex justify-between w-max bg-background rounded-full items-center p-1 px-2 gap-x-20">
            <div className="flex gap-3 items-center">
              <div className="h-5 w-5 rounded-full bg-white"></div>
              <h4 className="text-sm font-medium">N109,000</h4>
            </div>
            <p className="text-gray-300/40 text-xs">32.82%</p>
          </div>
        </div>
      </section>

      <section>
        <div className="w-[50%] space-y-4">
          <h3 className="text-xl font-medium">Inventory</h3>
          <div className="space-y-4">
            {wineInventory.slice(0, 4).map((wine, idx) => (
              <TableRowDashboard key={idx} wine={wine} />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
