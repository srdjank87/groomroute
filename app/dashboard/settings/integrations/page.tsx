"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  ExternalLink,
  Loader2,
  Unlink,
  Download,
  X,
  ChevronRight,
  AlertCircle,
  Clock,
  MapPin,
  User,
  Search,
  Send,
  CheckCircle2,
  HelpCircle,
} from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string | null;
  description: string | null;
  location: string | null;
  start: string;
  end: string;
  parsedClientName: string | null;
  parsedAddress: string | null;
  durationMinutes: number;
  alreadyImported: boolean;
}

interface Customer {
  id: string;
  name: string;
  phone: string | null;
  address: string;
  pets: { id: string; name: string }[];
}

interface CalendarStatus {
  accessRequested: string | null;
  approved: boolean;
  connected: boolean;
  calendarId: string | null;
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<CalendarStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);

  // Import modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [isImporting, setIsImporting] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");

  // Check connection status on mount
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch("/api/integrations/google-calendar/status");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestAccess = async () => {
    setIsRequesting(true);
    try {
      const res = await fetch(
        "/api/integrations/google-calendar/request-access",
        {
          method: "POST",
        }
      );
      const data = await res.json();

      if (res.ok) {
        setRequestSuccess(true);
        // Update local status
        setStatus((prev) =>
          prev ? { ...prev, accessRequested: new Date().toISOString() } : null
        );
      } else {
        alert(data.error || "Failed to request access");
      }
    } catch (error) {
      console.error("Failed to request access:", error);
      alert("Failed to request access");
    } finally {
      setIsRequesting(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const res = await fetch("/api/integrations/google-calendar/connect");
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Failed to connect:", error);
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (
      !confirm(
        "Are you sure you want to disconnect Google Calendar? Existing calendar events will not be deleted, but future appointments will no longer sync."
      )
    ) {
      return;
    }

    setIsDisconnecting(true);
    try {
      await fetch("/api/integrations/google-calendar/disconnect", {
        method: "POST",
      });
      setStatus((prev) => (prev ? { ...prev, connected: false } : null));
    } catch (error) {
      console.error("Failed to disconnect:", error);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const openImportModal = async () => {
    setShowImportModal(true);
    setIsLoadingEvents(true);
    setSelectedEvent(null);
    setSelectedCustomerId("");
    setSelectedPetId("");
    setImportError(null);

    try {
      // Fetch events and customers in parallel
      const [eventsRes, customersRes] = await Promise.all([
        fetch("/api/integrations/google-calendar/events"),
        fetch("/api/customers"),
      ]);

      const eventsData = await eventsRes.json();
      const customersData = await customersRes.json();

      if (eventsData.events) {
        setEvents(eventsData.events);
      }
      if (customersData.customers) {
        setCustomers(customersData.customers);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setSelectedCustomerId("");
    setSelectedPetId("");
    setImportError(null);

    // Try to auto-match customer by name
    if (event.parsedClientName) {
      const matchedCustomer = customers.find(
        (c) =>
          c.name.toLowerCase().includes(event.parsedClientName!.toLowerCase()) ||
          event.parsedClientName!.toLowerCase().includes(c.name.toLowerCase())
      );
      if (matchedCustomer) {
        setSelectedCustomerId(matchedCustomer.id);
        // Auto-select first pet if available
        if (matchedCustomer.pets.length === 1) {
          setSelectedPetId(matchedCustomer.pets[0].id);
        }
      }
    }
  };

  const handleImportEvent = async () => {
    if (!selectedEvent || !selectedCustomerId) return;

    setIsImporting(true);
    setImportError(null);

    try {
      const res = await fetch("/api/integrations/google-calendar/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: selectedEvent.id,
          customerId: selectedCustomerId,
          petId: selectedPetId || undefined,
          serviceMinutes: selectedEvent.durationMinutes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setImportError(data.error || "Failed to import event");
        return;
      }

      // Mark event as imported and clear selection
      setEvents((prev) =>
        prev.map((e) =>
          e.id === selectedEvent.id ? { ...e, alreadyImported: true } : e
        )
      );
      setSelectedEvent(null);
      setSelectedCustomerId("");
      setSelectedPetId("");
    } catch (error) {
      setImportError("Failed to import event");
    } finally {
      setIsImporting(false);
    }
  };

  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const filteredCustomers = customerSearch
    ? customers.filter(
        (c) =>
          c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
          c.address.toLowerCase().includes(customerSearch.toLowerCase())
      )
    : customers;

  const pendingEvents = events.filter((e) => !e.alreadyImported);

  // Determine the current state
  const isConnected = status?.connected ?? false;
  const isApproved = status?.approved ?? false;
  const isPending = !!status?.accessRequested && !isApproved;
  const canRequest = !status?.accessRequested && !isApproved && !isConnected;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-100 rounded-lg">
            <Calendar className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">
              Connect external services to enhance your workflow
            </p>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5 4H4.5C3.67157 4 3 4.67157 3 5.5V18.5C3 19.3284 3.67157 20 4.5 20H19.5C20.3284 20 21 19.3284 21 18.5V5.5C21 4.67157 20.3284 4 19.5 4Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M3 8H21V5.5C21 4.67157 20.3284 4 19.5 4H4.5C3.67157 4 3 4.67157 3 5.5V8Z"
                    fill="#1967D2"
                  />
                  <path
                    d="M8 12H10V14H8V12ZM11 12H13V14H11V12ZM14 12H16V14H14V12ZM8 15H10V17H8V15ZM11 15H13V17H11V15Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Google Calendar
                  </h2>
                  {isLoading ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Checking...
                    </span>
                  ) : isConnected ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <Check className="h-3 w-3" />
                      Connected
                    </span>
                  ) : isApproved ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                      <CheckCircle2 className="h-3 w-3" />
                      Ready to Connect
                    </span>
                  ) : isPending ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                      <Clock className="h-3 w-3" />
                      Pending Approval
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-sky-100 text-sky-700">
                      Beta
                    </span>
                  )}
                </div>
                <p className="text-gray-600 mt-1">
                  {isConnected
                    ? "Your appointments automatically sync to Google Calendar. You can also import existing calendar events as appointments."
                    : isApproved
                    ? "You're approved! Click below to connect your Google Calendar."
                    : isPending
                    ? "We've received your request. We'll email you once your account is set up for Google Calendar access."
                    : "Sync appointments to Google Calendar and import existing events."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          {isLoading ? (
            <div className="h-8" />
          ) : isConnected ? (
            <div className="flex items-center gap-3">
              <button
                onClick={openImportModal}
                className="btn btn-sm bg-sky-500 hover:bg-sky-600 text-white border-0"
              >
                <Download className="h-4 w-4 mr-1" />
                Import Events
              </button>
              <button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                className="btn btn-sm btn-ghost text-gray-600"
              >
                {isDisconnecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-1" />
                ) : (
                  <Unlink className="h-4 w-4 mr-1" />
                )}
                Disconnect
              </button>
            </div>
          ) : isApproved ? (
            <button
              onClick={handleConnect}
              disabled={isConnecting}
              className="btn btn-sm bg-sky-500 hover:bg-sky-600 text-white border-0"
            >
              {isConnecting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-1" />
              )}
              Connect Google Calendar
            </button>
          ) : isPending || requestSuccess ? (
            <div className="flex items-center gap-2 text-amber-700">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-medium">
                Request submitted - we'll email you when ready
              </span>
            </div>
          ) : (
            <button
              onClick={handleRequestAccess}
              disabled={isRequesting}
              className="btn btn-sm bg-sky-500 hover:bg-sky-600 text-white border-0"
            >
              {isRequesting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <Send className="h-4 w-4 mr-1" />
              )}
              Request Beta Access
            </button>
          )}
        </div>
      </div>

      {/* Info Box - contextual based on state */}
      {isConnected ? (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
          <h3 className="font-medium text-blue-900 mb-2">How it works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>
              - New appointments automatically sync to your Google Calendar
            </li>
            <li>- Updates and cancellations sync in real-time</li>
            <li>
              - Import existing calendar events to quickly add past appointments
            </li>
          </ul>
        </div>
      ) : (
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <HelpCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-amber-900 mb-1">
                Why do I need to request access?
              </h3>
              <p className="text-sm text-amber-800">
                Google Calendar integration is in beta while we complete
                Google's app verification process. We manually add each user to
                our approved list - this usually takes less than 24 hours. Once
                approved, you can connect your calendar and start syncing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Import Calendar Events
                </h2>
                <p className="text-sm text-gray-600">
                  Select events to import as appointments
                </p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-hidden flex min-h-[400px]">
              {isLoadingEvents ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
                </div>
              ) : (
                <>
                  {/* Events List */}
                  <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
                    <div className="p-4">
                      <h3 className="text-sm font-medium text-gray-700 mb-3">
                        Upcoming Events ({pendingEvents.length})
                      </h3>
                      {pendingEvents.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>No events to import</p>
                          <p className="text-sm mt-1">
                            All events from the next 30 days have been imported
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {pendingEvents.map((event) => (
                            <button
                              key={event.id}
                              onClick={() => handleSelectEvent(event)}
                              className={`w-full text-left p-3 rounded-lg border transition-colors ${
                                selectedEvent?.id === event.id
                                  ? "border-sky-500 bg-sky-50"
                                  : "border-gray-200 hover:border-gray-300 bg-white"
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium text-gray-900 truncate">
                                    {event.summary || "Untitled Event"}
                                  </p>
                                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                                    <Clock className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span>
                                      {new Date(event.start).toLocaleDateString(
                                        "en-US",
                                        {
                                          weekday: "short",
                                          month: "short",
                                          day: "numeric",
                                        }
                                      )}{" "}
                                      at{" "}
                                      {new Date(event.start).toLocaleTimeString(
                                        "en-US",
                                        {
                                          hour: "numeric",
                                          minute: "2-digit",
                                        }
                                      )}
                                    </span>
                                  </div>
                                  {event.location && (
                                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                      <span className="truncate">
                                        {event.location}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Import Form */}
                  <div className="w-1/2 overflow-y-auto">
                    {selectedEvent ? (
                      <div className="p-4">
                        <h3 className="text-sm font-medium text-gray-700 mb-3">
                          Link to Client
                        </h3>

                        {/* Event Preview */}
                        <div className="bg-gray-50 rounded-lg p-3 mb-4">
                          <p className="font-medium text-gray-900">
                            {selectedEvent.summary || "Untitled Event"}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(selectedEvent.start).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              }
                            )}{" "}
                            at{" "}
                            {new Date(selectedEvent.start).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">
                            Duration: {selectedEvent.durationMinutes} minutes
                          </p>
                        </div>

                        {/* Customer Search */}
                        <div className="mb-3">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Client *
                          </label>
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search clients..."
                              value={customerSearch}
                              onChange={(e) =>
                                setCustomerSearch(e.target.value)
                              }
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                            />
                          </div>
                        </div>

                        {/* Customer List */}
                        <div className="border border-gray-200 rounded-lg max-h-48 overflow-y-auto mb-4">
                          {filteredCustomers.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm">
                              No clients found
                            </div>
                          ) : (
                            filteredCustomers.map((customer) => (
                              <button
                                key={customer.id}
                                onClick={() => {
                                  setSelectedCustomerId(customer.id);
                                  setSelectedPetId("");
                                  if (customer.pets.length === 1) {
                                    setSelectedPetId(customer.pets[0].id);
                                  }
                                }}
                                className={`w-full text-left px-3 py-2 border-b border-gray-100 last:border-b-0 transition-colors ${
                                  selectedCustomerId === customer.id
                                    ? "bg-sky-50"
                                    : "hover:bg-gray-50"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4 text-gray-400" />
                                  <span className="font-medium text-gray-900">
                                    {customer.name}
                                  </span>
                                  {selectedCustomerId === customer.id && (
                                    <Check className="h-4 w-4 text-sky-500 ml-auto" />
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 ml-6 truncate">
                                  {customer.address}
                                </p>
                              </button>
                            ))
                          )}
                        </div>

                        {/* Pet Selection */}
                        {selectedCustomer &&
                          selectedCustomer.pets.length > 0 && (
                            <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Select Pet (optional)
                              </label>
                              <select
                                value={selectedPetId}
                                onChange={(e) =>
                                  setSelectedPetId(e.target.value)
                                }
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                              >
                                <option value="">No pet selected</option>
                                {selectedCustomer.pets.map((pet) => (
                                  <option key={pet.id} value={pet.id}>
                                    {pet.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                        {/* Error */}
                        {importError && (
                          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700">{importError}</p>
                          </div>
                        )}

                        {/* Import Button */}
                        <button
                          onClick={handleImportEvent}
                          disabled={!selectedCustomerId || isImporting}
                          className="w-full btn bg-sky-500 hover:bg-sky-600 text-white border-0 disabled:bg-gray-300 disabled:text-gray-500"
                        >
                          {isImporting ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              Importing...
                            </>
                          ) : (
                            <>
                              <Download className="h-4 w-4 mr-2" />
                              Import as Appointment
                            </>
                          )}
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center h-full text-center p-8">
                        <div className="text-gray-500">
                          <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p>Select an event to import</p>
                          <p className="text-sm mt-1">
                            Choose from the list on the left
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
