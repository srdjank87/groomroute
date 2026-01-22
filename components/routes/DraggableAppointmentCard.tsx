"use client";

import { useState, useRef } from "react";
import { GripVertical, Phone, MessageSquare, MapPin, Clock, Check, X, Send } from "lucide-react";
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
  preferredMessaging?: "SMS" | "WHATSAPP";
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
  preferredMessaging = "SMS",
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
  const [isSendingOnMyWay, setIsSendingOnMyWay] = useState(false);
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

  const handleOnMyWay = async () => {
    if (!appointment.customer.phone) return;

    setIsSendingOnMyWay(true);
    try {
      const response = await fetch("/api/calm/on-my-way", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appointmentId: appointment.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate message");
      }

      const data = await response.json();
      const encodedMessage = encodeURIComponent(data.message);
      const cleanPhone = appointment.customer.phone.replace(/\D/g, "");

      if (preferredMessaging === "WHATSAPP") {
        window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
      } else {
        window.location.href = `sms:${appointment.customer.phone}?body=${encodedMessage}`;
      }

      toast.success(`"On My Way" message ready for ${appointment.customer.name}`);
    } catch (error) {
      toast.error("Failed to send On My Way message");
    } finally {
      setIsSendingOnMyWay(false);
    }
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
      {appointment.customer.phone && (
        <div className="pt-3 border-t border-gray-100 space-y-2">
          {/* On My Way button - prominent single button */}
          <button
            onClick={handleOnMyWay}
            disabled={isSendingOnMyWay}
            className="btn btn-sm h-9 w-full bg-[#A5744A] hover:bg-[#8B6239] border-0 text-white gap-2"
          >
            {isSendingOnMyWay ? (
              <span className="loading loading-spinner loading-xs"></span>
            ) : (
              <Send className="h-4 w-4" />
            )}
            On My Way
          </button>
          {/* Call + Messaging buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onCall(appointment.customer.phone!)}
              className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5 flex-1"
            >
              <Phone className="h-3.5 w-3.5" />
              Call
            </button>
            {preferredMessaging === "WHATSAPP" ? (
              <button
                onClick={() => onWhatsApp(appointment.customer.phone!)}
                className="btn btn-sm h-8 px-3 bg-[#25D366] hover:bg-[#1da851] border-0 text-white gap-1.5 flex-1"
              >
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                WhatsApp
              </button>
            ) : (
              <button
                onClick={() => onSMS(appointment.customer.phone!)}
                className="btn btn-sm h-8 px-3 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-1.5 flex-1"
              >
                <MessageSquare className="h-3.5 w-3.5" />
                SMS
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
