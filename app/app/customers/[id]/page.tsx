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
  PawPrint
} from "lucide-react";
import toast from "react-hot-toast";

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

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  addressNotes?: string;
  accessInstructions?: string;
  pets: Pet[];
  appointments: Appointment[];
}

export default function CustomerEditPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    addressNotes: "",
    accessInstructions: "",
  });

  useEffect(() => {
    fetchCustomer();
  }, [customerId]);

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
        });
      } else {
        toast.error("Customer not found");
        router.push("/app/customers");
      }
    } catch (error) {
      console.error("Failed to fetch customer:", error);
      toast.error("Failed to load customer");
    } finally {
      setIsLoading(false);
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
        toast.success("Customer updated successfully");
        fetchCustomer();
      } else {
        toast.error("Failed to update customer");
      }
    } catch (error) {
      console.error("Failed to update customer:", error);
      toast.error("Failed to update customer");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this customer? This will also delete all associated pets and appointments.")) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/customers/${customerId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Customer deleted successfully");
        router.push("/app/customers");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to delete customer");
      }
    } catch (error) {
      console.error("Failed to delete customer:", error);
      toast.error("Failed to delete customer");
    } finally {
      setIsDeleting(false);
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
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          Edit Customer
        </h1>
      </div>

      {/* Customer Details Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Customer Information
        </h2>

        <div className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text font-medium">Name *</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input input-bordered w-full h-12"
              placeholder="Customer name"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">Phone</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input input-bordered w-full h-12 pl-10"
                  placeholder="555-123-4567"
                />
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-medium">Email</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="input input-bordered w-full h-12 pl-10"
                  placeholder="customer@email.com"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Address *</span>
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input input-bordered w-full h-12 pl-10"
                placeholder="123 Main St, City, State ZIP"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Address Notes</span>
            </label>
            <textarea
              value={formData.addressNotes}
              onChange={(e) => setFormData({ ...formData, addressNotes: e.target.value })}
              className="textarea textarea-bordered w-full"
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
              className="textarea textarea-bordered w-full"
              placeholder="e.g., Gate code 1234, dog door in back"
              rows={2}
            />
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
            className="btn h-12 btn-error text-white gap-2"
          >
            {isDeleting ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
            Delete
          </button>
        </div>
      </div>

      {/* Pets Section */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Pets</h2>
          <Link
            href={`/app/customers/${customerId}/pets/new`}
            className="btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Pet
          </Link>
        </div>

        {customer.pets.length === 0 ? (
          <div className="text-center py-8">
            <PawPrint className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pets added yet</p>
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
                  href={`/app/customers/${customerId}/pets/${pet.id}`}
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
          <h2 className="text-lg font-semibold text-gray-900">Appointments</h2>
          <Link
            href={`/app/appointments/new?customerId=${customerId}`}
            className="btn btn-sm h-9 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
          >
            <Plus className="h-4 w-4" />
            Book Appointment
          </Link>
        </div>

        {customer.appointments.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No appointments scheduled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {customer.appointments
              .sort((a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime())
              .slice(0, 5)
              .map((appointment) => {
                const date = new Date(appointment.startAt);
                const isUpcoming = date > new Date();

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="h-4 w-4 text-[#A5744A]" />
                        <h3 className="font-medium text-gray-900">
                          {date.toLocaleDateString("en-US", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h3>
                        <span className={`badge badge-sm ${isUpcoming ? 'badge-success' : 'badge-ghost'}`}>
                          {appointment.status}
                        </span>
                      </div>
                      <div className="flex gap-3 text-sm text-gray-600">
                        <span>{date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
                        <span>• {appointment.appointmentType}</span>
                        {appointment.pet && <span>• {appointment.pet.name}</span>}
                        <span>• ${appointment.price}</span>
                      </div>
                    </div>
                    <Link
                      href={`/app/appointments/${appointment.id}`}
                      className="btn btn-ghost btn-sm gap-2"
                    >
                      View
                    </Link>
                  </div>
                );
              })}
          </div>
        )}

        {customer.appointments.length > 5 && (
          <div className="mt-4 text-center">
            <Link
              href={`/app/appointments?customerId=${customerId}`}
              className="text-[#A5744A] hover:underline text-sm font-medium"
            >
              View all {customer.appointments.length} appointments
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
