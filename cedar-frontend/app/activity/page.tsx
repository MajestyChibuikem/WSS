import React from "react";
import ActionTableRow from "../components/action_table_row";
import { DollarSign, User } from "lucide-react";
import { actions } from "../utils/mock_data";

function Page() {
  return (
    <div className="w-[100vw] px-10 space-y-10">
      <h1 className="text-2xl font-medium">Activity Log</h1>
      <section className="w-full flex">
        <div className="w-[25rem] h-[100vh]">
          <div className="fixed w-[24rem] h-[calc(100vh-9rem)] top-[9rem] p-10 pr-0 pt-0 left-0">
            <div className="p-6 rounded-lg space-y-8 bg-background_light/60 h-full">
              <div className="space-y-4">
                <p className="text-xs text-foreground/60 font-medium">
                  ACTIONS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {actions.map((category, idx) => (
                    <button
                      key={idx}
                      className="border text-xs border-foreground/20 rounded-xl px-3 py-2 flex justify-between text-left items-center"
                    >
                      <p>{category}</p>
                      <p className="p-1 px-2 text-xs bg-foreground/10 rounded-lg">
                        1078
                      </p>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <p className="text-xs text-foreground/60 font-medium">
                  FILTER BY USER
                </p>
                <div className="text-sm">
                  <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
                    <div className="border-r bg-background border-foreground/20 p-3">
                      <User className="h-4" />
                    </div>
                    <input
                      type="text"
                      placeholder="ENTER USER NAME"
                      className="outline-none min-h-full pl-4 bg-transparent w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="w-[calc(100vw-25rem)]">
          {/* <div className="grid grid-cols-5 text-xs py-2 px-4 bg-accent/10 text-gray-300 rounded-full w-full">
            <p>ITEM ID</p>
            <p>ITEM NAME</p>
            <p>ACTION</p>
            <p>USER</p>
            <p>DATE</p>
          </div> */}
          <div className="grid grid-cols-3 gap-4">
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
            <ActionTableRow />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Page;
