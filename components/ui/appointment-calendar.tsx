"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface AreaInfo {
  areaId: string;
  areaName: string;
  areaColor: string;
  isOverride: boolean;
}

interface CalendarData {
  appointmentsByDate: Record<string, { count: number; scheduledCount: number; completedCount: number }>;
  areasByDate: Record<string, AreaInfo | null>;
  areasByDay: Record<number, Array<{ id: string; name: string; color: string }>>;
}

// Day assignments from the area-assignments API
interface DayAssignment {
  areaId: string;
  areaName: string;
  areaColor: string;
}

interface AppointmentCalendarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  suggestedDays?: number[]; // Days of week that are suggested (0=Sun, 1=Mon, etc.)
  customerAreaColor?: string; // Color of the customer's service area
  minDate?: Date;
  onAreaDataChange?: (areasByDate: Record<string, AreaInfo | null>) => void; // Callback when area data is loaded
  // Optional: pass fresh day assignments to compute areas client-side
  dayAssignments?: Record<number, DayAssignment | null>;
  refreshTrigger?: number; // Increment to force re-fetch
}

export function AppointmentCalendar({
  selectedDate,
  onDateSelect,
  suggestedDays = [],
  customerAreaColor,
  minDate,
  onAreaDataChange,
  dayAssignments,
  refreshTrigger = 0,
}: AppointmentCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(selectedDate || new Date());
  const [calendarData, setCalendarData] = useState<CalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCalendarData = useCallback(async (month: Date) => {
    setIsLoading(true);
    try {
      const monthStr = format(month, "yyyy-MM");
      // Add cache-busting timestamp
      const response = await fetch(`/api/appointments/calendar?month=${monthStr}&_t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
        // Notify parent of area data changes
        if (onAreaDataChange && data.areasByDate) {
          onAreaDataChange(data.areasByDate);
        }
      }
    } catch (error) {
      console.error("Failed to fetch calendar data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [onAreaDataChange]);

  useEffect(() => {
    fetchCalendarData(currentMonth);
  }, [currentMonth, fetchCalendarData, refreshTrigger]);

  // Compute areasByDate from dayAssignments if provided (client-side, always fresh)
  // This overrides the API-based areasByDate for the default weekly pattern
  const computedAreasByDate = useMemo(() => {
    if (!dayAssignments || !calendarData) return calendarData?.areasByDate || {};

    const result: Record<string, AreaInfo | null> = {};
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);

    let day = monthStart;
    while (day <= monthEnd) {
      const dateStr = format(day, "yyyy-MM-dd");
      const dayOfWeek = day.getDay();

      // Check if there's an override from the API
      const apiData = calendarData.areasByDate?.[dateStr];
      if (apiData?.isOverride) {
        // Keep the override from API
        result[dateStr] = apiData;
      } else {
        // Use the passed-in dayAssignments (always fresh)
        const assignment = dayAssignments[dayOfWeek];
        if (assignment) {
          result[dateStr] = {
            areaId: assignment.areaId,
            areaName: assignment.areaName,
            areaColor: assignment.areaColor,
            isOverride: false,
          };
        } else {
          result[dateStr] = null;
        }
      }

      day = addDays(day, 1);
    }

    return result;
  }, [dayAssignments, calendarData, currentMonth]);

  // Use computed areas if dayAssignments provided, otherwise fall back to API data
  const effectiveAreasByDate = dayAssignments ? computedAreasByDate : (calendarData?.areasByDate || {});

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
        // Compare dates only (not time) - allow same-day bookings
        const isPast = minDate && !isSameDay(currentDay, minDate) && currentDay < minDate;

        // Get appointment data for this date
        const dateData = calendarData?.appointmentsByDate?.[dateStr];
        const hasAppointments = dateData && dateData.count > 0;

        // Get area assignment for this specific date (use computed/effective data)
        const areaForDate = effectiveAreasByDate[dateStr];
        const hasArea = !!areaForDate;

        // Check if this day is a suggested day for the customer
        const isSuggestedDay = suggestedDays.includes(dayOfWeek);

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

            {/* Area color indicator - top left corner */}
            {isCurrentMonth && hasArea && !isSelected && (
              <div
                className={`absolute top-1 left-1 w-2 h-2 rounded-full ${areaForDate.isOverride ? "ring-1 ring-offset-1 ring-gray-400" : ""}`}
                style={{ backgroundColor: areaForDate.areaColor }}
                title={`${areaForDate.areaName}${areaForDate.isOverride ? " (override)" : ""}`}
              />
            )}

            {/* Appointment count badge */}
            {isCurrentMonth && hasAppointments && (() => {
              // Determine badge color based on appointment types
              // - All completed: green
              // - All scheduled (future): blue
              // - Mixed: gray (shouldn't happen often but just in case)
              const hasScheduled = dateData.scheduledCount > 0;
              const hasCompleted = dateData.completedCount > 0;

              let badgeClasses = "";
              let titleText = "";

              if (isSelected) {
                badgeClasses = "bg-white/90 text-[#A5744A]";
              } else if (hasScheduled && !hasCompleted) {
                // All scheduled (future appointments)
                badgeClasses = "bg-blue-100 text-blue-700 ring-1 ring-blue-300";
                titleText = `${dateData.scheduledCount} scheduled`;
              } else if (hasCompleted && !hasScheduled) {
                // All completed (past appointments)
                badgeClasses = "bg-green-100 text-green-700 ring-1 ring-green-300";
                titleText = `${dateData.completedCount} completed`;
              } else {
                // Mixed
                badgeClasses = "bg-gray-100 text-gray-600 ring-1 ring-gray-300";
                titleText = `${dateData.scheduledCount} scheduled, ${dateData.completedCount} completed`;
              }

              return (
                <div
                  className={`absolute bottom-0.5 right-0.5 min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center text-[10px] font-bold ${badgeClasses}`}
                  title={titleText || `${dateData.count} appointment${dateData.count > 1 ? "s" : ""}`}
                >
                  {dateData.count}
                </div>
              );
            })()}
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
    // Collect unique areas from effectiveAreasByDate
    const uniqueAreas: Array<{ id: string; name: string; color: string }> = [];
    const seen = new Set<string>();

    for (const areaInfo of Object.values(effectiveAreasByDate)) {
      if (areaInfo && !seen.has(areaInfo.areaId)) {
        seen.add(areaInfo.areaId);
        uniqueAreas.push({
          id: areaInfo.areaId,
          name: areaInfo.areaName,
          color: areaInfo.areaColor,
        });
      }
    }

    // Check if there are any overrides in the current view
    const hasOverrides = Object.values(effectiveAreasByDate).some(a => a?.isOverride);

    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-500">
          {/* Scheduled appointments legend */}
          <div className="flex items-center gap-1.5">
            <div className="min-w-[16px] h-[16px] px-1 rounded-full bg-blue-100 ring-1 ring-blue-300 flex items-center justify-center text-[10px] font-bold text-blue-700">
              2
            </div>
            <span>Scheduled</span>
          </div>
          {/* Completed appointments legend */}
          <div className="flex items-center gap-1.5">
            <div className="min-w-[16px] h-[16px] px-1 rounded-full bg-green-100 ring-1 ring-green-300 flex items-center justify-center text-[10px] font-bold text-green-700">
              2
            </div>
            <span>Completed</span>
          </div>
          {/* Service areas legend */}
          {uniqueAreas.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <span className="text-gray-400">Areas:</span>
              {uniqueAreas.map(area => (
                <div key={area.id} className="flex items-center gap-1.5">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: area.color }}
                  />
                  <span>{area.name}</span>
                </div>
              ))}
            </>
          )}
          {/* Override indicator */}
          {hasOverrides && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-gray-400 ring-1 ring-offset-1 ring-gray-400" />
                <span>Schedule change</span>
              </div>
            </>
          )}
          {/* Suggested days legend */}
          {suggestedDays.length > 0 && customerAreaColor && (
            <>
              <div className="w-px h-4 bg-gray-300 mx-1" />
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded border border-dashed border-emerald-400 bg-emerald-50" />
                <span>Suggested day</span>
              </div>
            </>
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
