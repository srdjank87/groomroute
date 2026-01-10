"use client";

import { useState, useRef } from "react";
import { GripVertical, Phone, MessageSquare, MapPin, Clock, Check, X } from "lucide-react";
import toast from "react-hot-toast";

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
  onTimeUpdate?: () => void;
}

function formatTime12(h: number, m: number): string {
  const period = h >= 12 ? "PM" : "AM";
  const displayHours = h % 12 || 12;
  const displayMinutes = m.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

function formatTime24(h: number, m: number): string {
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

function formatAppointmentType(type: string): string {
  switch (type) {
    case "FULL_GROOM":
      return "Full Groom";
    case "BATH_ONLY":
      return "Bath Only";
    case "BATH_BRUSH":
      return "Bath & Brush";
    case "NAIL_TRIM":
      return "Nail Trim";
    case "FACE_FEET_FANNY":
      return "Tidy Up";
    case "DESHED":
      return "De-shed";
    case "PUPPY_INTRO":
      return "Puppy Intro";
    case "HAND_STRIP":
      return "Hand Stripping";
    case "CUSTOM":
      return "Custom";
    default:
      return type;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "BOOKED":
      return <span className="badge badge-info badge-sm">Booked</span>;
    case "CONFIRMED":
      return <span className="badge badge-info badge-sm">Scheduled</span>;
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
  onTimeUpdate,
}: DraggableAppointmentCardProps) {
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const startInputRef = useRef<HTMLInputElement>(null);

  const startDate = new Date(appointment.startAt);
  const startHours = startDate.getUTCHours();
  const startMinutes = startDate.getUTCMinutes();
  const endDate = new Date(startDate.getTime() + appointment.serviceMinutes * 60 * 1000);
  const endHours = endDate.getUTCHours();
  const endMinutes = endDate.getUTCMinutes();

  const handleStartEdit = () => {
    setStartTime(formatTime24(startHours, startMinutes));
    setEndTime(formatTime24(endHours, endMinutes));
    setIsEditingTime(true);
    setTimeout(() => startInputRef.current?.focus(), 0);
  };

  const handleSaveTime = async () => {
    if (!startTime || !endTime) return;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);
    const startMinutesTotal = startH * 60 + startM;
    const endMinutesTotal = endH * 60 + endM;
    const newDuration = endMinutesTotal - startMinutesTotal;

    if (newDuration <= 0) {
      toast.error("End time must be after start time");
      return;
    }

    const originalDate = new Date(appointment.startAt);
    const dateStr = `${originalDate.getUTCFullYear()}-${String(originalDate.getUTCMonth() + 1).padStart(2, "0")}-${String(originalDate.getUTCDate()).padStart(2, "0")}`;
    const newStartAt = `${dateStr}T${startTime}:00.000Z`;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/appointments/${appointment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startAt: newStartAt,
          serviceMinutes: newDuration,
        }),
      });

      if (response.ok) {
        toast.success("Time updated");
        setIsEditingTime(false);
        onTimeUpdate?.();
      } else {
        toast.error("Failed to update time");
      }
    } catch (error) {
      toast.error("Failed to update time");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingTime(false);
  };

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

        {/* Time - Editable */}
        <div className="flex items-center gap-2 flex-1">
          {isEditingTime ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <input
                ref={startInputRef}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input input-bordered input-sm w-24 text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input input-bordered input-sm w-24 text-sm"
              />
              <button
                onClick={handleSaveTime}
                disabled={isSaving}
                className="btn btn-ghost btn-xs text-green-600 hover:bg-green-50"
              >
                {isSaving ? <span className="loading loading-spinner loading-xs"></span> : <Check className="h-4 w-4" />}
              </button>
              <button
                onClick={handleCancelEdit}
                className="btn btn-ghost btn-xs text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartEdit}
              className="flex items-center gap-2 hover:bg-gray-100 rounded px-2 py-1 -mx-2 -my-1 cursor-pointer group"
            >
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="font-semibold text-gray-900">
                {formatTime12(startHours, startMinutes)} - {formatTime12(endHours, endMinutes)}
              </span>
              <span className="text-xs text-[#A5744A] opacity-0 group-hover:opacity-100">
                edit
              </span>
            </button>
          )}
        </div>

        {/* Status badge */}
        {!isEditingTime && getStatusBadge(appointment.status)}
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
