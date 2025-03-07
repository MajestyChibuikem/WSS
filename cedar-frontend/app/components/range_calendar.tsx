import React, { useState } from "react";
import { format, isSameDay, isBefore, isAfter, addDays } from "date-fns";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface RangeCalendarProps {
  onRangeSelect?: (range: { start: Date | null; end: Date | null }) => void;
  className?: string;
}

const RangeCalendar: React.FC<RangeCalendarProps> = ({
  onRangeSelect,
  className,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedRange, setSelectedRange] = useState<{
    start: Date | null;
    end: Date | null;
  }>({
    start: null,
    end: null,
  });

  // Generate the days of the month
  const startOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  );
  const endOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  );
  const startDay = startOfMonth.getDay(); // Get the first day of the month (0-Sunday, 6-Saturday)

  const daysInMonth = Array.from({ length: endOfMonth.getDate() }, (_, i) =>
    addDays(startOfMonth, i)
  );

  // Handle date selection logic
  const handleDateClick = (date: Date) => {
    if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
      setSelectedRange({ start: date, end: null });
    } else if (isBefore(date, selectedRange.start)) {
      setSelectedRange({ start: date, end: selectedRange.start });
    } else {
      setSelectedRange({ start: selectedRange.start, end: date });
    }

    if (onRangeSelect) {
      onRangeSelect({ start: selectedRange.start, end: selectedRange.end });
    }
  };

  // Move to previous or next month
  const changeMonth = (offset: number) => {
    setCurrentMonth(
      (prev) => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)
    );
  };

  return (
    <div
      className={clsx(
        "w-80 p-4 bg-background absolute border border-foreground/30 shadow-xl rounded-lg",
        className
      )}
    >
      {/* Month Header */}
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => changeMonth(-1)} className="px-2 py-1  rounded">
          <ChevronLeft className="h-4 w-4 hover:text-accent" />
        </button>
        <h2 className="font-bold">{format(currentMonth, "MMMM yyyy")}</h2>
        <button onClick={() => changeMonth(1)} className="px-2 py-1  rounded">
          <ChevronRight className="h-4 w-4 hover:text-accent" />
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 text-center text-xs font-semibold text-gray-700">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 text-sm text-center">
        {/* Empty spaces for days before the first of the month */}
        {Array(startDay)
          .fill(null)
          .map((_, index) => (
            <div key={`empty-${index}`} className="py-2"></div>
          ))}

        {/* Days of the month */}
        {daysInMonth.map((day) => {
          const isSelectedStart =
            selectedRange.start && isSameDay(day, selectedRange.start);
          const isSelectedEnd =
            selectedRange.end && isSameDay(day, selectedRange.end);
          const isInRange =
            selectedRange.start &&
            selectedRange.end &&
            isAfter(day, selectedRange.start) &&
            isBefore(day, selectedRange.end);

          return (
            <button
              key={day.toString()}
              onClick={() => handleDateClick(day)}
              className={`py-2 rounded-md transition ${
                isSelectedStart || isSelectedEnd
                  ? "bg-accent/30 text-white"
                  : isInRange
                  ? "bg-accent/10"
                  : "hover:bg-accent/30"
              }`}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RangeCalendar;
