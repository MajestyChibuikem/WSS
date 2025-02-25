import React from "react";

function NewWineSideBar() {
  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20">
      <div className="h-full w-[25rem] bg-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">Add new wine</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-foreground/60 font-medium">WINE NAME</p>
            <div className="text-sm">
              <input
                type="text"
                placeholder="Enter wine name"
                className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
              />
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="space-y-4">
              <p className="text-xs text-foreground/60 font-medium">
                WINE ABV %
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  placeholder="Enter wine abv %"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-foreground/60 font-medium">
                BOTTLE SIZE
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  placeholder="Enter bottle size"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="space-y-4">
              <p className="text-xs text-foreground/60 font-medium">
                WINE PRICE
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  placeholder="Enter wine name"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-foreground/60 font-medium">
                WINE CATEGORY
              </p>
              <div className="text-sm">
                <input
                  type="text"
                  placeholder="Enter wine name"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-end">
          <button className="py-2 px-5 text-sm bg-accent font-semibold rounded-lg text-background">
            Add wine
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewWineSideBar;
