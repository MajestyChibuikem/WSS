"use client";

import * as React from "react";
import { format, subMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { useDispatch, useSelector } from "react-redux";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RootState } from "../store";
import { setStatsState } from "../store/slices/statsSlice";

export function DatePickerWithRange({
  className,
  triggerClassname,
  period1,
  uniqueKey, // New prop for unique identification
}: React.HTMLAttributes<HTMLDivElement> & {
  triggerClassname?: string;
  period1: boolean;
  uniqueKey: string;
}) {
  const dispatch = useDispatch();
  const { calendarRanges } = useSelector((state: RootState) => state.stats);

  const calendarRange = calendarRanges[uniqueKey] || {
    period1_start_date: format(subMonths(new Date(), 1), "yyyy-MM-dd"),
    period1_end_date: format(new Date(), "yyyy-MM-dd"),
    period2_start_date: format(subMonths(new Date(), 2), "yyyy-MM-dd"),
    period2_end_date: format(subMonths(new Date(), 3), "yyyy-MM-dd"),
  };

  const start_date = period1
    ? calendarRange.period1_start_date
    : calendarRange.period2_start_date;
  const end_date = period1
    ? calendarRange.period1_end_date
    : calendarRange.period2_end_date;

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(start_date),
    to: end_date ? new Date(end_date) : undefined,
  });

  React.useEffect(() => {
    if (date?.from && date?.to) {
      const newStartDate = date.from.toISOString().split("T")[0];
      const newEndDate = date.to.toISOString().split("T")[0];

      const existingRange = calendarRanges[uniqueKey] || {}; // Get existing state

      const isSame = period1
        ? existingRange.period1_start_date === newStartDate &&
          existingRange.period1_end_date === newEndDate
        : existingRange.period2_start_date === newStartDate &&
          existingRange.period2_end_date === newEndDate;

      if (!isSame) {
        dispatch(
          setStatsState({
            key: uniqueKey,
            data: {
              ...calendarRanges[uniqueKey], // Preserve existing state for this key
              ...(period1
                ? {
                    period1_start_date: newStartDate,
                    period1_end_date: newEndDate,
                  }
                : {
                    period2_start_date: newStartDate,
                    period2_end_date: newEndDate,
                  }),
            },
          })
        );
      }
    }
  }, [date, dispatch, period1, uniqueKey, calendarRanges]); // Keep `calendarRanges` in dependencies

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button className="h-8 text-xs rounded-xl px-3 bg-gray-400/30">
            <CalendarIcon />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd")} - {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 m-3 bg-wBrand-background outline-none border-wBrand-accent">
          <Calendar
            className="outline-none border-none"
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
