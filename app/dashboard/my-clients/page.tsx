"use client";

import { useEffect, useState } from "react";
import {
  Users,
  Search,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  PawPrint,
  AlertTriangle,
  Calendar,
  Clock,
  Info,
} from "lucide-react";

interface Pet {
  id: string;
  name: string;
  breed: string | null;
  species: string | null;
  weight: number | null;
  notes: string | null;
  groomingNotes: string | null;
  behaviorNotes: string | null;
  behaviorFlags: string[];
  specialHandling: string | null;
}

interface Appointment {
  id: string;
  startAt: string;
  status: string;
  appointmentType: string;
  pet: { name: string } | null;
}

interface Client {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string;
  addressNotes: string | null;
  accessInstructions: string | null;
  notes: string | null;
  pets: Pet[];
  appointments: Appointment[];
}

export default function MyClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const response = await fetch("/api/groomer/clients");
      if (response.ok) {
        const data = await response.json();
        setClients(data.clients || []);
      }
    } catch (error) {
      console.error("Failed to fetch clients:", error);
    } finally {
      setIsLoading(false);
    }
  }

  const filteredClients = clients.filter((client) => {
    const query = searchQuery.toLowerCase();
    return (
      client.name.toLowerCase().includes(query) ||
      client.pets.some((pet) => pet.name.toLowerCase().includes(query)) ||
      client.address.toLowerCase().includes(query)
    );
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getBehaviorFlagColor = (flag: string) => {
    switch (flag) {
      case "BITE_RISK":
      case "AGGRESSIVE":
        return "bg-red-100 text-red-700 border-red-200";
      case "MUZZLE_REQUIRED":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "ANXIOUS":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "FRIENDLY":
        return "bg-green-100 text-green-700 border-green-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const formatBehaviorFlag = (flag: string) => {
    return flag.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <Users className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Clients</h1>
            <p className="text-gray-600">
              View your assigned clients and their pet details
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients or pets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A5744A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Clients List */}
      {filteredClients.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery ? "No clients found" : "No clients yet"}
          </h3>
          <p className="text-gray-500">
            {searchQuery
              ? "Try a different search term"
              : "Clients will appear here once you have appointments scheduled"}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white rounded-xl shadow overflow-hidden"
            >
              {/* Client Header */}
              <button
                onClick={() =>
                  setSelectedClient(
                    selectedClient?.id === client.id ? null : client
                  )
                }
                className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                    <span className="text-emerald-700 font-semibold text-lg">
                      {client.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold text-gray-900">{client.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <PawPrint className="h-3.5 w-3.5" />
                      <span>
                        {client.pets.length} pet{client.pets.length !== 1 ? "s" : ""}
                      </span>
                      {client.pets.some((p) => p.behaviorFlags.length > 0) && (
                        <span className="flex items-center gap-1 text-amber-600">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Has notes
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ChevronRight
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    selectedClient?.id === client.id ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* Expanded Client Details */}
              {selectedClient?.id === client.id && (
                <div className="border-t bg-gray-50 p-4">
                  {/* Contact & Address */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      {client.phone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a
                            href={`tel:${client.phone}`}
                            className="text-[#A5744A] hover:underline"
                          >
                            {client.phone}
                          </a>
                        </div>
                      )}
                      {client.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-600">{client.email}</span>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-600">{client.address}</span>
                      </div>
                    </div>
                  </div>

                  {/* Address Notes & Access Instructions */}
                  {(client.addressNotes || client.accessInstructions) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-amber-700 font-medium text-sm mb-1">
                        <Info className="h-4 w-4" />
                        Access Information
                      </div>
                      {client.addressNotes && (
                        <p className="text-sm text-amber-800 mb-1">
                          {client.addressNotes}
                        </p>
                      )}
                      {client.accessInstructions && (
                        <p className="text-sm text-amber-800">
                          {client.accessInstructions}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Client Notes */}
                  {client.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-blue-800">{client.notes}</p>
                    </div>
                  )}

                  {/* Pets */}
                  <div className="mb-4">
                    <h4 className="font-medium text-gray-900 mb-2">Pets</h4>
                    <div className="space-y-2">
                      {client.pets.map((pet) => (
                        <div key={pet.id}>
                          <button
                            onClick={() =>
                              setSelectedPet(
                                selectedPet?.id === pet.id ? null : pet
                              )
                            }
                            className="w-full bg-white border rounded-lg p-3 flex items-center justify-between hover:border-[#A5744A] transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                                <PawPrint className="h-5 w-5 text-purple-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-medium text-gray-900">
                                  {pet.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {pet.breed || pet.species || "Unknown breed"}
                                  {pet.weight && ` • ${pet.weight} lbs`}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {pet.behaviorFlags.map((flag) => (
                                <span
                                  key={flag}
                                  className={`text-xs px-2 py-0.5 rounded border ${getBehaviorFlagColor(
                                    flag
                                  )}`}
                                >
                                  {formatBehaviorFlag(flag)}
                                </span>
                              ))}
                              <ChevronRight
                                className={`h-4 w-4 text-gray-400 transition-transform ${
                                  selectedPet?.id === pet.id ? "rotate-90" : ""
                                }`}
                              />
                            </div>
                          </button>

                          {/* Expanded Pet Details */}
                          {selectedPet?.id === pet.id && (
                            <div className="mt-2 ml-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                              {pet.groomingNotes && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                                    Grooming Notes
                                  </p>
                                  <p className="text-sm text-purple-900">
                                    {pet.groomingNotes}
                                  </p>
                                </div>
                              )}
                              {pet.behaviorNotes && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                                    Behavior Notes
                                  </p>
                                  <p className="text-sm text-purple-900">
                                    {pet.behaviorNotes}
                                  </p>
                                </div>
                              )}
                              {pet.specialHandling && (
                                <div className="mb-2">
                                  <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                                    Special Handling
                                  </p>
                                  <p className="text-sm text-purple-900">
                                    {pet.specialHandling}
                                  </p>
                                </div>
                              )}
                              {pet.notes && (
                                <div>
                                  <p className="text-xs font-medium text-purple-700 uppercase mb-1">
                                    General Notes
                                  </p>
                                  <p className="text-sm text-purple-900">
                                    {pet.notes}
                                  </p>
                                </div>
                              )}
                              {!pet.groomingNotes &&
                                !pet.behaviorNotes &&
                                !pet.specialHandling &&
                                !pet.notes && (
                                  <p className="text-sm text-purple-600 italic">
                                    No additional notes for this pet
                                  </p>
                                )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recent Appointments */}
                  {client.appointments.length > 0 && (
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">
                        Recent Appointments
                      </h4>
                      <div className="space-y-2">
                        {client.appointments.map((apt) => (
                          <div
                            key={apt.id}
                            className="flex items-center justify-between bg-white border rounded-lg p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {formatDate(apt.startAt)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {apt.pet?.name || "No pet specified"} •{" "}
                                  {apt.appointmentType.replace(/_/g, " ")}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded ${
                                apt.status === "COMPLETED"
                                  ? "bg-green-100 text-green-700"
                                  : apt.status === "CANCELLED"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
