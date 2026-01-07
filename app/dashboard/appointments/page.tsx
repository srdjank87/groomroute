"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, Clock, Edit2, X, ThumbsUp, Filter, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  status: string;
  customer: {
    id: string;
    name: string;
    address: string;
    serviceArea?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  pet?: {
    id: string;
    name: string;
    species?: string;
    breed?: string;
    weight?: number;
  };
}

const STATUS_OPTIONS = [
  { value: "ALL", label: "All Statuses" },
  { value: "BOOKED", label: "Booked" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "NO_SHOW", label: "No Show" },
];

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [otherStatusFilter, setOtherStatusFilter] = useState("ALL");
  const [otherPage, setOtherPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  const dateInputRef = useRef<HTMLInputElement>(null);

  // Check if selected date is today
  const isToday = selectedDate === new Date().toISOString().split("T")[0];

  // Format the section header based on selected date
  const getSectionHeader = () => {
    if (isToday) {
      return "Today's Appointments";
    }
    const date = new Date(selectedDate + 'T00:00:00');
    return format(date, "MMMM d") + " Appointments";
  };

  // Filter appointments by status for the selected date section
  const filterByStatus = (appts: Appointment[]) => {
    if (statusFilter === "ALL") return appts;
    return appts.filter(apt => apt.status === statusFilter);
  };

  // Filter "Other Appointments" to exclude the selected date
  const otherAppointmentsBase = allAppointments.filter(apt => {
    const aptDate = new Date(apt.startAt).toISOString().split("T")[0];
    return aptDate !== selectedDate;
  });

  // Apply status filter for other appointments
  const otherAppointmentsFiltered = otherStatusFilter === "ALL"
    ? otherAppointmentsBase
    : otherAppointmentsBase.filter(apt => apt.status === otherStatusFilter);

  // Calculate pagination for other appointments
  const totalOtherPages = Math.ceil(otherAppointmentsFiltered.length / ITEMS_PER_PAGE);
  const otherAppointmentsPaginated = otherAppointmentsFiltered.slice(
    (otherPage - 1) * ITEMS_PER_PAGE,
    otherPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  const handleOtherStatusFilterChange = (value: string) => {
    setOtherStatusFilter(value);
    setOtherPage(1);
  };

  const fetchAppointments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/appointments?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments);
      }
    } catch (error) {
      console.error("Failed to fetch appointments:", error);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  const fetchAllAppointments = useCallback(async () => {
    setIsLoadingAll(true);
    try {
      const response = await fetch("/api/appointments?all=true");
      if (response.ok) {
        const data = await response.json();
        // Sort by date descending (most recent first)
        const sorted = data.appointments.sort(
          (a: Appointment, b: Appointment) =>
            new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
        );
        setAllAppointments(sorted);
      }
    } catch (error) {
      console.error("Failed to fetch all appointments:", error);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  useEffect(() => {
    fetchAllAppointments();
  }, [fetchAllAppointments]);

  const getServiceTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      FULL_GROOM: "Full Groom 💇",
      BATH_ONLY: "Bath Only 🛁",
      NAIL_TRIM: "Nail Trim ✂️",
      FACE_FEET_FANNY: "Face/Feet/Fanny 🐾",
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      SCHEDULED: "bg-blue-100 text-blue-800",
      BOOKED: "bg-blue-100 text-blue-800",
      CONFIRMED: "bg-emerald-100 text-emerald-800",
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (response.ok) {
        toast.success("Appointment confirmed");
        fetchAppointments();
        fetchAllAppointments();
      } else {
        toast.error("Failed to confirm appointment");
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled successfully");
        fetchAppointments();
        fetchAllAppointments();
      } else {
        toast.error("Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
        <Link
          href="/dashboard/appointments/new"
          className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
        >
          <Plus className="h-5 w-5" />
          New Appointment
        </Link>
      </div>

      {/* Date Picker and Status Filter */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Date Picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <div
                className="cursor-pointer"
                onClick={() => dateInputRef.current?.showPicker?.()}
              >
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="input input-bordered w-full h-12 cursor-pointer opacity-0 absolute inset-0"
                />
                <div className="input input-bordered w-full h-12 cursor-pointer flex items-center">
                  {format(new Date(selectedDate + 'T00:00:00'), "EEEE, MMMM dd, yyyy")}
                </div>
              </div>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="select select-bordered w-full h-12 pl-10"
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section Header for Selected Date */}
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        {getSectionHeader()}
        {statusFilter !== "ALL" && (
          <span className="text-sm font-normal text-gray-500">
            ({STATUS_OPTIONS.find(s => s.value === statusFilter)?.label})
          </span>
        )}
      </h2>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : filterByStatus(appointments).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Sparkles className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {isToday ? "Your day is wide open" : "Schedule is clear"}
          </h3>
          <p className="text-gray-600 mb-4">
            {statusFilter !== "ALL"
              ? `No ${STATUS_OPTIONS.find(s => s.value === statusFilter)?.label.toLowerCase()} appointments for ${format(new Date(selectedDate + 'T00:00:00'), "MMMM d, yyyy")}`
              : isToday
                ? "A fresh slate awaits — book some appointments or enjoy a well-deserved break"
                : `Nothing scheduled for ${format(new Date(selectedDate + 'T00:00:00'), "MMMM d, yyyy")} yet`
            }
          </p>
          <Link
            href="/dashboard/appointments/new"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            <Plus className="h-5 w-5" />
            Schedule Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filterByStatus(appointments).map((appointment) => (
            <div
              key={appointment.id}
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {appointment.customer.name}
                    </h3>
                    <span
                      className={`text-xs px-2 py-1 rounded ${getStatusColor(
                        appointment.status
                      )}`}
                    >
                      {appointment.status.replace("_", " ")}
                    </span>
                  </div>
                  {appointment.pet && (
                    <p className="text-sm text-gray-600 mb-1">
                      {appointment.pet.species === "cat" ? "🐈" : "🐕"}{" "}
                      {appointment.pet.name}
                      {appointment.pet.breed && (
                        <span className="text-gray-500"> • {appointment.pet.breed}</span>
                      )}
                      {appointment.pet.weight && (
                        <span className="text-gray-500"> • {appointment.pet.weight} lbs</span>
                      )}
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {getServiceTypeLabel(appointment.appointmentType)}
                    {appointment.customer.serviceArea && (
                      <span
                        className="ml-2 text-xs px-2 py-0.5 rounded text-white"
                        style={{ backgroundColor: appointment.customer.serviceArea.color }}
                      >
                        {appointment.customer.serviceArea.name}
                      </span>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    appointment.status === "COMPLETED"
                      ? "text-green-600"
                      : appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
                        ? "text-red-500"
                        : "text-[#A5744A]"
                  }`}>
                    ${appointment.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {(() => {
                    const date = new Date(appointment.startAt);
                    const hours = date.getUTCHours();
                    const minutes = date.getUTCMinutes();
                    const endDate = new Date(date.getTime() + appointment.serviceMinutes * 60000);
                    const endHours = endDate.getUTCHours();
                    const endMinutes = endDate.getUTCMinutes();

                    const formatTime = (h: number, m: number) => {
                      const period = h >= 12 ? 'PM' : 'AM';
                      const hour12 = h % 12 || 12;
                      return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                    };

                    return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;
                  })()}
                </div>
                {/* Address hidden on mobile to save space */}
                <div className="hidden sm:flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {appointment.customer.address}
                </div>
              </div>

              {/* Action Buttons - Hide for CANCELLED, COMPLETED, and NO_SHOW */}
              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && appointment.status !== "NO_SHOW" && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  {/* Confirm button for BOOKED appointments */}
                  {appointment.status === "BOOKED" && (
                    <button
                      onClick={() => handleConfirmAppointment(appointment.id)}
                      className="btn btn-sm gap-2 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                    >
                      <ThumbsUp className="h-4 w-4" />
                      Confirm
                    </button>
                  )}
                  <Link
                    href={`/dashboard/appointments/${appointment.id}/edit`}
                    className="btn btn-ghost btn-sm gap-2 flex-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modify
                  </Link>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="btn btn-ghost btn-sm gap-2 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Other Appointments Section */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Other Appointments
            {otherStatusFilter !== "ALL" && (
              <span className="text-sm font-normal text-gray-500">
                ({STATUS_OPTIONS.find(s => s.value === otherStatusFilter)?.label})
              </span>
            )}
          </h2>
          {/* Other Appointments Filter */}
          <div className="relative w-full sm:w-48">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <select
              value={otherStatusFilter}
              onChange={(e) => handleOtherStatusFilterChange(e.target.value)}
              className="select select-bordered select-sm w-full pl-9"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {isLoadingAll ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : otherAppointmentsFiltered.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {otherStatusFilter !== "ALL" ? "No matches" : "All caught up"}
            </h3>
            <p className="text-gray-600 mb-4">
              {otherStatusFilter !== "ALL"
                ? `No ${STATUS_OPTIONS.find(s => s.value === otherStatusFilter)?.label.toLowerCase()} appointments on other dates`
                : "No upcoming appointments on your calendar — time to fill some slots!"
              }
            </p>
            <Link
              href="/dashboard/appointments/new"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Schedule Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {otherAppointmentsPaginated.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {appointment.customer.name}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {appointment.status.replace("_", " ")}
                      </span>
                    </div>
                    {appointment.pet && (
                      <p className="text-sm text-gray-600 mb-1">
                        {appointment.pet.species === "cat" ? "🐈" : "🐕"}{" "}
                        {appointment.pet.name}
                        {appointment.pet.breed && (
                          <span className="text-gray-500"> • {appointment.pet.breed}</span>
                        )}
                        {appointment.pet.weight && (
                          <span className="text-gray-500"> • {appointment.pet.weight} lbs</span>
                        )}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {getServiceTypeLabel(appointment.appointmentType)}
                      {appointment.customer.serviceArea && (
                        <span
                          className="ml-2 text-xs px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: appointment.customer.serviceArea.color }}
                        >
                          {appointment.customer.serviceArea.name}
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      {format(new Date(appointment.startAt), "MMM d, yyyy")}
                    </p>
                    <p className={`font-semibold ${
                      appointment.status === "COMPLETED"
                        ? "text-green-600"
                        : appointment.status === "CANCELLED" || appointment.status === "NO_SHOW"
                          ? "text-red-500"
                          : "text-[#A5744A]"
                    }`}>
                      ${appointment.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {(() => {
                      const date = new Date(appointment.startAt);
                      const hours = date.getUTCHours();
                      const minutes = date.getUTCMinutes();
                      const endDate = new Date(date.getTime() + appointment.serviceMinutes * 60000);
                      const endHours = endDate.getUTCHours();
                      const endMinutes = endDate.getUTCMinutes();

                      const formatTime = (h: number, m: number) => {
                        const period = h >= 12 ? 'PM' : 'AM';
                        const hour12 = h % 12 || 12;
                        return `${hour12}:${m.toString().padStart(2, '0')} ${period}`;
                      };

                      return `${formatTime(hours, minutes)} - ${formatTime(endHours, endMinutes)}`;
                    })()}
                  </div>
                  {/* Address hidden on mobile to save space */}
                  <div className="hidden sm:flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {appointment.customer.address}
                  </div>
                </div>

                {/* Action Buttons - Hide for CANCELLED, COMPLETED, and NO_SHOW */}
                {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && appointment.status !== "NO_SHOW" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    {/* Confirm button for BOOKED appointments */}
                    {appointment.status === "BOOKED" && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="btn btn-sm gap-2 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Confirm
                      </button>
                    )}
                    <Link
                      href={`/dashboard/appointments/${appointment.id}/edit`}
                      className="btn btn-ghost btn-sm gap-2 flex-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Modify
                    </Link>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="btn btn-ghost btn-sm gap-2 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination Controls */}
            {totalOtherPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing {((otherPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(otherPage * ITEMS_PER_PAGE, otherAppointmentsFiltered.length)} of {otherAppointmentsFiltered.length}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setOtherPage(p => Math.max(1, p - 1))}
                    disabled={otherPage === 1}
                    className="btn btn-sm btn-ghost gap-1 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>
                  <span className="text-sm text-gray-600 px-2">
                    Page {otherPage} of {totalOtherPages}
                  </span>
                  <button
                    onClick={() => setOtherPage(p => Math.min(totalOtherPages, p + 1))}
                    disabled={otherPage === totalOtherPages}
                    className="btn btn-sm btn-ghost gap-1 disabled:opacity-50"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
