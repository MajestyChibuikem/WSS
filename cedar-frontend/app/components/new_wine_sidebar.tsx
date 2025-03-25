import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  clearCurrentlyEditing,
  closeWineEditor,
  setCurrentlyEditing,
} from "../store/slices/wineSlice";
import { RootState } from "../store";
import Dropdown from "./dropdown";
import { categoryDropdownItems } from "../utils/mock_data";
import {
  useAddWineMutation,
  useUpdateWineMutation,
} from "../store/slices/apiSlice";
import { Actions } from "../utils/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "react-toastify";

function NewWineSideBar() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const wineSelector = useSelector((state: RootState) => state.winer);

  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns["add_wine_sidbar_category"]
  );

  const [addWine] = useAddWineMutation();
  const [updateWine] = useUpdateWineMutation();

  const handleSubmit = async () => {
    setIsLoading(true);
    if (
      wineSelector.action_type == Actions.CREATE &&
      wineSelector.currentlyEditing
    ) {
      try {
        toast("Adding wine...");
        const response = await addWine({
          ...wineSelector.currentlyEditing,
          bottle_size: wineSelector.currentlyEditing.bottle_size,
        });

        if (response.error) {
          setIsLoading(false);
          toast.error("Couldn't add wine at the moment.");
          return;
        }

        dispatch(clearCurrentlyEditing());
        dispatch(closeWineEditor());
        setIsLoading(false);
        toast.success("Wine added successfuly");
      } catch {
        setIsLoading(false);
        toast.error("Couldn't add wine at the moment.");
      }
    } else if (
      wineSelector.action_type == Actions.UPDATE &&
      wineSelector.currentlyEditing
    ) {
      try {
        toast("Updating wine...");
        const response = await updateWine({
          ...wineSelector.currentlyEditing,
          in_stock: wineSelector.currentlyEditing.in_stock,
          wine_id: wineSelector.currentlyEditing.id,
        });

        if (response.error) {
          setIsLoading(false);
          toast.error("Couldn't updatew wine at the moment.");
          return;
        }

        dispatch(clearCurrentlyEditing());
        dispatch(closeWineEditor());
        setIsLoading(false);
        toast.success("Wine updated successfuly");
      } catch {
        setIsLoading(false);
        toast.error("Couldn't updatew wine at the moment.");
      }
    }
  };

  return (
    <div className="fixed w-[100vw] h-[100vh] bg-black/45 top-0 right-0 z-20 overflow-y-auto">
      <div className="h-full w-[25rem] bg-wBrand-background fixed top-0 right-0 p-6 space-y-8">
        <h1 className="text-2xl font-semibold mt-8">
          {wineSelector.action_type?.toString()} wine
        </h1>
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              WINE NAME
            </p>
            <div className="text-sm">
              <input
                type="text"
                value={wineSelector?.currentlyEditing?.name}
                onChange={(e) =>
                  dispatch(setCurrentlyEditing({ name: e.target.value }))
                }
                placeholder="Enter wine name"
                className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
              />
            </div>
          </div>
          <div className="space-y-4 flex-1">
            <p className="text-xs text-wBrand-foreground/60 font-medium">
              WINE CATEGORY
            </p>
            <Select>
              <SelectTrigger className="w-full rounded-xl h-max p-3">
                <SelectValue
                  placeholder={
                    wineSelector.currentlyEditing?.category ??
                    "Select wine category"
                  }
                />
              </SelectTrigger>
              <SelectContent className="bg-wBrand-background mt-2 rounded-xl">
                {categoryDropdownItems.map((item, idx) => (
                  <SelectItem
                    className="p-3"
                    key={idx}
                    onClick={() =>
                      item.content &&
                      dispatch(setCurrentlyEditing({ category: item.value }))
                    }
                    value={item.value.toString()}
                  >
                    {item.content}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex space-x-4">
            <div className="space-y-4">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
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
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                BOTTLE SIZE
              </p>
              <div className="text-sm">
                <input
                  type="number"
                  value={wineSelector?.currentlyEditing?.bottle_size}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        bottle_size: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  placeholder="Enter bottle size"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
          <div className="flex space-x-4">
            <div className="space-y-4 flex-1">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
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
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
            <div className="space-y-4 flex-1">
              <p className="text-xs text-wBrand-foreground/60 font-medium">
                NO IN STOCK
              </p>
              <div className="text-sm">
                <input
                  value={wineSelector?.currentlyEditing?.in_stock}
                  onChange={(e) =>
                    dispatch(
                      setCurrentlyEditing({
                        in_stock: (e.target.value as unknown) as number,
                      })
                    )
                  }
                  type="number"
                  placeholder="Enter number of wine in stock"
                  className="outline-none rounded-xl h-11 border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40 pl-4 w-full"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full flex gap-4 justify-end">
          <button
            onClick={() => dispatch(closeWineEditor())}
            className="py-2 px-5 text-sm border duration-700 border-wBrand-accent/30 hover:border-wBrand-accent font-semibold rounded-lg text-wBrand-accent/30 hover:text-wBrand-accent"
          >
            Close
          </button>
          <button
            onClick={handleSubmit}
            className="py-2 px-5 text-sm bg-wBrand-accent font-semibold rounded-lg text-wBrand-background"
          >
            {wineSelector.action_type?.toString()} wine
          </button>
        </div>
      </div>
    </div>
  );
}

export default NewWineSideBar;
