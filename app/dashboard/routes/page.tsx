"use client";

import { useEffect, useState } from "react";
import { Navigation, MapPin, AlertCircle, CheckCircle2, Zap, UserPlus, Coffee, X, Clock } from "lucide-react";
import toast from "react-hot-toast";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import SortableAppointment from "@/components/routes/SortableAppointment";
import ReorderConfirmModal from "@/components/routes/ReorderConfirmModal";

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
    locationVerified: boolean;
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

interface TimeChange {
  id: string;
  customerName: string;
  petName: string;
  customerPhone: string | null;
  oldStartAt: string;
  newStartAt: string;
  timeChanged: boolean;
}

export default function TodaysRoutePage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null);
  const [contactMethods, setContactMethods] = useState<string[]>(["call", "sms"]);
  const [preferredMessaging, setPreferredMessaging] = useState<"SMS" | "WHATSAPP">("SMS");
  const [preferredMaps, setPreferredMaps] = useState<"GOOGLE" | "APPLE">("GOOGLE");
  const [assistantStatus, setAssistantStatus] = useState<AssistantStatus | null>(null);
  const [todayAreaDay, setTodayAreaDay] = useState<TodayAreaDay | null>(null);

  // Drag-and-drop state
  const [pendingTimeChanges, setPendingTimeChanges] = useState<TimeChange[]>([]);
  const [showReorderModal, setShowReorderModal] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [pendingNewOrder, setPendingNewOrder] = useState<Appointment[]>([]);

  // Optimize route confirmation state
  const [showOptimizeModal, setShowOptimizeModal] = useState(false);

  // Configure sensors for both desktop and mobile
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold to start drag on touch
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    fetchTodaysRoute();
    fetchContactMethods();
    fetchAssistantStatus();
    fetchTodayAreaDay();

    // Update current time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  async function fetchContactMethods() {
    try {
      const response = await fetch("/api/dashboard/today");
      if (response.ok) {
        const data = await response.json();
        if (data.contactMethods) {
          setContactMethods(data.contactMethods);
        }
        if (data.preferredMessaging) {
          setPreferredMessaging(data.preferredMessaging);
        }
        if (data.preferredMaps) {
          setPreferredMaps(data.preferredMaps);
        }
      }
    } catch (error) {
      console.error("Error fetching contact methods:", error);
    }
  }

  async function fetchTodayAreaDay() {
    try {
      const response = await fetch("/api/area-assignments");
      if (response.ok) {
        const data = await response.json();
        const today = new Date().getDay();

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
      const response = await fetch("/api/routes/assistant");
      if (response.ok) {
        const data = await response.json();
        setAssistantStatus(data);
      }
    } catch (error) {
      console.error("Error fetching assistant status:", error);
    }
  }

  async function fetchTodaysRoute() {
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
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

  function handleCall(phone: string) {
    window.location.href = `tel:${phone}`;
  }

  function handleSMS(phone: string) {
    window.location.href = `sms:${phone}`;
  }

  function handleWhatsApp(phone: string) {
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/1${cleanPhone}`, "_blank");
  }

  function startDrivingRoute() {
    const validAppointments = activeAppointments.filter((apt) => apt.customer.address);

    if (validAppointments.length === 0) {
      toast.error("No appointments to export");
      return;
    }

    let url: string;
    const mapsApp = preferredMaps === "APPLE" ? "Apple Maps" : "Google Maps";

    if (preferredMaps === "APPLE") {
      // Apple Maps URL with multiple waypoints
      // Apple Maps format: https://maps.apple.com/?daddr=<address1>&daddr=<address2>...
      url = "https://maps.apple.com/?";
      validAppointments.forEach((apt, index) => {
        if (index === 0) {
          url += `daddr=${encodeURIComponent(apt.customer.address)}`;
        } else {
          url += `&daddr=${encodeURIComponent(apt.customer.address)}`;
        }
      });
      url += "&dirflg=d"; // Driving directions
    } else {
      // Google Maps
      url = "https://www.google.com/maps/dir/";
      validAppointments.forEach((apt) => {
        url += encodeURIComponent(apt.customer.address) + "/";
      });
    }

    window.open(url, "_blank");
    toast.success(`Opened route with ${validAppointments.length} stops in ${mapsApp}`);
  }

  function handleOptimizeClick() {
    setShowOptimizeModal(true);
  }

  async function optimizeRoute(mode: "reorder" | "tighten") {
    setShowOptimizeModal(false);
    setIsOptimizing(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      if (mode === "reorder") {
        // Full optimization - reorder by distance
        const response = await fetch("/api/routes/optimize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: today }),
        });

        if (!response.ok) {
          throw new Error("Failed to optimize route");
        }

        const data = await response.json();

        if (data.success) {
          toast.success(data.message);
          setOptimizationResult(data);
          await fetchTodaysRoute();
        } else {
          toast.error(data.message || "Could not optimize route");
        }
      } else {
        // Tighten mode - keep order, just adjust times
        const response = await fetch("/api/routes/reorder", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            date: today,
            appointmentIds: activeAppointments.map((a) => a.id),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          toast.success("Times tightened! Gaps between appointments reduced.");
          await fetchTodaysRoute();
        } else {
          toast.error("Failed to tighten times");
        }
      }
    } catch (error) {
      console.error("Route optimization error:", error);
      toast.error("Failed to optimize route");
    } finally {
      setIsOptimizing(false);
    }
  }

  // Calculate preview times for new order by swapping times
  // When appointments are reordered, they take on the time slots of their new positions
  function calculatePreviewTimes(newOrder: Appointment[]): TimeChange[] {
    if (newOrder.length === 0) return [];

    const result: TimeChange[] = [];

    // Get the original times in order (sorted by startAt)
    const originalTimes = [...activeAppointments]
      .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
      .map((apt) => apt.startAt);

    // Each appointment in the new order takes the time slot of that position
    for (let i = 0; i < newOrder.length; i++) {
      const apt = newOrder[i];
      const oldStartAt = apt.startAt;
      const newStartAt = originalTimes[i];
      const timeChanged = new Date(oldStartAt).getTime() !== new Date(newStartAt).getTime();

      result.push({
        id: apt.id,
        customerName: apt.customer.name,
        petName: apt.pet?.name || "Pet",
        customerPhone: apt.customer.phone,
        oldStartAt,
        newStartAt,
        timeChanged,
      });
    }

    return result;
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = activeAppointments.findIndex((apt) => apt.id === active.id);
    const newIndex = activeAppointments.findIndex((apt) => apt.id === over.id);

    const newOrder = arrayMove(activeAppointments, oldIndex, newIndex);
    const previewTimes = calculatePreviewTimes(newOrder);

    setPendingNewOrder(newOrder);
    setPendingTimeChanges(previewTimes);
    setShowReorderModal(true);
  }

  async function handleConfirmReorder() {
    if (pendingNewOrder.length === 0) return;

    setIsReordering(true);
    try {
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const response = await fetch("/api/routes/reorder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: today,
          appointmentIds: pendingNewOrder.map((a) => a.id),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await fetchTodaysRoute();
      } else {
        toast.error("Failed to update route order");
      }
    } catch (error) {
      console.error("Reorder error:", error);
      toast.error("Failed to update route order");
    } finally {
      setIsReordering(false);
      setShowReorderModal(false);
      setPendingTimeChanges([]);
      setPendingNewOrder([]);
    }
  }

  function handleCancelReorder() {
    setShowReorderModal(false);
    setPendingTimeChanges([]);
    setPendingNewOrder([]);
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
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Coffee className="h-8 w-8 text-emerald-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Your schedule is clear today</h3>
          <p className="text-gray-600 mb-6">
            Take this time to rest, recharge, or tackle some personal projects.
          </p>
        </div>
      </div>
    );
  }

  // Filter out completed and cancelled appointments for drag-and-drop
  const activeAppointments = appointments.filter(
    (apt) => apt.status !== "COMPLETED" && apt.status !== "CANCELLED" && apt.status !== "NO_SHOW"
  );
  const hasUnverifiedLocations = activeAppointments.some((apt) => !apt.customer.locationVerified);

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
              {/* Assistant Status Indicator */}
              {assistantStatus?.hasAssistant && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                  <UserPlus className="h-3.5 w-3.5" />
                  With Assistant
                </div>
              )}
            </div>
            <p className="text-gray-600">
              {appointments.length} {appointments.length === 1 ? "appointment" : "appointments"} -{" "}
              {currentTime.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          {activeAppointments.length > 0 && (
            <div className="flex gap-2">
              {activeAppointments.length > 1 && (
                <button
                  onClick={handleOptimizeClick}
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
                onClick={startDrivingRoute}
                className="btn h-12 btn-outline border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white hover:border-[#A5744A] gap-2 px-6"
              >
                <Navigation className="h-5 w-5" />
                Start Driving
              </button>
            </div>
          )}
        </div>

        {/* Optimization Success Message */}
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
                      <p className="font-medium text-emerald-900">
                        {optimizationResult.routeDetails.stops}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Avg between</p>
                      <p className="font-medium text-emerald-900">
                        {optimizationResult.routeDetails.avgMinutesBetweenStops} min
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Total drive</p>
                      <p className="font-medium text-emerald-900">
                        {optimizationResult.routeDetails.formattedDriveTime}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600">Efficiency</p>
                      <p className="font-medium text-emerald-900">
                        {optimizationResult.routeDetails.efficiency}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning for unverified locations */}
        {hasUnverifiedLocations && activeAppointments.length > 1 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-900">
                Some locations haven&apos;t been verified. Verify locations on customer profiles for
                better route optimization.
              </p>
            </div>
          </div>
        )}

        {/* Drag instruction hint */}
        {activeAppointments.length > 1 && (
          <p className="mt-4 text-sm text-gray-500 text-center">
            Drag appointments to reorder your route
          </p>
        )}
      </div>

      {/* Draggable Appointments List */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={activeAppointments.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {activeAppointments.map((appointment) => (
              <SortableAppointment
                key={appointment.id}
                appointment={appointment}
                contactMethods={contactMethods}
                preferredMessaging={preferredMessaging}
                onCall={handleCall}
                onSMS={handleSMS}
                onWhatsApp={handleWhatsApp}
                onTimeUpdate={fetchTodaysRoute}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {/* Completed appointments (non-draggable) */}
      {appointments.filter((a) => a.status === "COMPLETED").length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Completed</h3>
          <div className="space-y-2 opacity-60">
            {appointments
              .filter((a) => a.status === "COMPLETED")
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-green-50 border border-green-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.pet?.name} - ${appointment.price}
                      </p>
                    </div>
                    <span className="badge badge-success badge-sm">Completed</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* No Show appointments (non-draggable) */}
      {appointments.filter((a) => a.status === "NO_SHOW").length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">No Shows</h3>
          <div className="space-y-2 opacity-60">
            {appointments
              .filter((a) => a.status === "NO_SHOW")
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-amber-50 border border-amber-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.pet?.name} - ${appointment.price}
                      </p>
                    </div>
                    <span className="badge badge-warning badge-sm">No Show</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Cancelled appointments (non-draggable) */}
      {appointments.filter((a) => a.status === "CANCELLED").length > 0 && (
        <div className="mt-6">
          <h3 className="text-sm font-medium text-gray-500 mb-3">Cancellations</h3>
          <div className="space-y-2 opacity-60">
            {appointments
              .filter((a) => a.status === "CANCELLED")
              .map((appointment) => (
                <div
                  key={appointment.id}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{appointment.customer.name}</p>
                      <p className="text-sm text-gray-600">
                        {appointment.pet?.name} - ${appointment.price}
                      </p>
                    </div>
                    <span className="badge badge-error badge-sm">Cancelled</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Summary Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
            <div className="text-xs text-gray-600">Total Stops</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {appointments.filter((a) => a.status === "COMPLETED").length}
            </div>
            <div className="text-xs text-gray-600">Completed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">
              ${appointments.filter((a) => a.status === "COMPLETED").reduce((sum, a) => sum + a.price, 0).toFixed(0)}
            </div>
            <div className="text-xs text-gray-600">Revenue</div>
          </div>
        </div>
      </div>

      {/* Reorder Confirmation Modal */}
      <ReorderConfirmModal
        isOpen={showReorderModal}
        onClose={handleCancelReorder}
        onConfirm={handleConfirmReorder}
        timeChanges={pendingTimeChanges}
        isLoading={isReordering}
        contactMethods={contactMethods}
        preferredMessaging={preferredMessaging}
      />

      {/* Optimize Route Confirmation Modal */}
      {showOptimizeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <Zap className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Optimize Route</h3>
                  <p className="text-sm text-gray-600">Choose how to optimize</p>
                </div>
              </div>
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-3">
              {/* Option 1: Tighten Times */}
              <button
                onClick={() => optimizeRoute("tighten")}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#A5744A] hover:bg-orange-50 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Tighten Times</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Keep the current appointment order but reduce gaps between appointments.
                      Good when you&apos;ve already arranged the route the way you like.
                    </p>
                  </div>
                </div>
              </button>

              {/* Option 2: Reorder by Distance */}
              <button
                onClick={() => optimizeRoute("reorder")}
                className="w-full p-4 rounded-lg border-2 border-gray-200 hover:border-[#A5744A] hover:bg-orange-50 transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg group-hover:bg-emerald-200 transition-colors">
                    <Navigation className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Optimize by Distance</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Reorder appointments to minimize driving distance between stops.
                      Best for reducing drive time and fuel costs.
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowOptimizeModal(false)}
                className="btn btn-ghost w-full"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
