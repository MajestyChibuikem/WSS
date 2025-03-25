"use client";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import { toggleCheckboxSelectorItem } from "../store/slices/checkboxSelectorSlice";
import clsx from "clsx";

interface Params {
  id: string;
  idx: number;
  item: {
    content: string;
    stock_count?: number;
  };
}

function CheckboxSelector({ id, idx, item }: Params) {
  const dispatch = useDispatch();
  const selectedItems = useSelector(
    (state: RootState) => state.checkboxSelector.selectors[id]?.items || {}
  );

  return (
    <button
      onClick={() =>
        dispatch(
          toggleCheckboxSelectorItem({
            selectorId: id,
            itemId: idx.toString(),
            item,
          })
        )
      }
      className={clsx(
        "border text-sm border-wBrand-foreground/20 rounded-xl px-3 py-2 flex justify-between items-center",
        selectedItems[idx.toString()]
          ? "!border-wBrand-accent"
          : "border-wBrand-foreground/20"
      )}
    >
      <p>{item.content}</p>
      {/* <p
        className={clsx(
          "p-1 px-2 text-xs bg-wBrand-foreground/10 rounded-lg",
          selectedItems[idx.toString()] &&
            "bg-wBrand-accent/10 text-wBrand-accent"
        )}
      >
        {item.stock_count}
      </p> */}
    </button>
  );
}

export default CheckboxSelector;
