"use client";

import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface CalendarData {
  appointmentsByDate: Record<string, { count: number; hasConfirmed: boolean; hasPending: boolean }>;
  areasByDay: Record<number, Array<{ id: string; name: string; color: string }>>;
}

interface AppointmentCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  suggestedDays?: number[]; // Days of week that are suggested (0=Sun, 1=Mon, etc.)
  customerAreaColor?: string; // Color of the customer's service area
  minDate?: Date;
}

export function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  suggestedDays = [],
  customerAreaColor,
  minDate,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCalendarData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      const monthStr = format(month, "yyyy-MM");
      const response = await fetch(`/api/appointments/calendar?month=${monthStr}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCalendarData(currentMonth);
  }, [currentMonth, fetchCalendarData]);

  const handlePrevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between mb-4">
      <button
        onClick={handlePrevMonth}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        type="button"
      >
        <ChevronLeft className="w-5 h-5 text-gray-500" />
      </button>
      <h3 className="text-lg font-semibold text-gray-900">
        {format(currentMonth, "MMMM yyyy")}
      </h3>
      <button
        onClick={handleNextMonth}
        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        type="button"
      >
        <ChevronRight className="w-5 h-5 text-gray-500" />
      </button>
    </div>
  );

  const renderDaysOfWeek = () => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, index) => {
          // Check if this day has an area assignment
          const areasForDay = calendarData?.areasByDay?.[index] || [];
          const hasAreaAssignment = areasForDay.length > 0;
          const isSuggestedDay = suggestedDays.includes(index);

          return (
            <div key={day} className="relative text-center">
              <span className={`text-xs font-medium ${
                isSuggestedDay && customerAreaColor
                  ? "text-emerald-600"
                  : hasAreaAssignment
                    ? "text-gray-700"
                    : "text-gray-400"
              }`}>
                {day}
              </span>
              {/* Area color indicator under day name */}
              {hasAreaAssignment && (
                <div className="flex justify-center gap-0.5 mt-1">
                  {areasForDay.map((area, i) => (
                    <div
                      key={area.id}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: area.color }}
                      title={area.name}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows: React.ReactElement[] = [];
    let days: React.ReactElement[] = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const currentDay = day;
        const dateStr = format(currentDay, "yyyy-MM-dd");
        const dayOfWeek = currentDay.getDay();
        const isCurrentMonth = isSameMonth(currentDay, monthStart);
        const isSelected = selectedDate && isSameDay(currentDay, selectedDate);
        const isToday = isSameDay(currentDay, new Date());
        const isPast = minDate && currentDay < minDate;

        // Get appointment data for this date
        const dateData = calendarData?.appointmentsByDate?.[dateStr];
        const hasAppointments = dateData && dateData.count > 0;

        // Check if this day is a suggested day for the customer
        const isSuggestedDay = suggestedDays.includes(dayOfWeek);

        // Get area assignments for this day of week
        const areasForDay = calendarData?.areasByDay?.[dayOfWeek] || [];

        // Determine if customer's area matches this day
        const isCustomerAreaDay = isSuggestedDay && customerAreaColor;

        days.push(
          <button
            key={dateStr}
            type="button"
            disabled={!isCurrentMonth || isPast}
            onClick={() => isCurrentMonth && !isPast && onDateSelect(currentDay)}
            className={`
              relative p-2 min-h-[52px] rounded-lg transition-all
              ${!isCurrentMonth ? "text-gray-300 cursor-default" : ""}
              ${isPast ? "text-gray-300 cursor-not-allowed" : ""}
              ${isSelected
                ? "bg-[#A5744A] text-white ring-2 ring-[#C4956A]"
                : isCurrentMonth && !isPast
                  ? isCustomerAreaDay
                    ? "bg-emerald-50 hover:bg-emerald-100 border border-dashed border-emerald-400"
                    : "hover:bg-gray-100"
                  : ""
              }
              ${isToday && !isSelected ? "ring-1 ring-gray-300" : ""}
            `}
          >
            <span className={`
              text-sm font-medium
              ${isSelected ? "text-white" : isCurrentMonth && !isPast ? "text-gray-900" : ""}
            `}>
              {format(currentDay, "d")}
            </span>

            {/* Indicators container */}
            {isCurrentMonth && (
              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex items-center gap-0.5">
                {/* Appointment indicator */}
                {hasAppointments && (
                  <div className={`
                    w-1.5 h-1.5 rounded-full
                    ${dateData.hasPending ? "bg-amber-400" : "bg-blue-400"}
                  `} title={`${dateData.count} appointment${dateData.count > 1 ? "s" : ""}`} />
                )}

                {/* Area day indicator - show first area color if it's an assigned day */}
                {areasForDay.length > 0 && !isSelected && (
                  <div
                    className="w-1.5 h-1.5 rounded-full opacity-70"
                    style={{ backgroundColor: areasForDay[0].color }}
                    title={areasForDay.map(a => a.name).join(", ")}
                  />
                )}
              </div>
            )}
          </button>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1">
          {days}
        </div>
      );
      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  const renderLegend = () => {
    // Collect unique areas from areasByDay
    const uniqueAreas: Array<{ id: string; name: string; color: string }> = [];
    if (calendarData?.areasByDay) {
      const seen = new Set<string>();
      for (const dayAreas of Object.values(calendarData.areasByDay)) {
        for (const area of dayAreas) {
          if (!seen.has(area.id)) {
            seen.add(area.id);
            uniqueAreas.push(area);
          }
        }
      }
    }

    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Appointments</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Unconfirmed</span>
          </div>
          {uniqueAreas.map(area => (
            <div key={area.id} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: area.color }}
              />
              <span>{area.name}</span>
            </div>
          ))}
          {suggestedDays.length > 0 && customerAreaColor && (
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded border border-dashed border-emerald-400 bg-emerald-50" />
              <span>Suggested</span>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      {renderHeader()}
      {renderDaysOfWeek()}
      {isLoading ? (
        <div className="h-[280px] flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#A5744A] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        renderCells()
      )}
      {renderLegend()}
    </div>
  );
}
