"use client";

import { useState, useEffect } from "react";
import { useFeature } from "@/hooks/useFeatures";
import Link from "next/link";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  DollarSign,
  MapPin,
  Phone,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";

interface Pet {
  id: string;
  name: string;
  breed: string | null;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  serviceArea: {
    id: string;
    name: string;
    color: string;
  } | null;
}

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  status: string;
  groomerId: string;
  customer: Customer;
  pet: Pet | null;
}

interface Groomer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  color: string | null;
}

interface GroomerStats {
  groomerId: string;
  totalAppointments: number;
  completedCount: number;
  scheduledCount: number;
  totalRevenue: number;
  totalMinutes: number;
}

interface TeamCalendarData {
  viewMode: "day" | "week";
  startDate: string;
  endDate: string;
  groomers: Groomer[];
  appointmentsByGroomer: Record<string, Appointment[]>;
  groomerStats: GroomerStats[];
  totals: {
    totalAppointments: number;
    totalRevenue: number;
  };
}

export default function TeamCalendarPage() {
  const { hasFeature, isLoading: featureLoading } = useFeature("team_calendar");
  const [calendarData, setCalendarData] = useState<TeamCalendarData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week">("day");

  useEffect(() => {
    if (hasFeature) {
      fetchCalendarData();
    }
  }, [hasFeature, selectedDate, viewMode]);

  const fetchCalendarData = async () => {
    setIsLoading(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const param = viewMode === "week" ? `week=${dateStr}` : `date=${dateStr}`;
      const response = await fetch(`/api/team/calendar?${param}`);
      if (response.ok) {
        const data = await response.json();
        setCalendarData(data);
      }
    } catch (error) {
      console.error("Failed to fetch team calendar:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrevDay = () => {
    setSelectedDate((prev) => addDays(prev, viewMode === "week" ? -7 : -1));
  };

  const handleNextDay = () => {
    setSelectedDate((prev) => addDays(prev, viewMode === "week" ? 7 : 1));
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="badge badge-xs bg-green-100 text-green-700 border-0">
            Done
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="badge badge-xs bg-blue-100 text-blue-700 border-0">
            Active
          </span>
        );
      case "NO_SHOW":
        return (
          <span className="badge badge-xs bg-amber-100 text-amber-700 border-0">
            No Show
          </span>
        );
      default:
        return (
          <span className="badge badge-xs bg-gray-100 text-gray-600 border-0">
            Scheduled
          </span>
        );
    }
  };

  // Show loading state
  if (featureLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  // Show upgrade prompt for non-Pro users
  if (!hasFeature) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="h-10 w-10 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Team Calendar
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            View all your groomers&apos; schedules in one place. See who&apos;s available,
            track team performance, and coordinate appointments across your entire team.
          </p>
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Pro Plan Features
            </h3>
            <ul className="text-left space-y-3 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Side-by-side schedule view for all groomers
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Daily and weekly view modes
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Per-groomer performance statistics
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                Quick access to appointment details
              </li>
            </ul>
          </div>
          <Link
            href="/dashboard/settings/billing"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-6"
          >
            <Crown className="h-4 w-4" />
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <Calendar className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Calendar</h1>
              <p className="text-gray-600 text-sm">
                {calendarData?.groomers.length || 0} groomer
                {calendarData?.groomers.length !== 1 ? "s" : ""} active
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <div className="btn-group">
              <button
                className={`btn btn-sm ${viewMode === "day" ? "btn-active" : ""}`}
                onClick={() => setViewMode("day")}
              >
                Day
              </button>
              <button
                className={`btn btn-sm ${viewMode === "week" ? "btn-active" : ""}`}
                onClick={() => setViewMode("week")}
              >
                Week
              </button>
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-4 bg-white rounded-lg border p-3">
          <button
            onClick={handlePrevDay}
            className="btn btn-ghost btn-sm"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {viewMode === "week"
                ? `${format(startOfWeek(selectedDate), "MMM d")} - ${format(
                    addDays(startOfWeek(selectedDate), 6),
                    "MMM d, yyyy"
                  )}`
                : format(selectedDate, "EEEE, MMMM d, yyyy")}
            </h2>
            {!isSameDay(selectedDate, new Date()) && (
              <button
                onClick={handleToday}
                className="btn btn-xs btn-ghost text-[#A5744A]"
              >
                Today
              </button>
            )}
          </div>
          <button
            onClick={handleNextDay}
            className="btn btn-ghost btn-sm"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Team Summary Stats */}
      {calendarData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Users className="h-4 w-4" />
              Groomers
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {calendarData.groomers.length}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="h-4 w-4" />
              Appointments
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {calendarData.totals.totalAppointments}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Clock className="h-4 w-4" />
              Total Hours
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(
                calendarData.groomerStats.reduce((sum, s) => sum + s.totalMinutes, 0) / 60
              )}
            </div>
          </div>
          <div className="bg-white rounded-xl border p-4">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <DollarSign className="h-4 w-4" />
              Revenue
            </div>
            <div className="text-2xl font-bold text-emerald-600">
              ${calendarData.totals.totalRevenue}
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg text-primary"></span>
        </div>
      ) : calendarData && calendarData.groomers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No groomers added yet
          </h3>
          <p className="text-gray-500 mb-4">
            Add groomers to your team to see their schedules here.
          </p>
          <Link
            href="/dashboard/settings/team"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 px-4"
          >
            Add Groomer
          </Link>
        </div>
      ) : (
        /* Groomer Columns - Day View */
        viewMode === "day" && calendarData && (
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${Math.min(calendarData.groomers.length, 4)}, 1fr)` }}>
            {calendarData.groomers.map((groomer) => {
              const appointments = calendarData.appointmentsByGroomer[groomer.id] || [];
              const stats = calendarData.groomerStats.find((s) => s.groomerId === groomer.id);

              return (
                <div key={groomer.id} className="bg-white rounded-xl border overflow-hidden">
                  {/* Groomer Header */}
                  <div
                    className="p-4 border-b"
                    style={{ backgroundColor: `${groomer.color || "#6366f1"}15` }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: groomer.color || "#6366f1" }}
                      >
                        {groomer.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {groomer.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {stats?.totalAppointments || 0} appointments
                        </p>
                      </div>
                    </div>
                    {/* Mini Stats */}
                    <div className="flex gap-4 mt-3 text-xs">
                      <div>
                        <span className="text-gray-500">Hours:</span>
                        <span className="font-medium text-gray-900 ml-1">
                          {Math.round((stats?.totalMinutes || 0) / 60)}h
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Revenue:</span>
                        <span className="font-medium text-emerald-600 ml-1">
                          ${stats?.totalRevenue || 0}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Appointments List */}
                  <div className="divide-y max-h-[60vh] overflow-y-auto">
                    {appointments.length === 0 ? (
                      <div className="p-6 text-center text-gray-400">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No appointments</p>
                      </div>
                    ) : (
                      appointments.map((apt) => (
                        <Link
                          key={apt.id}
                          href={`/dashboard/appointments/${apt.id}`}
                          className="block p-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {formatTime(apt.startAt)}
                            </span>
                            {getStatusBadge(apt.status)}
                          </div>
                          <p className="font-medium text-gray-900 text-sm truncate">
                            {apt.customer.name}
                          </p>
                          {apt.pet && (
                            <p className="text-xs text-gray-500 truncate">
                              {apt.pet.name}
                              {apt.pet.breed && ` (${apt.pet.breed})`}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-gray-400">
                              {apt.serviceMinutes} min
                            </span>
                            <span className="text-xs text-emerald-600 font-medium">
                              ${apt.price}
                            </span>
                          </div>
                          {apt.customer.serviceArea && (
                            <div
                              className="mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs"
                              style={{
                                backgroundColor: `${apt.customer.serviceArea.color}20`,
                                color: apt.customer.serviceArea.color,
                              }}
                            >
                              <MapPin className="h-2.5 w-2.5" />
                              {apt.customer.serviceArea.name}
                            </div>
                          )}
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Week View */}
      {viewMode === "week" && calendarData && calendarData.groomers.length > 0 && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-3 text-left font-medium text-gray-500 min-w-[120px]">
                    Groomer
                  </th>
                  {Array.from({ length: 7 }).map((_, i) => {
                    const day = addDays(startOfWeek(selectedDate), i);
                    const isToday = isSameDay(day, new Date());
                    return (
                      <th
                        key={i}
                        className={`p-3 text-center min-w-[100px] ${
                          isToday ? "bg-blue-50" : ""
                        }`}
                      >
                        <div className="text-xs text-gray-500">
                          {format(day, "EEE")}
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            isToday ? "text-blue-600" : "text-gray-900"
                          }`}
                        >
                          {format(day, "d")}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y">
                {calendarData.groomers.map((groomer) => {
                  const appointments = calendarData.appointmentsByGroomer[groomer.id] || [];

                  return (
                    <tr key={groomer.id}>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: groomer.color || "#6366f1" }}
                          >
                            {groomer.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-gray-900 text-sm truncate">
                            {groomer.name}
                          </span>
                        </div>
                      </td>
                      {Array.from({ length: 7 }).map((_, i) => {
                        const day = addDays(startOfWeek(selectedDate), i);
                        const dayStr = format(day, "yyyy-MM-dd");
                        const dayAppointments = appointments.filter(
                          (apt) => apt.startAt.split("T")[0] === dayStr
                        );
                        const isToday = isSameDay(day, new Date());

                        return (
                          <td
                            key={i}
                            className={`p-2 align-top ${isToday ? "bg-blue-50" : ""}`}
                          >
                            {dayAppointments.length > 0 ? (
                              <div className="space-y-1">
                                {dayAppointments.slice(0, 3).map((apt) => (
                                  <Link
                                    key={apt.id}
                                    href={`/dashboard/appointments/${apt.id}`}
                                    className="block p-1.5 rounded text-xs bg-gray-100 hover:bg-gray-200 transition-colors"
                                    style={{
                                      borderLeft: `3px solid ${
                                        groomer.color || "#6366f1"
                                      }`,
                                    }}
                                  >
                                    <div className="font-medium text-gray-900 truncate">
                                      {formatTime(apt.startAt)}
                                    </div>
                                    <div className="text-gray-500 truncate">
                                      {apt.customer.name}
                                    </div>
                                  </Link>
                                ))}
                                {dayAppointments.length > 3 && (
                                  <div className="text-xs text-gray-400 text-center">
                                    +{dayAppointments.length - 3} more
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-xs text-gray-300 text-center py-2">
                                -
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
