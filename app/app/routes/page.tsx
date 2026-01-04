"use client";

import { useEffect, useState } from "react";
import { Navigation, MapPin, Clock, Phone, AlertCircle, Copy, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  notes: string | null;
  status: string;
  customer: {
    name: string;
    phone: string | null;
    address: string;
    addressNotes: string | null;
    accessInstructions: string | null;
  };
  pet: {
    name: string;
    size: string;
  } | null;
}

export default function TodaysRoutePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    fetchTodaysRoute();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  async function fetchTodaysRoute() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/appointments?date=${today}`);

      if (!response.ok) throw new Error("Failed to fetch appointments");

      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      console.error("Error fetching route:", error);
      toast.error("Failed to load today's route");
    } finally {
      setIsLoading(false);
    }
  }

  function formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  function getStatusColor(appointment: Appointment): string {
    const appointmentTime = new Date(appointment.startAt);
    const now = currentTime;

    if (appointment.status === "COMPLETED") return "bg-green-100 border-green-300";
    if (appointment.status === "CANCELLED") return "bg-gray-100 border-gray-300";
    if (appointmentTime < now) return "bg-amber-100 border-amber-300";

    return "bg-blue-50 border-blue-200";
  }

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  }

  function openInMaps(address: string) {
    // Opens in phone's default maps app
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="text-center py-12">
          <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
          <p className="text-gray-600 mb-6">You have a free day! Enjoy some time off.</p>
        </div>
      </div>
    );
  }

  const nextAppointment = appointments.find(apt =>
    new Date(apt.startAt) > currentTime && apt.status !== "COMPLETED"
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Today's Route</h1>
        <p className="text-gray-600">{appointments.length} appointments • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Next Up Card */}
      {nextAppointment && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-lg text-white">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-5 w-5" />
            <span className="font-semibold">Up Next</span>
          </div>
          <h3 className="text-xl font-bold mb-1">{nextAppointment.customer.name}</h3>
          <p className="text-blue-100 mb-3">{nextAppointment.pet?.name ? `${nextAppointment.pet.name} • ` : ''}{nextAppointment.appointmentType}</p>
          <div className="flex items-center gap-2 text-sm mb-3">
            <Clock className="h-4 w-4" />
            <span>{formatTime(nextAppointment.startAt)} ({nextAppointment.serviceMinutes} min)</span>
          </div>
          <button
            onClick={() => openInMaps(nextAppointment.customer.address)}
            className="w-full bg-white text-blue-600 font-semibold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <Navigation className="h-5 w-5" />
            Start Navigation
          </button>
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-3">
        {appointments.map((appointment, index) => {
          const isNext = appointment.id === nextAppointment?.id;
          const isPast = new Date(appointment.startAt) < currentTime;

          return (
            <div
              key={appointment.id}
              className={`border-2 rounded-lg p-4 ${getStatusColor(appointment)} ${isNext ? 'ring-2 ring-blue-500' : ''}`}
            >
              {/* Time & Status Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    {index + 1}. {formatTime(appointment.startAt)}
                  </span>
                  {appointment.status === "COMPLETED" && (
                    <span className="badge badge-success badge-sm">Completed</span>
                  )}
                  {isPast && appointment.status !== "COMPLETED" && (
                    <span className="badge badge-warning badge-sm">In Progress</span>
                  )}
                </div>
                <span className="text-sm text-gray-600">{appointment.serviceMinutes} min</span>
              </div>

              {/* Customer & Pet Info */}
              <h3 className="font-semibold text-gray-900 mb-1">{appointment.customer.name}</h3>
              <p className="text-sm text-gray-700 mb-2">
                {appointment.pet?.name && `${appointment.pet.name} • `}
                {appointment.appointmentType}
                {appointment.pet?.size && ` • ${appointment.pet.size}`}
              </p>

              {/* Address */}
              <div className="flex items-start gap-2 mb-3">
                <MapPin className="h-4 w-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{appointment.customer.address}</p>
                  {appointment.customer.addressNotes && (
                    <p className="text-xs text-gray-600 mt-1">{appointment.customer.addressNotes}</p>
                  )}
                </div>
              </div>

              {/* Access Instructions */}
              {appointment.customer.accessInstructions && (
                <div className="flex items-start gap-2 mb-3 p-2 bg-amber-50 rounded border border-amber-200">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-amber-800">{appointment.customer.accessInstructions}</p>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div className="mb-3 p-2 bg-blue-50 rounded border border-blue-200">
                  <p className="text-sm text-blue-900">{appointment.notes}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <button
                  onClick={() => copyAddress(appointment.customer.address)}
                  className="btn btn-sm btn-outline gap-1"
                >
                  <Copy className="h-4 w-4" />
                  Copy Address
                </button>
                {appointment.customer.phone && (
                  <a
                    href={`tel:${appointment.customer.phone}`}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    <Phone className="h-4 w-4" />
                    Call
                  </a>
                )}
                {!appointment.customer.phone && (
                  <button
                    onClick={() => openInMaps(appointment.customer.address)}
                    className="btn btn-sm btn-primary gap-1"
                  >
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
            <div className="text-xs text-gray-600">Total Stops</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {appointments.filter(a => a.status === "COMPLETED").length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              ${appointments.reduce((sum, a) => sum + a.price, 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Total Revenue</div>
          </div>
        </div>
      </div>
    </div>
  );
}
