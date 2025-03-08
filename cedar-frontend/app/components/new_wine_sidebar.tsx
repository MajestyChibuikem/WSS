import React from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  closeWineEditor,
  setCurrentlyEditing,
} from "../store/slices/wineSlice";
import { RootState } from "../store";
import Dropdown from "./dropdown";
import { categoryDropdownItems } from "../utils/mock_data";
import { useAddWineMutation } from "../store/slices/apiSlice";
import { Actions } from "../utils/types";

function NewWineSideBar() {
  const dispatch = useDispatch();

  const wineSelector = useSelector((state: RootState) => state.winer);

  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns["add_wine_sidbar_category"]
  );

  const [addWine] = useAddWineMutation();

  const handleSubmit = async () => {
    console.log(wineSelector, dropdown.item?.value);
    if (
      wineSelector.action_type == Actions.CREATE &&
      wineSelector.currentlyEditing &&
      dropdown.item
    ) {
      try {
        const response = await addWine({
          ...wineSelector.currentlyEditing,
          bottle_size: wineSelector.currentlyEditing.bottleSize,
          category: dropdown.item.value as string,
        });

        console.log("response: ", response);
      } catch {
        console.log("Could not create wine");
      }
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20 border-2 overflow-y-auto">
      <div className="h-full w-[25rem] bg-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">Add new wine</h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-foreground/60 font-medium">WINE NAME</p>
            <div className="text-sm">
              <input
                type="text"
                value={wineSelector?.currentlyEditing?.name}
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ name: e.target.value }))
                }
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
                  value={wineSelector?.currentlyEditing?.abv}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        abv: (e.target.value as unknown) as number,
                      })
                    )
                  }
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
                  value={wineSelector?.currentlyEditing?.bottleSize}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        bottleSize: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  placeholder="Enter bottle size"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="space-y-4 flex-1">
              <p className="text-xs text-foreground/60 font-medium">
                WINE PRICE
              </p>
              <div className="text-sm">
                <input
                  value={wineSelector?.currentlyEditing?.price}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        price: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  type="number"
                  placeholder="Enter wine name"
                  className="outline-none rounded-xl h-11 border border-foreground/20 overflow-clip bg-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <p className="text-xs text-foreground/60 font-medium">
                WINE CATEGORY
              </p>
              <Dropdown
                className="right-0"
                id="add_wine_sidbar_category"
                items={categoryDropdownItems}
              />
            </div>
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <button
            onClick={() => dispatch(closeWineEditor())}
            className="py-2 px-5 text-sm border duration-700 border-accent/30 hover:border-accent font-semibold rounded-lg text-accent/30 hover:text-accent"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-5 text-sm bg-accent font-semibold rounded-lg text-background"
          >
            Add wine
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewWineSideBar;
