"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  toggleDropdown,
  updateToggleItem,
} from "../store/slices/dropdownSlice";
import { DropdownItem } from "../utils/types";
import clsx from "clsx";

interface Params<T> {
  id: string;
  items: DropdownItem<T>[];
  className?: string;
  action?: () => void;
}

function Dropdown<T>({ id, items, className, action }: Params<T>) {
  const dispatch = useDispatch();
  const dropdown = useSelector(
    (state: RootState) => state.dropdown.dropdowns[id]
  );

  useEffect(() => {
    dispatch(updateToggleItem({ id, item: items[0] }));
  }, []);

  return (
    <div className="flex w-full rounded-xl border border-foreground/20 overflow-clip bg-background/40">
      <div
        onClick={() => dispatch(toggleDropdown(id))}
        className={clsx(
          "border-r space-x-4 cursor-pointer bg-background border-foreground/20 p-3 flex w-full items-center",
          className
        )}
      >
        {dropdown && (
          <>
            {(dropdown.item as DropdownItem<T>).icon}
            <p className="text-foreground/80 font-medium">
              {(dropdown.item as DropdownItem<T>).content}
            </p>
          </>
        )}
      </div>

      {dropdown && dropdown.show && (
        <div className="w-full absolute bg-background p-2 space-y-3 rounded-xl border border-foreground/20 top-14 shadow-xl">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                action && action();
                dispatch(updateToggleItem({ id, item }));
              }}
              className="flex gap-3 p-3 hover:bg-background_light/70 rounded-lg cursor-pointer"
            >
              {item.icon}
              <p className="text-foreground/80 font-medium">{item.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
