"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import DraggableAppointmentCard from "./DraggableAppointmentCard";

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

interface SortableAppointmentProps {
  appointment: Appointment;
  contactMethods: string[];
  onCall: (phone: string) => void;
  onSMS: (phone: string) => void;
  onWhatsApp: (phone: string) => void;
  onTimeUpdate?: () => void;
}

export default function SortableAppointment({
  appointment,
  contactMethods,
  onCall,
  onSMS,
  onWhatsApp,
  onTimeUpdate,
}: SortableAppointmentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: appointment.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1000 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style}>
      <DraggableAppointmentCard
        appointment={appointment}
        contactMethods={contactMethods}
        isDragging={isDragging}
        dragHandleProps={{ ...attributes, ...listeners }}
        onCall={onCall}
        onSMS={onSMS}
        onWhatsApp={onWhatsApp}
        onTimeUpdate={onTimeUpdate}
      />
    </div>
  );
}
