"use client";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import clsx from "clsx";

interface FilterSidebarProps {
  children: React.ReactNode;
  title?: string;
}

export default function FilterSidebar({ children, title = "Filters" }: FilterSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile filter button */}
      <button
        onClick={() => setIsOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 bg-wBrand-accent text-wBrand-background p-4 rounded-full shadow-lg"
      >
        <Filter className="h-5 w-5" />
      </button>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={clsx(
          "fixed lg:static z-50 lg:z-auto",
          "w-[85vw] sm:w-[320px] lg:w-[320px] xl:w-[380px]",
          "h-full lg:h-auto",
          "top-0 left-0 lg:left-auto",
          "transform transition-transform duration-300 lg:transform-none",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="lg:fixed lg:w-[300px] xl:w-[360px] lg:h-[calc(100vh-9rem)] lg:top-[9rem] lg:left-0 lg:p-10 lg:pr-0 lg:pt-0 h-full">
          <div className="rounded-lg lg:rounded-lg space-y-8 py-10 overflow-y-auto relative bg-wBrand-background lg:bg-wBrand-background_light/60 h-full">
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 lg:hidden">
              <h2 className="text-lg font-medium">{title}</h2>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {children}
          </div>
        </div>
      </div>
    </>
  );
}
