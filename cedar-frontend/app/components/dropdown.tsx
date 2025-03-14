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
    <div className="flex w-full rounded-xl border border-wBrand-foreground/20 overflow-clip bg-wBrand-background/40">
      <div
        onClick={() => dispatch(toggleDropdown(id))}
        className={clsx(
          "border-r space-x-4 cursor-pointer bg-wBrand-background border-wBrand-foreground/20 p-3 flex w-full items-center",
          className
        )}
      >
        {dropdown &&
          dropdown.items?.map(
            (item, idx) =>
              item.active && (
                <div key={idx}>
                  {item.icon}
                  <p className="text-wBrand-foreground/80 font-medium">
                    {item.content}
                  </p>
                </div>
              )
          )}
      </div>

      {dropdown && dropdown.show && (
        <div className="w-full absolute bg-wBrand-background p-2 space-y-3 rounded-xl border border-wBrand-foreground/20 top-14 shadow-xl">
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => {
                action && action();
                dispatch(updateToggleItem({ id, item }));
              }}
              className="flex gap-3 p-3 hover:bg-wBrand-background_light/70 rounded-lg cursor-pointer"
            >
              {item.icon}
              <p className="text-wBrand-foreground/80 font-medium">
                {item.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Dropdown;
