"use client";

import { GripVertical, Phone, MessageSquare, MapPin, Clock } from "lucide-react";

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  status: string;
  customer: {
    name: string;
    phone: string | null;
    address: string;
    serviceArea?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  pet: {
    name: string;
    breed?: string;
  } | null;
}

interface DraggableAppointmentCardProps {
  appointment: Appointment;
  contactMethods: string[];
  isDragging: boolean;
  dragHandleProps: React.HTMLAttributes<HTMLDivElement>;
  onCall: (phone: string) => void;
  onSMS: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
}

function formatTimeRange(startAt: string, serviceMinutes: number): string {
  const startDate = new Date(startAt);
  const endDate = new Date(startDate.getTime() + serviceMinutes * 60 * 1000);

  const formatTimeFromDate = (date: Date) => {
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, "0");
    return `${displayHours}:${displayMinutes} ${period}`;
  };

  return `${formatTimeFromDate(startDate)} - ${formatTimeFromDate(endDate)}`;
}

function formatAppointmentType(type: string): string {
  switch (type) {
    case "FULL_GROOM":
      return "Full Groom";
    case "BATH_ONLY":
      return "Bath Only";
    case "NAIL_TRIM":
      return "Nail Trim";
    case "FACE_FEET_FANNY":
      return "Face, Feet & Fanny";
    default:
      return type;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "BOOKED":
      return <span className="badge badge-info badge-sm">Booked</span>;
    case "CONFIRMED":
      return <span className="badge badge-success badge-sm">Confirmed</span>;
    case "IN_PROGRESS":
      return <span className="badge badge-warning badge-sm">In Progress</span>;
    default:
      return null;
  }
}

export default function DraggableAppointmentCard({
  appointment,
  contactMethods,
  isDragging,
  dragHandleProps,
  onCall,
  onSMS,
  onWhatsApp,
}: DraggableAppointmentCardProps) {
  return (
    <div
      className={`bg-white border-2 rounded-xl p-4 shadow transition-shadow ${
        isDragging ? "shadow-lg ring-2 ring-[#A5744A] opacity-90" : "hover:shadow-md"
      } ${
        appointment.status === "CONFIRMED"
          ? "border-emerald-200"
          : appointment.status === "IN_PROGRESS"
          ? "border-yellow-300"
          : "border-gray-200"
      }`}
    >
      {/* Header row with drag handle, time, and status */}
      <div className="flex items-center gap-3 mb-3">
        {/* Drag Handle */}
        <div
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 -ml-1 text-gray-400 hover:text-gray-600 touch-none"
        >
          <GripVertical className="h-5 w-5" />
        </div>

        {/* Time */}
        <div className="flex items-center gap-2 flex-1">
          <Clock className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900">
            {formatTimeRange(appointment.startAt, appointment.serviceMinutes)}
          </span>
        </div>

        {/* Status badge */}
        {getStatusBadge(appointment.status)}
      </div>

      {/* Customer and pet info */}
      <div className="mb-2">
        <h3 className="font-semibold text-gray-900">{appointment.customer.name}</h3>
        {appointment.pet && (
          <p className="text-sm text-gray-600">
            {appointment.pet.name}
            {appointment.pet.breed && (
              <span className="text-gray-500"> ({appointment.pet.breed})</span>
            )}
            <span className="mx-2">-</span>
            <span className="font-medium">
              {formatAppointmentType(appointment.appointmentType)}
            </span>
          </p>
        )}
      </div>

      {/* Address */}
      <div className="flex items-start gap-2 mb-3 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
        <span className="line-clamp-1">{appointment.customer.address}</span>
      </div>

      {/* Contact buttons */}
      {appointment.customer.phone && contactMethods.length > 0 && (
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          {contactMethods.includes("call") && (
            <button
              onClick={() => onCall(appointment.customer.phone!)}
              className="btn btn-sm btn-ghost gap-1 flex-1"
            >
              <Phone className="h-4 w-4" />
              Call
            </button>
          )}
          {contactMethods.includes("sms") && (
            <button
              onClick={() => onSMS(appointment.customer.phone!)}
              className="btn btn-sm btn-ghost gap-1 flex-1"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </button>
          )}
          {contactMethods.includes("whatsapp") && (
            <button
              onClick={() => onWhatsApp(appointment.customer.phone!)}
              className="btn btn-sm btn-ghost gap-1 flex-1"
            >
              WhatsApp
            </button>
          )}
        </div>
      )}
    </div>
  );
}
