"use client";

import { useEffect, useState } from "react";
import { Navigation, MapPin, Clock, Phone, AlertCircle, Copy, CheckCircle2, Zap, Locate, ChevronDown, ChevronUp, ExternalLink, MessageSquare } from "lucide-react";
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
    locationVerified: boolean;
  };
  pet: {
    name: string;
    size: string;
  } | null;
}

export default function TodaysRoutePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [routeStats, setRouteStats] = useState<{
    totalDistance?: number;
    estimatedDriveTime?: number;
  } | null>(null);
  const [showStartLocation, setShowStartLocation] = useState(false);
  const [startAddress, setStartAddress] = useState("");
  const [startLat, setStartLat] = useState<number | null>(null);
  const [startLng, setStartLng] = useState<number | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [contactMethods, setContactMethods] = useState<string[]>(["call", "sms"]);

  useEffect(() => {
    fetchTodaysRoute();
    fetchContactMethods();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  async function fetchContactMethods() {
    try {
      const response = await fetch('/api/dashboard/today');
      if (response.ok) {
        const data = await response.json();
        if (data.contactMethods) {
          setContactMethods(data.contactMethods);
        }
      }
    } catch (error) {
      console.error("Error fetching contact methods:", error);
    }
  }

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

  function handleCall(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function handleSMS(phone: string) {
    window.location.href = `sms:${phone}`;
  }

  function handleWhatsApp(phone: string) {
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/1${cleanPhone}`, '_blank');
  }

  function handleSignal(phone: string) {
    window.location.href = `signal://send?phone=${phone}`;
  }

  function handleTelegram(phone: string) {
    window.location.href = `tg://resolve?phone=${phone}`;
  }

  async function getCurrentLocation() {
    setIsGettingLocation(true);
    try {
      if (!navigator.geolocation) {
        toast.error("Geolocation is not supported by your browser");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          setStartLat(lat);
          setStartLng(lng);
          setStartAddress(`Current Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
          toast.success("Location detected!");
          setIsGettingLocation(false);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Could not get your location. Please enter address manually.");
          setIsGettingLocation(false);
        }
      );
    } catch (error) {
      console.error("Location error:", error);
      toast.error("Failed to get location");
      setIsGettingLocation(false);
    }
  }

  async function geocodeStartAddress() {
    if (!startAddress) {
      toast.error("Please enter a starting address");
      return;
    }

    setIsGettingLocation(true);
    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: startAddress }),
      });

      const data = await response.json();

      if (data.success && data.lat && data.lng) {
        setStartLat(data.lat);
        setStartLng(data.lng);
        toast.success("Starting location found!");
      } else {
        toast.error("Could not find this address. Please try again.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Failed to geocode address");
    } finally {
      setIsGettingLocation(false);
    }
  }

  function exportToGoogleMaps() {
    // Get incomplete appointments with verified locations
    const validAppointments = unoptimizedAppointments.filter(
      (apt) => apt.customer.address
    );

    if (validAppointments.length === 0) {
      toast.error("No appointments to export");
      return;
    }

    // Build Google Maps directions URL with waypoints
    let url = "https://www.google.com/maps/dir/";

    // Add starting location if set
    if (startAddress) {
      url += encodeURIComponent(startAddress) + "/";
    }

    // Add all appointment addresses as waypoints
    validAppointments.forEach((apt) => {
      url += encodeURIComponent(apt.customer.address) + "/";
    });

    // Open in new tab
    window.open(url, '_blank');
    toast.success(`Opened route with ${validAppointments.length} stops in Google Maps`);
  }

  async function optimizeRoute() {
    setIsOptimizing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload: any = { date: today };

      // Include starting location if provided
      if (startLat !== null && startLng !== null) {
        payload.startLat = startLat;
        payload.startLng = startLng;
      }

      const response = await fetch('/api/routes/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Failed to optimize route");
      }

      const data = await response.json();

      if (data.success) {
        toast.success(data.message);
        setRouteStats({
          totalDistance: data.totalDistance,
          estimatedDriveTime: data.estimatedDriveTime,
        });
        // Refresh appointments to show new order
        await fetchTodaysRoute();
      } else {
        toast.error(data.message || "Could not optimize route");
      }
    } catch (error) {
      console.error("Route optimization error:", error);
      toast.error("Failed to optimize route");
    } finally {
      setIsOptimizing(false);
    }
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

  const unoptimizedAppointments = appointments.filter(
    (apt) => apt.status !== "COMPLETED" && apt.status !== "CANCELLED"
  );
  const hasUnverifiedLocations = unoptimizedAppointments.some(
    (apt) => !apt.customer.locationVerified
  );

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Today&apos;s Route</h1>
            <p className="text-gray-600">{appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          {unoptimizedAppointments.length > 0 && (
            <div className="flex gap-2">
              {unoptimizedAppointments.length > 1 && (
                <button
                  onClick={optimizeRoute}
                  disabled={isOptimizing}
                  className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
                >
                  {isOptimizing ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    <Zap className="h-5 w-5" />
                  )}
                  Optimize Route
                </button>
              )}
              <button
                onClick={exportToGoogleMaps}
                className="btn h-12 btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white hover:border-[#A5744A] gap-2"
              >
                <Navigation className="h-5 w-5" />
                Start Driving
              </button>
            </div>
          )}
        </div>

        {/* Starting Location Section */}
        {unoptimizedAppointments.length > 1 && (
          <div className="mt-4">
            <button
              onClick={() => setShowStartLocation(!showStartLocation)}
              className="flex items-center gap-2 text-sm text-[#A5744A] font-medium hover:text-[#8B6239]"
            >
              {showStartLocation ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              Set starting location (optional)
            </button>

            {showStartLocation && (
              <div className="mt-3 p-4 bg-white rounded-lg border border-gray-200 space-y-3">
                <p className="text-sm text-gray-600">
                  Optimize route from your current location or a specific address
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={getCurrentLocation}
                    disabled={isGettingLocation}
                    className="btn btn-sm h-10 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
                  >
                    {isGettingLocation ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <Locate className="h-4 w-4" />
                    )}
                    Use Current Location
                  </button>

                  {startLat && startLng && (
                    <button
                      onClick={() => {
                        setStartLat(null);
                        setStartLng(null);
                        setStartAddress("");
                      }}
                      className="btn btn-sm h-10 btn-ghost gap-2"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="divider text-xs text-gray-500">OR</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={startAddress}
                    onChange={(e) => setStartAddress(e.target.value)}
                    placeholder="Enter starting address"
                    className="input input-bordered flex-1 h-10"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        geocodeStartAddress();
                      }
                    }}
                  />
                  <button
                    onClick={geocodeStartAddress}
                    disabled={!startAddress || isGettingLocation}
                    className="btn btn-sm h-10 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
                  >
                    Set
                  </button>
                </div>

                {startLat && startLng && (
                  <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-200">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Starting location set: {startAddress || `${startLat.toFixed(4)}, ${startLng.toFixed(4)}`}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Route Stats */}
        {routeStats && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-green-900">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">{routeStats.totalDistance} miles</span>
              </div>
              <div className="flex items-center gap-1 text-green-900">
                <Clock className="h-4 w-4" />
                <span className="font-medium">~{routeStats.estimatedDriveTime} min drive time</span>
              </div>
            </div>
          </div>
        )}

        {/* Warning for unverified locations */}
        {hasUnverifiedLocations && unoptimizedAppointments.length > 1 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Some locations haven&apos;t been verified. Verify locations on customer profiles for better route optimization.
              </p>
            </div>
          </div>
        )}
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
            Start Driving
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
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-gray-900">{appointment.customer.name}</h3>
                {appointment.customer.locationVerified && (
                  <span className="badge badge-success badge-sm gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>
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
              <div className="space-y-2 mt-3">
                {/* Contact Methods Row */}
                {appointment.customer.phone && (
                  <div className="flex gap-2 flex-wrap">
                    {contactMethods.includes("call") && (
                      <button
                        onClick={() => handleCall(appointment.customer.phone!)}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    )}
                    {contactMethods.includes("sms") && (
                      <button
                        onClick={() => handleSMS(appointment.customer.phone!)}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </button>
                    )}
                    {contactMethods.includes("whatsapp") && (
                      <button
                        onClick={() => handleWhatsApp(appointment.customer.phone!)}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        💚 WhatsApp
                      </button>
                    )}
                    {contactMethods.includes("signal") && (
                      <button
                        onClick={() => handleSignal(appointment.customer.phone!)}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        🔵 Signal
                      </button>
                    )}
                    {contactMethods.includes("telegram") && (
                      <button
                        onClick={() => handleTelegram(appointment.customer.phone!)}
                        className="btn btn-sm btn-outline gap-1"
                      >
                        ✈️ Telegram
                      </button>
                    )}
                  </div>
                )}

                {/* Other Actions Row */}
                <div className="flex gap-2">
                  <button
                    onClick={() => copyAddress(appointment.customer.address)}
                    className="btn btn-sm btn-outline gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Address
                  </button>
                  <button
                    onClick={() => openInMaps(appointment.customer.address)}
                    className="btn btn-sm btn-primary gap-1"
                  >
                    <Navigation className="h-4 w-4" />
                    Navigate
                  </button>
                </div>
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
