"use client";

import * as React from "react";
import { addDays, format } from "date-fns";
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
}: React.HTMLAttributes<HTMLDivElement>) {
  const dispatch = useDispatch();
  const { calendarRange } = useSelector((state: RootState) => state.stats);

  // Convert Redux state to DateRange format
  const initialDateRange: DateRange | undefined = calendarRange.start_date
    ? {
        from: new Date(calendarRange.start_date),
        to: calendarRange.end_date
          ? new Date(calendarRange.end_date)
          : undefined,
      }
    : undefined;

  const [date, setDate] = React.useState<DateRange | undefined>(
    initialDateRange
  );

  React.useEffect(() => {
    if (date?.from && date?.to) {
      dispatch(
        setStatsState({
          calendarRange: {
            start_date: date.from.toISOString().split("T")[0], // Format as YYYY-MM-DD
            end_date: date.to.toISOString().split("T")[0],
          },
        })
      );
    }
  }, [date, dispatch]);

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "h-7 text-xs rounded-full px-3 bg-gray-400/30 items-center justify-center flex",
              !date && "text-muted-foreground"
            )}
          >
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
        <PopoverContent className="w-auto p-0 m-3" align="start">
          <Calendar
            initialFocus
            className="bg-wBrand-background rounded-2xl"
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
