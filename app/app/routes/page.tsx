"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Navigation, MapPin, Clock, Phone, AlertCircle, Copy, CheckCircle2, Zap, MessageSquare, UserPlus, Coffee, X, Play, ThumbsUp, CheckCircle, SkipForward, AlertTriangle } from "lucide-react";
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
    serviceArea?: {
      id: string;
      name: string;
      color: string;
    } | null;
  };
  pet: {
    name: string;
    size: string;
    weight?: number;
    breed?: string;
  } | null;
}

interface RouteDetails {
  stops: number;
  avgMinutesBetweenStops: number;
  totalDriveMinutes: number;
  formattedDriveTime: string;
  efficiency: string;
  totalDistanceMiles: number;
}

interface OptimizationResult {
  success: boolean;
  message: string;
  estimatedFinish: string | null;
  appointmentsOptimized: number;
  routeDetails?: RouteDetails;
}

interface BreakSuggestion {
  shouldSuggest: boolean;
  reason: string;
  message: string;
  subtext: string;
  breakType: "lunch" | "short" | "hydration";
  availableMinutes: number;
  suggestedDurationMinutes: number;
}

interface AssistantStatus {
  hasAssistant: boolean;
  defaultHasAssistant: boolean;
  hasRouteForToday: boolean;
}

interface TodayAreaDay {
  areaId: string;
  areaName: string;
  areaColor: string;
}

export default function TodaysRoutePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [contactMethods, setContactMethods] = useState<string[]>(["call", "sms"]);
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus | null>(null);
  const [isTogglingAssistant, setIsTogglingAssistant] = useState(false);
  const [breakSuggestion, setBreakSuggestion] = useState<BreakSuggestion | null>(null);
  const [isTakingBreak, setIsTakingBreak] = useState(false);
  const [showBreakSuggestion, setShowBreakSuggestion] = useState(true);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [skipAppointmentId, setSkipAppointmentId] = useState<string | null>(null);
  const [skipReason, setSkipReason] = useState<string>("");
  const [skipNotes, setSkipNotes] = useState("");
  const [isSkipping, setIsSkipping] = useState(false);
  const [skipWarning, setSkipWarning] = useState<{
    message: string;
    customerName: string;
    cancellations: number;
    noShows: number;
    suggestions: string[];
  } | null>(null);
  const [todayAreaDay, setTodayAreaDay] = useState<TodayAreaDay | null>(null);
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeAppointmentId, setCompleteAppointmentId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    fetchTodaysRoute();
    fetchContactMethods();
    fetchAssistantStatus();
    fetchBreakSuggestion();
    fetchTodayAreaDay();

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

  async function fetchTodayAreaDay() {
    try {
      const response = await fetch('/api/area-assignments');
      if (response.ok) {
        const data = await response.json();
        // Find today's day of week
        const today = new Date().getDay(); // 0=Sunday, 1=Monday, etc.

        // Get the first groomer's assignment for today (most accounts have 1 groomer)
        if (data.assignments && data.assignments.length > 0) {
          const todayAssignment = data.assignments[0].days[today];
          if (todayAssignment) {
            setTodayAreaDay({
              areaId: todayAssignment.areaId,
              areaName: todayAssignment.areaName,
              areaColor: todayAssignment.areaColor,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error fetching today's area day:", error);
    }
  }

  async function fetchAssistantStatus() {
    try {
      const response = await fetch('/api/routes/assistant');
      if (response.ok) {
        const data = await response.json();
        setAssistantStatus(data);
      }
    } catch (error) {
      console.error("Error fetching assistant status:", error);
    }
  }

  async function fetchBreakSuggestion() {
    try {
      const response = await fetch('/api/breaks/suggest');
      if (response.ok) {
        const data = await response.json();
        if (data.suggestion?.shouldSuggest) {
          setBreakSuggestion(data.suggestion);
          setShowBreakSuggestion(true);
        } else {
          setBreakSuggestion(null);
        }
      }
    } catch (error) {
      console.error("Error fetching break suggestion:", error);
    }
  }

  async function toggleAssistant() {
    if (!assistantStatus) return;

    setIsTogglingAssistant(true);
    try {
      const newValue = !assistantStatus.hasAssistant;
      const response = await fetch('/api/routes/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hasAssistant: newValue }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setAssistantStatus(prev => prev ? { ...prev, hasAssistant: newValue } : null);
      } else {
        toast.error("Failed to update assistant status");
      }
    } catch (error) {
      console.error("Toggle assistant error:", error);
      toast.error("Failed to update assistant status");
    } finally {
      setIsTogglingAssistant(false);
    }
  }

  async function takeBreak(breakType: string) {
    setIsTakingBreak(true);
    try {
      const response = await fetch('/api/breaks/take', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          breakType: breakType.toUpperCase().replace(' ', '_'),
          durationMinutes: breakSuggestion?.suggestedDurationMinutes || 15,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        setBreakSuggestion(null);
        setShowBreakSuggestion(false);
      } else {
        toast.error("Failed to log break");
      }
    } catch (error) {
      console.error("Take break error:", error);
      toast.error("Failed to log break");
    } finally {
      setIsTakingBreak(false);
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

  // Format time from ISO string - display the UTC time as-is (not converted to local)
  // This is because we store appointment times as "intended display time" in UTC
  function formatTime(dateString: string): string {
    const date = new Date(dateString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes.toString().padStart(2, '0');
    return `${displayHours}:${displayMinutes} ${period}`;
  }

  // Format time range (start - end) for an appointment
  function formatTimeRange(startAt: string, serviceMinutes: number): string {
    const startDate = new Date(startAt);
    const endDate = new Date(startDate.getTime() + serviceMinutes * 60 * 1000);

    const formatTimeFromDate = (date: Date) => {
      const hours = date.getUTCHours();
      const minutes = date.getUTCMinutes();
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      const displayMinutes = minutes.toString().padStart(2, '0');
      return `${displayHours}:${displayMinutes} ${period}`;
    };

    return `${formatTimeFromDate(startDate)} - ${formatTimeFromDate(endDate)}`;
  }

  // Open complete confirmation modal
  function openCompleteConfirm(appointmentId: string) {
    setCompleteAppointmentId(appointmentId);
    setShowCompleteConfirm(true);
  }

  function closeCompleteConfirm() {
    setShowCompleteConfirm(false);
    setCompleteAppointmentId(null);
  }

  function getStatusColor(appointment: Appointment): string {
    if (appointment.status === "COMPLETED") return "bg-green-100 border-green-300";
    if (appointment.status === "CANCELLED") return "bg-gray-100 border-gray-300";
    if (appointment.status === "IN_PROGRESS") return "bg-yellow-100 border-yellow-300";
    if (appointment.status === "CONFIRMED") return "bg-emerald-50 border-emerald-200";

    return "bg-blue-50 border-blue-200";
  }

  function copyAddress(address: string) {
    navigator.clipboard.writeText(address);
    toast.success("Address copied!");
  }

  function openInMaps(address: string) {
    // Opens Google Maps with directions from current location to destination
    const encodedAddress = encodeURIComponent(address);
    // Using 'dir' mode with empty origin uses device's current location
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, '_blank');
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

    // Add all appointment addresses as waypoints
    validAppointments.forEach((apt) => {
      url += encodeURIComponent(apt.customer.address) + "/";
    });

    // Open in new tab
    window.open(url, '_blank');
    toast.success(`Opened route with ${validAppointments.length} stops in Google Maps`);
  }

  function openSkipModal(appointmentId: string) {
    setSkipAppointmentId(appointmentId);
    setSkipReason("");
    setSkipNotes("");
    setSkipWarning(null);
    setShowSkipModal(true);
  }

  function closeSkipModal() {
    setShowSkipModal(false);
    setSkipAppointmentId(null);
    setSkipReason("");
    setSkipNotes("");
    setSkipWarning(null);
  }

  async function handleSkipAppointment() {
    if (!skipAppointmentId || !skipReason) {
      toast.error("Please select a reason");
      return;
    }

    setIsSkipping(true);
    try {
      const response = await fetch(`/api/appointments/${skipAppointmentId}/skip`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: skipReason,
          notes: skipNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Appointment skipped");

        // Show warning modal if customer has issues
        if (data.warning) {
          setSkipWarning(data.warning);
        } else {
          closeSkipModal();
        }

        await fetchTodaysRoute();
        await fetchBreakSuggestion();
      } else {
        toast.error("Failed to skip appointment");
      }
    } catch (error) {
      console.error("Skip appointment error:", error);
      toast.error("Failed to skip appointment");
    } finally {
      setIsSkipping(false);
    }
  }

  async function handleConfirmAppointment(appointmentId: string) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CONFIRMED" }),
      });

      if (response.ok) {
        toast.success("Appointment confirmed");
        await fetchTodaysRoute();
      } else {
        toast.error("Failed to confirm appointment");
      }
    } catch (error) {
      console.error("Failed to confirm appointment:", error);
      toast.error("Failed to confirm appointment");
    }
  }

  async function handleStartAppointment(appointmentId: string) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      if (response.ok) {
        toast.success("Appointment started");
        await fetchTodaysRoute();
      } else {
        toast.error("Failed to start appointment");
      }
    } catch (error) {
      console.error("Failed to start appointment:", error);
      toast.error("Failed to start appointment");
    }
  }

  async function handleCompleteAppointment(appointmentId: string) {
    setIsCompleting(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        toast.success("Appointment completed");
        closeCompleteConfirm();
        await fetchTodaysRoute();
        await fetchBreakSuggestion();
      } else {
        toast.error("Failed to complete appointment");
      }
    } catch (error) {
      console.error("Failed to complete appointment:", error);
      toast.error("Failed to complete appointment");
    } finally {
      setIsCompleting(false);
    }
  }

  async function optimizeRoute() {
    setIsOptimizing(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = { date: today };

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
        setOptimizationResult(data);
        // Refresh appointments to show new order
        await fetchTodaysRoute();
        // Also refresh break suggestion since schedule changed
        await fetchBreakSuggestion();
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

  // Find the next appointment - first IN_PROGRESS, or first non-COMPLETED by startAt order
  const inProgressAppointment = appointments.find(apt => apt.status === "IN_PROGRESS");
  const nextPendingAppointment = appointments.find(apt =>
    apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && apt.status !== "IN_PROGRESS"
  );
  const nextAppointment = inProgressAppointment || nextPendingAppointment;

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
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl font-bold text-gray-900">Today&apos;s Route</h1>
              {/* Area Day Indicator */}
              {todayAreaDay && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium"
                  style={{
                    backgroundColor: `${todayAreaDay.areaColor}20`,
                    color: todayAreaDay.areaColor,
                  }}
                >
                  <MapPin className="h-3.5 w-3.5" />
                  {todayAreaDay.areaName}
                </div>
              )}
              {/* Assistant Toggle */}
              {assistantStatus && (
                <button
                  onClick={toggleAssistant}
                  disabled={isTogglingAssistant}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    assistantStatus.hasAssistant
                      ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {assistantStatus.hasAssistant ? "With Bather" : "Solo"}
                </button>
              )}
            </div>
            <p className="text-gray-600">{appointments.length} {appointments.length === 1 ? 'appointment' : 'appointments'} • {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          </div>
          {unoptimizedAppointments.length > 0 && (
            <div className="flex gap-2">
              {unoptimizedAppointments.length > 1 && (
                <button
                  onClick={optimizeRoute}
                  disabled={isOptimizing}
                  className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2 px-6"
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
                className="btn h-12 btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white hover:border-[#A5744A] gap-2 px-6"
              >
                <Navigation className="h-5 w-5" />
                Start Driving
              </button>
            </div>
          )}
        </div>

        {/* Optimization Success Message - Enhanced */}
        {optimizationResult && (
          <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 rounded-full flex-shrink-0">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-emerald-900 font-semibold">{optimizationResult.message}</p>
                {optimizationResult.estimatedFinish && (
                  <p className="text-emerald-700 text-sm mt-1">
                    Estimated finish: {optimizationResult.estimatedFinish}
                  </p>
                )}
                {optimizationResult.routeDetails && (
                  <div className="mt-3 pt-3 border-t border-emerald-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-emerald-600">Stops</p>
                      <p className="font-medium text-emerald-900">{optimizationResult.routeDetails.stops}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Avg between</p>
                      <p className="font-medium text-emerald-900">{optimizationResult.routeDetails.avgMinutesBetweenStops} min</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Total drive</p>
                      <p className="font-medium text-emerald-900">{optimizationResult.routeDetails.formattedDriveTime}</p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Efficiency</p>
                      <p className="font-medium text-emerald-900">{optimizationResult.routeDetails.efficiency}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Break Suggestion */}
        {breakSuggestion && showBreakSuggestion && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                <Coffee className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-amber-900 font-semibold">{breakSuggestion.message}</p>
                    <p className="text-amber-700 text-sm mt-1">{breakSuggestion.subtext}</p>
                  </div>
                  <button
                    onClick={() => setShowBreakSuggestion(false)}
                    className="text-amber-400 hover:text-amber-600 p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => takeBreak(breakSuggestion.breakType)}
                    disabled={isTakingBreak}
                    className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0 px-4"
                  >
                    {isTakingBreak ? (
                      <span className="loading loading-spinner loading-xs"></span>
                    ) : (
                      <>Take {breakSuggestion.suggestedDurationMinutes} min Break</>
                    )}
                  </button>
                  <button
                    onClick={() => setShowBreakSuggestion(false)}
                    className="btn btn-sm btn-ghost text-amber-700"
                  >
                    Skip
                  </button>
                </div>
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

      {/* Next Stop Card - Enhanced Design */}
      {nextAppointment && (
        <div className={`mb-6 rounded-xl shadow-lg text-white p-6 ${
          nextAppointment.status === "IN_PROGRESS"
            ? "bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 border border-blue-400/30"
            : "bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A] border border-[#A5744A]/30"
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {nextAppointment.status === "IN_PROGRESS" ? "In Progress" : "Next Stop"} - {formatTime(nextAppointment.startAt)}
            </h2>
            {/* Badge hidden on mobile - shown below buttons instead */}
            <p className="hidden sm:block text-white/60 text-sm">
              {appointments.filter(a => a.status !== "COMPLETED" && a.status !== "CANCELLED").length - 1 === 0
                ? "Last one — you got this! 🎉"
                : `${appointments.filter(a => a.status !== "COMPLETED" && a.status !== "CANCELLED").length - 1} more after this one`}
            </p>
          </div>

          <div className={`backdrop-blur-sm rounded-lg p-4 mb-4 border ${
            nextAppointment.status === "IN_PROGRESS"
              ? "bg-white/10 border-white/20"
              : "bg-[#A5744A]/10 border-[#A5744A]/20"
          }`}>
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Info Column */}
              <div className="flex-1 min-w-0 w-full">
                <div className="text-center md:text-left">
                  <p className="font-bold text-lg mb-1">{nextAppointment.customer.name}</p>
                  {/* Enhanced Pet Display */}
                  {nextAppointment.pet && (
                    <div className="bg-white/10 rounded-lg px-3 py-2 inline-block mb-2">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <span>🐕</span>
                        <span>{nextAppointment.pet.name}</span>
                        {nextAppointment.pet.breed && (
                          <span className="text-white/70">({nextAppointment.pet.breed})</span>
                        )}
                        {nextAppointment.pet.weight && (
                          <span className="text-white/70">• {nextAppointment.pet.weight} lbs</span>
                        )}
                      </p>
                      <p className="text-white/90 text-xs mt-1 font-medium">
                        {formatAppointmentType(nextAppointment.appointmentType)}
                      </p>
                    </div>
                  )}
                  <p className="text-white/90 text-sm">{nextAppointment.customer.address}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange(nextAppointment.startAt, nextAppointment.serviceMinutes)}
                  </p>
                </div>

                {/* Contact Methods */}
                {nextAppointment.customer.phone && contactMethods.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {contactMethods.includes("call") && (
                      <button
                        onClick={() => handleCall(nextAppointment.customer.phone!)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    )}
                    {contactMethods.includes("sms") && (
                      <button
                        onClick={() => handleSMS(nextAppointment.customer.phone!)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Map Preview */}
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <div className="rounded-lg overflow-hidden border-2 border-white/20">
                  <Image
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(nextAppointment.customer.address)}&zoom=15&size=200x200&maptype=roadmap&markers=color:red%7C${encodeURIComponent(nextAppointment.customer.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Location map"
                    width={150}
                    height={150}
                    className="w-[150px] h-[150px]"
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Start Driving - Only show when NOT in progress (groomer is already there when in progress) */}
            {nextAppointment.status !== "IN_PROGRESS" && (
              <button
                onClick={() => openInMaps(nextAppointment.customer.address)}
                className="w-full font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg bg-[#A5744A] hover:bg-[#8B6239] text-white"
              >
                <Navigation className="h-6 w-6" />
                Start Driving
              </button>
            )}

            {/* Skip & Status actions */}
            {nextAppointment.status !== "COMPLETED" && nextAppointment.status !== "CANCELLED" && (
              <div className={`grid gap-2 ${nextAppointment.status === "CONFIRMED" ? "grid-cols-3" : "grid-cols-2"}`}>
                {/* Start Grooming - Only show when CONFIRMED */}
                {nextAppointment.status === "CONFIRMED" && (
                  <button
                    onClick={() => handleStartAppointment(nextAppointment.id)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <Play className="h-5 w-5" />
                    <span className="hidden sm:inline">Start Grooming</span>
                    <span className="sm:hidden">Start</span>
                  </button>
                )}
                {/* Skip button - always shown */}
                <button
                  onClick={() => openSkipModal(nextAppointment.id)}
                  className="bg-red-500/80 hover:bg-red-500/90 border border-red-300/30 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <SkipForward className="h-5 w-5" />
                  Skip
                </button>
                {/* Status action button */}
                {nextAppointment.status === "BOOKED" && (
                  <button
                    onClick={() => handleConfirmAppointment(nextAppointment.id)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <ThumbsUp className="h-5 w-5" />
                    Confirm
                  </button>
                )}
                {nextAppointment.status === "CONFIRMED" && (
                  <button
                    onClick={() => openCompleteConfirm(nextAppointment.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Complete
                  </button>
                )}
                {nextAppointment.status === "IN_PROGRESS" && (
                  <button
                    onClick={() => openCompleteConfirm(nextAppointment.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-5 w-5" />
                    Complete
                  </button>
                )}
              </div>
            )}

            {/* Appointments left - separate row on mobile */}
            <div className="flex justify-center sm:hidden mt-3">
              <p className="text-white/60 text-sm">
                {appointments.filter(a => a.status !== "COMPLETED" && a.status !== "CANCELLED").length - 1 === 0
                  ? "Last one — you got this! 🎉"
                  : `${appointments.filter(a => a.status !== "COMPLETED" && a.status !== "CANCELLED").length - 1} more after this one`}
              </p>
            </div>
          </div>
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
              className={`border-2 rounded-xl p-4 shadow ${getStatusColor(appointment)} ${isNext ? 'ring-2 ring-[#A5744A]' : ''}`}
            >
              {/* Time & Status Row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-900">
                    {formatTimeRange(appointment.startAt, appointment.serviceMinutes)}
                  </span>
                  {appointment.status === "BOOKED" && (
                    <span className="badge badge-info badge-sm">Booked</span>
                  )}
                  {appointment.status === "CONFIRMED" && (
                    <span className="badge badge-success badge-sm gap-1">
                      <ThumbsUp className="h-3 w-3" />
                      Confirmed
                    </span>
                  )}
                  {appointment.status === "IN_PROGRESS" && (
                    <span className="badge badge-warning badge-sm gap-1">
                      <Play className="h-3 w-3" />
                      In Progress
                    </span>
                  )}
                  {appointment.status === "COMPLETED" && (
                    <span className="badge badge-success badge-sm gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Completed
                    </span>
                  )}
                  {/* Service Area Tag */}
                  {appointment.customer.serviceArea && (
                    <span
                      className="badge badge-sm"
                      style={{
                        backgroundColor: `${appointment.customer.serviceArea.color}20`,
                        color: appointment.customer.serviceArea.color,
                        borderColor: appointment.customer.serviceArea.color,
                      }}
                    >
                      <MapPin className="h-3 w-3 mr-1" />
                      {appointment.customer.serviceArea.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Customer & Pet Info */}
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-gray-900">{appointment.customer.name}</h3>
                {appointment.customer.locationVerified && (
                  <span className="badge badge-success badge-sm gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Verified
                  </span>
                )}
              </div>

              {/* Enhanced Pet & Service Display */}
              {appointment.pet && (
                <div className="bg-gray-100 rounded-lg px-3 py-2 mb-2 inline-block">
                  <p className="text-gray-800 font-medium text-sm flex items-center gap-2">
                    <span>🐕</span>
                    <span>{appointment.pet.name}</span>
                    {appointment.pet.breed && (
                      <span className="text-gray-600">({appointment.pet.breed})</span>
                    )}
                    {appointment.pet.weight && (
                      <span className="text-gray-600">• {appointment.pet.weight} lbs</span>
                    )}
                  </p>
                  <p className="text-gray-700 text-xs mt-1 font-semibold">
                    {formatAppointmentType(appointment.appointmentType)}
                  </p>
                </div>
              )}

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
                {/* Status Action Row */}
                {appointment.status !== "COMPLETED" && appointment.status !== "CANCELLED" && (
                  <div className="flex gap-2 mb-2">
                    {appointment.status === "BOOKED" && (
                      <button
                        onClick={() => handleConfirmAppointment(appointment.id)}
                        className="btn h-10 flex-1 bg-emerald-500 hover:bg-emerald-600 text-white border-0 gap-2"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Confirm
                      </button>
                    )}
                    {appointment.status === "CONFIRMED" && (
                      <button
                        onClick={() => handleStartAppointment(appointment.id)}
                        className="btn h-10 flex-1 bg-blue-500 hover:bg-blue-600 text-white border-0 gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Grooming
                      </button>
                    )}
                    {appointment.status === "IN_PROGRESS" && (
                      <button
                        onClick={() => openCompleteConfirm(appointment.id)}
                        className="btn h-10 flex-1 bg-green-500 hover:bg-green-600 text-white border-0 gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        Complete
                      </button>
                    )}
                  </div>
                )}

                {/* Contact Methods Row */}
                {appointment.customer.phone && (
                  <div className="flex gap-2 flex-wrap">
                    {contactMethods.includes("call") && (
                      <button
                        onClick={() => handleCall(appointment.customer.phone!)}
                        className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    )}
                    {contactMethods.includes("sms") && (
                      <button
                        onClick={() => handleSMS(appointment.customer.phone!)}
                        className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </button>
                    )}
                    {contactMethods.includes("whatsapp") && (
                      <button
                        onClick={() => handleWhatsApp(appointment.customer.phone!)}
                        className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
                      >
                        💚 WhatsApp
                      </button>
                    )}
                    {contactMethods.includes("signal") && (
                      <button
                        onClick={() => handleSignal(appointment.customer.phone!)}
                        className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
                      >
                        🔵 Signal
                      </button>
                    )}
                    {contactMethods.includes("telegram") && (
                      <button
                        onClick={() => handleTelegram(appointment.customer.phone!)}
                        className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
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
                    className="btn h-9 px-4 bg-white/80 hover:bg-white border border-gray-300 text-gray-700 gap-1"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Address
                  </button>
                  <button
                    onClick={() => openInMaps(appointment.customer.address)}
                    className="btn h-9 px-4 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1"
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

      {/* Skip Appointment Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!skipWarning ? (
              // Reason selection view
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Skip Appointment</h3>
                  <button onClick={closeSkipModal} className="btn btn-ghost btn-sm btn-circle">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4">Why are you skipping this appointment?</p>

                  <div className="space-y-2 mb-4">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "CANCELLED" ? "border-red-500 bg-red-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="CANCELLED"
                        checked={skipReason === "CANCELLED"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio radio-error"
                      />
                      <div>
                        <p className="font-medium">Customer Cancelled</p>
                        <p className="text-sm text-gray-500">Customer requested to cancel</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "NO_SHOW" ? "border-red-500 bg-red-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="NO_SHOW"
                        checked={skipReason === "NO_SHOW"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio radio-error"
                      />
                      <div>
                        <p className="font-medium">No Show</p>
                        <p className="text-sm text-gray-500">Customer didn&apos;t show up or respond</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "RESCHEDULED" ? "border-blue-500 bg-blue-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="RESCHEDULED"
                        checked={skipReason === "RESCHEDULED"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio radio-info"
                      />
                      <div>
                        <p className="font-medium">Rescheduled</p>
                        <p className="text-sm text-gray-500">Moving to a different date/time</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "OTHER" ? "border-gray-500 bg-gray-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="OTHER"
                        checked={skipReason === "OTHER"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio"
                      />
                      <div>
                        <p className="font-medium">Other</p>
                        <p className="text-sm text-gray-500">Another reason</p>
                      </div>
                    </label>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes (optional)
                    </label>
                    <textarea
                      value={skipNotes}
                      onChange={(e) => setSkipNotes(e.target.value)}
                      placeholder="Add any additional notes..."
                      className="textarea textarea-bordered w-full"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={closeSkipModal}
                      className="btn btn-ghost flex-1"
                      disabled={isSkipping}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSkipAppointment}
                      className="btn bg-red-500 hover:bg-red-600 text-white flex-1"
                      disabled={!skipReason || isSkipping}
                    >
                      {isSkipping ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Skip Appointment"
                      )}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              // Warning view
              <>
                <div className="p-4 bg-amber-50 border-b border-amber-200">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-amber-900">Customer Alert</h3>
                      <p className="text-sm text-amber-700">{skipWarning.message}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1 p-3 bg-red-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-red-600">{skipWarning.cancellations}</p>
                      <p className="text-sm text-red-700">Cancellations</p>
                    </div>
                    <div className="flex-1 p-3 bg-gray-50 rounded-lg text-center">
                      <p className="text-2xl font-bold text-gray-600">{skipWarning.noShows}</p>
                      <p className="text-sm text-gray-700">No Shows</p>
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-900 mb-2">Suggestions:</h4>
                  <ul className="space-y-2 mb-4">
                    {skipWarning.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {suggestion}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={closeSkipModal}
                    className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white w-full"
                  >
                    Got it
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Complete Confirmation Modal */}
      {showCompleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Complete Appointment?
              </h3>
              <p className="text-gray-600 text-sm mb-6">
                Are you sure you want to mark this appointment as completed?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={closeCompleteConfirm}
                  className="btn btn-ghost flex-1"
                  disabled={isCompleting}
                >
                  Cancel
                </button>
                <button
                  onClick={() => completeAppointmentId && handleCompleteAppointment(completeAppointmentId)}
                  className="btn bg-green-500 hover:bg-green-600 text-white flex-1"
                  disabled={isCompleting}
                >
                  {isCompleting ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : (
                    "Complete"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
