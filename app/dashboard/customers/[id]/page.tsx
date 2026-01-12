"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  Edit2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  PawPrint,
  CheckCircle,
  Heart,
  Sparkles,
  Clock,
  X,
  Check,
  FileText,
  AlertTriangle,
  ShieldAlert,
  Bell,
  BellOff
} from "lucide-react";
import toast from "react-hot-toast";
import MapPreview from "@/components/MapPreview";

interface Pet {
  id: string;
  name: string;
  species?: string;
  breed?: string;
  size?: string;
  age?: number;
  notes?: string;
}

interface Appointment {
  id: string;
  startAt: string;
  serviceMinutes: number;
  appointmentType: string;
  price: number;
  status: string;
  pet: {
    name: string;
  } | null;
}

interface ServiceArea {
  id: string;
  name: string;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  addressNotes?: string;
  accessInstructions?: string;
  notes?: string;
  lat?: number | null;
  lng?: number | null;
  geocodeStatus?: string | null;
  locationVerified?: boolean;
  serviceArea?: ServiceArea | null;
  pets: Pet[];
  appointments: Appointment[];
  cancellationCount?: number;
  noShowCount?: number;
  lastCancellationAt?: string | null;
  lastNoShowAt?: string | null;
}

interface WaitlistEntry {
  id: string;
  preferredDays: string[];
  preferredTimes: string[];
  flexibleTiming: boolean;
  isActive: boolean;
}

const formatAppointmentType = (type: string) => {
  return type
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Area assignment state
  const [availableAreas, setAvailableAreas] = useState<ServiceArea[]>([]);
  const [showAreaDropdown, setShowAreaDropdown] = useState(false);
  const [isAssigningArea, setIsAssigningArea] = useState(false);

  // Appointment editing state
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [editingDate, setEditingDate] = useState("");
  const [editingTime, setEditingTime] = useState("");
  const [isSavingAppointment, setIsSavingAppointment] = useState(false);
  const [cancellingAppointmentId, setCancellingAppointmentId] = useState<string | null>(null);

  // Waitlist state
  const [waitlistEntry, setWaitlistEntry] = useState<WaitlistEntry | null>(null);
  const [showWaitlistForm, setShowWaitlistForm] = useState(false);
  const [waitlistDays, setWaitlistDays] = useState<string[]>([]);
  const [waitlistTimes, setWaitlistTimes] = useState<string[]>([]);
  const [waitlistFlexible, setWaitlistFlexible] = useState(true);
  const [isSavingWaitlist, setIsSavingWaitlist] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    addressNotes: "",
    accessInstructions: "",
    notes: "",
  });

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
          email: data.email || "",
          address: data.address || "",
          addressNotes: data.addressNotes || "",
          accessInstructions: data.accessInstructions || "",
          notes: data.notes || "",
        });
      } else {
        toast.error("Client not found");
        router.push("/dashboard/customers");
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      toast.error("Failed to load client");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
    fetchAvailableAreas();
    fetchWaitlistEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const fetchAvailableAreas = async () => {
    try {
      const response = await fetch("/api/areas");
      if (response.ok) {
        const data = await response.json();
        setAvailableAreas(data.areas || []);
      }
    } catch (error) {
      console.error("Failed to fetch areas:", error);
    }
  };

  const fetchWaitlistEntry = async () => {
    try {
      const response = await fetch(`/api/waitlist?customerId=${customerId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.waitlist && data.waitlist.length > 0) {
          const entry = data.waitlist[0];
          setWaitlistEntry(entry);
          setWaitlistDays(entry.preferredDays || []);
          setWaitlistTimes(entry.preferredTimes || []);
          setWaitlistFlexible(entry.flexibleTiming);
        } else {
          setWaitlistEntry(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch waitlist:", error);
    }
  };

  const handleSaveWaitlist = async () => {
    if (waitlistDays.length === 0 && waitlistTimes.length === 0 && !waitlistFlexible) {
      toast.error("Please select at least one preference or enable flexible timing");
      return;
    }

    setIsSavingWaitlist(true);
    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          preferredDays: waitlistDays,
          preferredTimes: waitlistTimes,
          flexibleTiming: waitlistFlexible,
          notifyViaSMS: true,
          notifyViaEmail: true,
        }),
      });

      if (response.ok) {
        toast.success("Added to waitlist");
        setShowWaitlistForm(false);
        fetchWaitlistEntry();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to add to waitlist");
      }
    } catch (error) {
      console.error("Failed to save waitlist:", error);
      toast.error("Failed to add to waitlist");
    } finally {
      setIsSavingWaitlist(false);
    }
  };

  const handleRemoveFromWaitlist = async () => {
    if (!confirm("Remove from waitlist? They won't receive gap-fill offers anymore.")) {
      return;
    }

    setIsSavingWaitlist(true);
    try {
      const response = await fetch(`/api/waitlist?customerId=${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Removed from waitlist");
        setWaitlistEntry(null);
        setWaitlistDays([]);
        setWaitlistTimes([]);
        setWaitlistFlexible(true);
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to remove from waitlist");
      }
    } catch (error) {
      console.error("Failed to remove from waitlist:", error);
      toast.error("Failed to remove from waitlist");
    } finally {
      setIsSavingWaitlist(false);
    }
  };

  const toggleDay = (day: string) => {
    setWaitlistDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const toggleTime = (time: string) => {
    setWaitlistTimes((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleAssignArea = async (areaId: string | null) => {
    setIsAssigningArea(true);
    setShowAreaDropdown(false);
    try {
      const response = await fetch(`/api/customers/${customerId}/assign-area`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ areaId }),
      });

      if (response.ok) {
        toast.success(areaId ? "Area assigned" : "Area removed");
        fetchCustomer();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to assign area");
      }
    } catch (error) {
      console.error("Failed to assign area:", error);
      toast.error("Failed to assign area");
    } finally {
      setIsAssigningArea(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      toast.error("Name and address are required");
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success("Changes saved");
        fetchCustomer();
      } else {
        toast.error("Couldn't save changes. Please try again.");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update client");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this client? This will also remove all their pets and appointment history.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Client removed");
        router.push("/dashboard/customers");
      } else {
        const data = await response.json();
        toast.error(data.error || "Couldn't remove client. Please try again.");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Couldn't remove client. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGeocodeAddress = async () => {
    setIsVerifying(true);
    try {
      // Geocode the address using backend
      const updateResponse = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          forceGeocode: true, // Force re-geocoding even if address hasn't changed
        }),
      });

      if (updateResponse.ok) {
        const data = await updateResponse.json();

        // Check if geocoding was successful
        if (data.customer?.geocodeStatus === "OK") {
          toast.success("Location found on map!");
        } else if (data.customer?.geocodeStatus === "FAILED") {
          toast.error("Could not find this address on the map. Please check the address.");
        } else {
          toast.success("Address updated!");
        }

        fetchCustomer();
      } else {
        toast.error("Failed to geocode address");
      }
    } catch (error) {
      console.error("Failed to geocode address:", error);
      toast.error("Failed to geocode address");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyLocation = async () => {
    setIsVerifying(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locationVerified: true }),
      });

      if (response.ok) {
        toast.success("Location verified successfully");
        fetchCustomer();
      } else {
        toast.error("Failed to verify location");
      }
    } catch (error) {
      console.error("Failed to verify location:", error);
      toast.error("Failed to verify location");
    } finally {
      setIsVerifying(false);
    }
  };

  const startEditingAppointment = (appointment: Appointment) => {
    const date = new Date(appointment.startAt);
    // Format date as YYYY-MM-DD
    const dateStr = date.toISOString().split('T')[0];
    // Format time as HH:MM using UTC hours/minutes
    const hours = date.getUTCHours().toString().padStart(2, '0');
    const minutes = date.getUTCMinutes().toString().padStart(2, '0');

    setEditingAppointmentId(appointment.id);
    setEditingDate(dateStr);
    setEditingTime(`${hours}:${minutes}`);
  };

  const cancelEditingAppointment = () => {
    setEditingAppointmentId(null);
    setEditingDate("");
    setEditingTime("");
  };

  const saveAppointmentChanges = async (appointmentId: string) => {
    if (!editingDate || !editingTime) {
      toast.error("Please select a date and time");
      return;
    }

    setIsSavingAppointment(true);
    try {
      // Combine date and time into ISO string
      const [hours, minutes] = editingTime.split(':').map(Number);
      const newDate = new Date(editingDate + 'T00:00:00Z');
      newDate.setUTCHours(hours, minutes, 0, 0);

      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startAt: newDate.toISOString() }),
      });

      if (response.ok) {
        toast.success("Appointment updated");
        setEditingAppointmentId(null);
        fetchCustomer();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update appointment");
      }
    } catch (error) {
      console.error("Failed to update appointment:", error);
      toast.error("Failed to update appointment");
    } finally {
      setIsSavingAppointment(false);
    }
  };

  const cancelAppointment = async (appointmentId: string) => {
    if (!confirm("Cancel this appointment? This cannot be undone.")) {
      return;
    }

    setCancellingAppointmentId(appointmentId);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        toast.success("Appointment cancelled");
        fetchCustomer();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to cancel appointment");
      }
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment");
    } finally {
      setCancellingAppointmentId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => router.back()}
          className="btn btn-ghost btn-sm gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            {customer.name}
          </h1>
          <p className="text-gray-500 text-sm mt-0.5">Client Profile</p>
        </div>
      </div>

      {/* Service Area Badge */}
      {availableAreas.length > 0 && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Service Area</p>
                {customer?.serviceArea ? (
                  <div className="flex items-center gap-2 mt-1">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: customer.serviceArea.color }}
                    />
                    <span className="font-medium">{customer.serviceArea.name}</span>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mt-1">No area assigned</p>
                )}
              </div>
            </div>

            <div className="relative">
              <button
                onClick={() => setShowAreaDropdown(!showAreaDropdown)}
                disabled={isAssigningArea}
                className="btn btn-sm btn-outline gap-2"
              >
                {isAssigningArea ? (
                  <span className="loading loading-spinner loading-xs"></span>
                ) : (
                  <Edit2 className="h-3 w-3" />
                )}
                {customer?.serviceArea ? "Change" : "Assign Area"}
              </button>

              {showAreaDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowAreaDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-20">
                    {customer?.serviceArea && (
                      <button
                        onClick={() => handleAssignArea(null)}
                        className="w-full px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 border-b"
                      >
                        Remove area assignment
                      </button>
                    )}
                    {availableAreas.map((area) => (
                      <button
                        key={area.id}
                        onClick={() => handleAssignArea(area.id)}
                        className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 ${
                          customer?.serviceArea?.id === area.id ? "bg-gray-50" : ""
                        }`}
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: area.color }}
                        />
                        {area.name}
                        {customer?.serviceArea?.id === area.id && (
                          <CheckCircle className="h-3 w-3 ml-auto text-green-500" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* High-Risk Client Warning */}
      {customer && ((customer.cancellationCount || 0) >= 3 || (customer.noShowCount || 0) >= 3) && (
        <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <ShieldAlert className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                High-Risk Client Alert
              </h3>
              <div className="mt-2 text-sm text-amber-700 space-y-1">
                {(customer.noShowCount || 0) >= 3 && (
                  <p>
                    <span className="font-medium">{customer.noShowCount} no-shows</span> on record
                    {customer.lastNoShowAt && (
                      <span className="text-amber-600">
                        {" "}(last: {new Date(customer.lastNoShowAt).toLocaleDateString()})
                      </span>
                    )}
                  </p>
                )}
                {(customer.cancellationCount || 0) >= 3 && (
                  <p>
                    <span className="font-medium">{customer.cancellationCount} cancellations</span> on record
                    {customer.lastCancellationAt && (
                      <span className="text-amber-600">
                        {" "}(last: {new Date(customer.lastCancellationAt).toLocaleDateString()})
                      </span>
                    )}
                  </p>
                )}
              </div>

              <div className="mt-3 p-3 bg-white/60 rounded-lg border border-amber-200">
                <p className="text-xs font-semibold text-amber-800 mb-2">Recommended Actions:</p>
                <ul className="text-xs text-amber-700 space-y-1.5">
                  {(customer.noShowCount || 0) >= 3 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Require a deposit</strong> before confirming new appointments</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Send reminder texts</strong> 24 hours and 2 hours before the appointment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Call to confirm</strong> the day before the appointment</span>
                      </li>
                    </>
                  )}
                  {(customer.cancellationCount || 0) >= 3 && (
                    <>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Implement a cancellation policy</strong> (e.g., 24-hour notice required)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-amber-500 mt-0.5">•</span>
                        <span><strong>Charge a cancellation fee</strong> for late cancellations</span>
                      </li>
                    </>
                  )}
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 mt-0.5">•</span>
                    <span><strong>Consider booking during slower periods</strong> to minimize revenue impact</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Edit2 className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-semibold text-gray-900">Contact Details</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-medium">Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input w-full h-12 pl-4 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="Client name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input w-full h-12 pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="555-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input w-full h-12 pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                  placeholder="client@email.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Address *</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 z-10 pointer-events-none" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input w-full h-12 pl-10 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
                placeholder="123 Main St, City, State ZIP"
                required
              />
            </div>
          </div>

          {/* Map Preview */}
          {customer && (
            <div>
              <MapPreview
                lat={customer.lat ?? null}
                lng={customer.lng ?? null}
                address={customer.address}
                geocodeStatus={customer.geocodeStatus ?? undefined}
                locationVerified={customer.locationVerified}
                onVerifyLocation={handleVerifyLocation}
                onGeocodeAddress={handleGeocodeAddress}
                isVerifying={isVerifying}
              />
            </div>
          )}

          <div>
            <label className="label">
              <span className="label-text font-medium">Address Notes</span>
            </label>
            <textarea
              value={formData.addressNotes}
              onChange={(e) => setFormData({ ...formData, addressNotes: e.target.value })}
              className="textarea w-full pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="e.g., Blue house on the corner"
              rows={2}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Access Instructions</span>
            </label>
            <textarea
              value={formData.accessInstructions}
              onChange={(e) => setFormData({ ...formData, accessInstructions: e.target.value })}
              className="textarea w-full pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="e.g., Gate code 1234, dog door in back"
              rows={2}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                Internal Notes
              </span>
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="textarea w-full pl-4 pt-3 bg-gray-50 border-2 border-gray-200 focus:border-[#A5744A] focus:bg-white transition-colors"
              placeholder="Billing preferences, special requests, or any other notes for your reference..."
              rows={3}
            />
            <p className="text-xs text-gray-500 mt-1">For your reference only - not visible to the client</p>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 flex-1"
          >
            {isSaving ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Save className="h-5 w-5" />
            )}
            Save Changes
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="btn h-12 px-4 btn-ghost text-gray-500 hover:text-red-600 hover:bg-red-50 gap-2"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            <span className="hidden sm:inline">Remove</span>
          </button>
        </div>
      </div>

      {/* Pets Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" />
            <h2 className="text-lg font-semibold text-gray-900">Furry Friends</h2>
          </div>
          <Link
            href={`/dashboard/customers/${customerId}/pets/new`}
            className="btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </Link>
        </div>

        {customer.pets.length === 0 ? (
          <div className="text-center py-8 bg-gradient-to-br from-pink-50 to-amber-50 rounded-xl">
            <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="h-8 w-8 text-pink-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No furry friends yet</h3>
            <p className="text-gray-600 mb-4">Add {customer.name}&apos;s pets to start booking appointments</p>
            <Link
              href={`/dashboard/customers/${customerId}/pets/new`}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Their First Pet
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <PawPrint className="h-4 w-4 text-[#A5744A]" />
                    <h3 className="font-medium text-gray-900">{pet.name}</h3>
                  </div>
                  <div className="flex gap-3 text-sm text-gray-600">
                    {pet.species && <span>{pet.species}</span>}
                    {pet.breed && <span>• {pet.breed}</span>}
                    {pet.size && <span>• {pet.size}</span>}
                    {pet.age && <span>• {pet.age} years old</span>}
                  </div>
                  {pet.notes && (
                    <p className="text-sm text-gray-500 mt-1">{pet.notes}</p>
                  )}
                </div>
                <Link
                  href={`/dashboard/customers/${customerId}/pets/${pet.id}`}
                  className="btn btn-ghost btn-sm gap-2"
                >
                  <Edit2 className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Appointments Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          </div>
          <Link
            href={`/dashboard/appointments/new?customerId=${customerId}`}
            className="btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Book Appointment</span>
            <span className="sm:hidden">Book</span>
          </Link>
        </div>

        {customer.appointments.length === 0 ? (
          <div className="text-center py-8 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-8 w-8 text-emerald-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Ready for their first groom</h3>
            <p className="text-gray-600 mb-4">Schedule an appointment to get {customer.name} on your calendar</p>
            <Link
              href={`/dashboard/appointments/new?customerId=${customerId}`}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
            >
              <Plus className="h-4 w-4" />
              Book First Appointment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.appointments
              .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
              .slice(0, 5)
              .map((appointment) => {
                const date = new Date(appointment.startAt);
                const isUpcoming = date > new Date();
                const isScheduled = ["BOOKED", "CONFIRMED"].includes(appointment.status);
                const isEditing = editingAppointmentId === appointment.id;
                const isCancelling = cancellingAppointmentId === appointment.id;

                // Status badge styling
                const getStatusBadge = (status: string) => {
                  switch (status) {
                    case "BOOKED":
                    case "CONFIRMED":
                      return "bg-blue-100 text-blue-700";
                    case "IN_PROGRESS":
                      return "bg-amber-100 text-amber-700";
                    case "COMPLETED":
                      return "bg-green-100 text-green-700";
                    case "CANCELLED":
                      return "bg-red-100 text-red-700";
                    case "NO_SHOW":
                      return "bg-gray-100 text-gray-600";
                    default:
                      return "bg-gray-100 text-gray-600";
                  }
                };

                return (
                  <div
                    key={appointment.id}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isScheduled && isUpcoming
                        ? "border-blue-200 bg-blue-50/50"
                        : "border-gray-100 bg-gray-50"
                    }`}
                  >
                    {/* Main appointment info */}
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                      {/* Date/Time column */}
                      <div className="flex-1 min-w-0">
                        {isEditing ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
                                <input
                                  type="date"
                                  value={editingDate}
                                  onChange={(e) => setEditingDate(e.target.value)}
                                  className="input input-sm w-full bg-white border-2 border-gray-200 focus:border-[#A5744A]"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">Time</label>
                                <input
                                  type="time"
                                  value={editingTime}
                                  onChange={(e) => setEditingTime(e.target.value)}
                                  className="input input-sm w-full bg-white border-2 border-gray-200 focus:border-[#A5744A]"
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => saveAppointmentChanges(appointment.id)}
                                disabled={isSavingAppointment}
                                className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1"
                              >
                                {isSavingAppointment ? (
                                  <span className="loading loading-spinner loading-xs"></span>
                                ) : (
                                  <Check className="h-3 w-3" />
                                )}
                                Save
                              </button>
                              <button
                                onClick={cancelEditingAppointment}
                                className="btn btn-sm btn-ghost gap-1"
                              >
                                <X className="h-3 w-3" />
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-gray-900">
                                {date.toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                              <span className="text-gray-500">at</span>
                              <span className="font-medium text-gray-700">
                                {(() => {
                                  const hours = date.getUTCHours();
                                  const minutes = date.getUTCMinutes();
                                  const period = hours >= 12 ? 'PM' : 'AM';
                                  const hour12 = hours % 12 || 12;
                                  return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
                                })()}
                              </span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusBadge(appointment.status)}`}>
                                {appointment.status}
                              </span>
                            </div>

                            <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
                              <span className="inline-flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {appointment.serviceMinutes} min
                              </span>
                              <span>•</span>
                              <span>{formatAppointmentType(appointment.appointmentType)}</span>
                              {appointment.pet && (
                                <>
                                  <span>•</span>
                                  <span className="inline-flex items-center gap-1">
                                    <PawPrint className="h-3 w-3" />
                                    {appointment.pet.name}
                                  </span>
                                </>
                              )}
                              <span>•</span>
                              <span className="font-medium text-gray-900">${appointment.price}</span>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Actions for scheduled appointments */}
                      {isScheduled && isUpcoming && !isEditing && (
                        <div className="flex gap-2 sm:flex-col">
                          <button
                            onClick={() => startEditingAppointment(appointment)}
                            className="btn btn-sm btn-ghost gap-1 text-[#A5744A] hover:bg-orange-50"
                          >
                            <Edit2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Edit Time</span>
                            <span className="sm:hidden">Edit</span>
                          </button>
                          <button
                            onClick={() => cancelAppointment(appointment.id)}
                            disabled={isCancelling}
                            className="btn btn-sm btn-ghost gap-1 text-red-600 hover:bg-red-50"
                          >
                            {isCancelling ? (
                              <span className="loading loading-spinner loading-xs"></span>
                            ) : (
                              <X className="h-3 w-3" />
                            )}
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {customer.appointments.length > 5 && (
          <div className="mt-4 text-center">
            <Link
              href={`/dashboard/appointments?customerId=${customerId}`}
              className="text-[#A5744A] hover:underline text-sm font-medium"
            >
              View all {customer.appointments.length} appointments
            </Link>
          </div>
        )}
      </div>

      {/* Waitlist Section */}
      <div className="bg-white rounded-lg shadow p-6 mt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-purple-500" />
            <h2 className="text-lg font-semibold text-gray-900">Gap-Fill Waitlist</h2>
          </div>
          {waitlistEntry ? (
            <button
              onClick={handleRemoveFromWaitlist}
              disabled={isSavingWaitlist}
              className="btn btn-sm btn-ghost gap-2 text-red-600 hover:bg-red-50"
            >
              {isSavingWaitlist ? (
                <span className="loading loading-spinner loading-xs"></span>
              ) : (
                <BellOff className="h-4 w-4" />
              )}
              Remove
            </button>
          ) : !showWaitlistForm ? (
            <button
              onClick={() => setShowWaitlistForm(true)}
              className="btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
            >
              <Plus className="h-4 w-4" />
              Add to Waitlist
            </button>
          ) : null}
        </div>

        {waitlistEntry && !showWaitlistForm ? (
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="h-5 w-5 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 mb-2">
                  {customer.name} is on the waitlist
                </p>
                <div className="space-y-2 text-sm text-gray-600">
                  {waitlistEntry.preferredDays.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Preferred days:</span>
                      <div className="flex flex-wrap gap-1">
                        {waitlistEntry.preferredDays.map((day) => (
                          <span
                            key={day}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                          >
                            {day.charAt(0) + day.slice(1).toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {waitlistEntry.preferredTimes.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Preferred times:</span>
                      <div className="flex flex-wrap gap-1">
                        {waitlistEntry.preferredTimes.map((time) => (
                          <span
                            key={time}
                            className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium"
                          >
                            {time.charAt(0) + time.slice(1).toLowerCase()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {waitlistEntry.flexibleTiming && (
                    <p className="text-purple-600 text-xs">
                      Flexible timing enabled - can fill any gap
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowWaitlistForm(true)}
                  className="mt-3 text-sm text-[#A5744A] hover:underline font-medium"
                >
                  Edit preferences
                </button>
              </div>
            </div>
          </div>
        ) : showWaitlistForm ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              When you have a schedule gap, we&apos;ll suggest {customer.name} as a potential fill-in based on their preferences.
            </p>

            {/* Day preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Days
              </label>
              <div className="flex flex-wrap gap-2">
                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map(
                  (day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        waitlistDays.includes(day)
                          ? "bg-purple-500 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {day.charAt(0) + day.slice(1, 3).toLowerCase()}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Time preferences */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Times
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "MORNING", label: "Morning (8am-12pm)" },
                  { value: "AFTERNOON", label: "Afternoon (12pm-5pm)" },
                  { value: "EVENING", label: "Evening (5pm+)" },
                ].map((time) => (
                  <button
                    key={time.value}
                    type="button"
                    onClick={() => toggleTime(time.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      waitlistTimes.includes(time.value)
                        ? "bg-purple-500 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Flexible timing */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="flexibleTiming"
                checked={waitlistFlexible}
                onChange={(e) => setWaitlistFlexible(e.target.checked)}
                className="checkbox checkbox-sm checkbox-primary"
              />
              <label htmlFor="flexibleTiming" className="text-sm text-gray-700">
                Flexible timing - can fill any gap, even outside preferences
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSaveWaitlist}
                disabled={isSavingWaitlist}
                className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
              >
                {isSavingWaitlist ? (
                  <span className="loading loading-spinner loading-sm"></span>
                ) : (
                  <Check className="h-4 w-4" />
                )}
                {waitlistEntry ? "Update" : "Add to Waitlist"}
              </button>
              <button
                onClick={() => {
                  setShowWaitlistForm(false);
                  if (waitlistEntry) {
                    setWaitlistDays(waitlistEntry.preferredDays);
                    setWaitlistTimes(waitlistEntry.preferredTimes);
                    setWaitlistFlexible(waitlistEntry.flexibleTiming);
                  }
                }}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl">
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Bell className="h-7 w-7 text-purple-500" />
            </div>
            <h3 className="text-base font-medium text-gray-900 mb-1">Fill your gaps faster</h3>
            <p className="text-gray-600 text-sm mb-4 max-w-xs mx-auto">
              Add {customer.name} to your waitlist to be suggested when you have schedule openings
            </p>
            <button
              onClick={() => setShowWaitlistForm(true)}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-4"
            >
              <Plus className="h-4 w-4" />
              Add to Waitlist
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
