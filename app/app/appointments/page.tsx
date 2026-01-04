"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, Clock, Edit2, X, RotateCcw } from "lucide-react";
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
  };
  pet?: {
    id: string;
    name: string;
    species?: string;
  };
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const dateInputRef = useRef<HTMLInputElement>(null);

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
      IN_PROGRESS: "bg-yellow-100 text-yellow-800",
      COMPLETED: "bg-green-100 text-green-800",
      CANCELLED: "bg-red-100 text-red-800",
      NO_SHOW: "bg-gray-100 text-gray-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
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
          href="/app/appointments/new"
          className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
        >
          <Plus className="h-5 w-5" />
          New Appointment
        </Link>
      </div>

      {/* Date Picker */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Date
        </label>
        <div
          className="cursor-pointer"
          onClick={() => dateInputRef.current?.showPicker?.()}
        >
          <input
            ref={dateInputRef}
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input input-bordered w-full h-12 cursor-pointer"
          />
        </div>
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Appointments
          </h3>
          <p className="text-gray-600 mb-4">
            No appointments scheduled for {format(new Date(selectedDate), "MMMM d, yyyy")}
          </p>
          <Link
            href="/app/appointments/new"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            <Plus className="h-5 w-5" />
            Schedule Appointment
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((appointment) => (
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
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    {getServiceTypeLabel(appointment.appointmentType)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#A5744A]">
                    ${appointment.price}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {new Date(appointment.startAt).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit"
                  })} -{" "}
                  {new Date(
                    new Date(appointment.startAt).getTime() +
                      appointment.serviceMinutes * 60000
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit"
                  })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {appointment.customer.address}
                </div>
              </div>

              {/* Action Buttons */}
              {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                <div className="flex gap-2 pt-3 border-t border-gray-100">
                  <Link
                    href={`/app/appointments/${appointment.id}/edit`}
                    className="btn btn-ghost btn-sm gap-2 flex-1"
                  >
                    <Edit2 className="h-4 w-4" />
                    Modify
                  </Link>
                  <Link
                    href={`/app/appointments/${appointment.id}/reschedule`}
                    className="btn btn-ghost btn-sm gap-2 flex-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Reschedule
                  </Link>
                  <button
                    onClick={() => handleCancelAppointment(appointment.id)}
                    className="btn btn-ghost btn-sm gap-2 flex-1 text-red-600 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* All Appointments Section */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">All Appointments</h2>
        {isLoadingAll ? (
          <div className="flex items-center justify-center py-12">
            <span className="loading loading-spinner loading-lg"></span>
          </div>
        ) : allAppointments.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Appointments Yet
            </h3>
            <p className="text-gray-600 mb-4">
              You haven&apos;t scheduled any appointments yet
            </p>
            <Link
              href="/app/appointments/new"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Schedule First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {allAppointments.map((appointment) => (
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
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {getServiceTypeLabel(appointment.appointmentType)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">
                      {format(new Date(appointment.startAt), "MMM d, yyyy")}
                    </p>
                    <p className="font-semibold text-[#A5744A]">
                      ${appointment.price}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(appointment.startAt).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit"
                    })} -{" "}
                    {new Date(
                      new Date(appointment.startAt).getTime() +
                        appointment.serviceMinutes * 60000
                    ).toLocaleTimeString("en-US", {
                      hour: "numeric",
                      minute: "2-digit"
                    })}
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {appointment.customer.address}
                  </div>
                </div>

                {/* Action Buttons */}
                {appointment.status !== "CANCELLED" && appointment.status !== "COMPLETED" && (
                  <div className="flex gap-2 pt-3 border-t border-gray-100">
                    <Link
                      href={`/app/appointments/${appointment.id}/edit`}
                      className="btn btn-ghost btn-sm gap-2 flex-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      Modify
                    </Link>
                    <Link
                      href={`/app/appointments/${appointment.id}/reschedule`}
                      className="btn btn-ghost btn-sm gap-2 flex-1"
                    >
                      <RotateCcw className="h-4 w-4" />
                      Reschedule
                    </Link>
                    <button
                      onClick={() => handleCancelAppointment(appointment.id)}
                      className="btn btn-ghost btn-sm gap-2 flex-1 text-red-600 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
