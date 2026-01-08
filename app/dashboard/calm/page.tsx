"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import {
  Heart,
  Clock,
  AlertCircle,
  CheckCircle,
  Calendar,
  MessageCircle,
  Coffee,
  Shield,
  ChevronRight,
  Sparkles,
  Send,
  MapPin,
  Users,
  Battery,
  X,
  Phone,
  MessageSquare,
  Minus,
  Plus,
} from "lucide-react";
import toast from "react-hot-toast";

interface DayStatus {
  status: "smooth" | "tight" | "overloaded";
  message: string;
  totalAppointments: number;
  stressPoints: string[];
}

interface QuickRescue {
  id: string;
  type: "running_behind" | "missing_confirmations" | "travel_risk" | "schedule_gap";
  title: string;
  description: string;
  action: string;
  urgency: number;
}

interface CalmAction {
  id: string;
  category: "behind" | "customer" | "conversation" | "wellbeing";
  icon: string;
  title: string;
  description: string;
}

interface CustomerSituation {
  id: string;
  customerName: string;
  type: "confirmation" | "reschedule" | "concern" | "resolved";
  message?: string;
  needsAction: boolean;
}

interface WellnessAlert {
  id: string;
  message: string;
  suggestion: string;
}

interface CalmCenterData {
  dayStatus: DayStatus;
  quickRescues: QuickRescue[];
  customerSituations: CustomerSituation[];
  wellnessAlerts: WellnessAlert[];
}

interface RunningLateAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  petName?: string;
  originalTime: string;
  formattedOriginalTime: string;
  newTime: string;
  formattedNewTime: string;
  message: string;
}

interface NoShowAppointment {
  id: string;
  customerName: string;
  customerId: string;
  customerPhone: string;
  petName?: string;
  scheduledTime: string;
  formattedTime: string;
  price: number;
  noShowCount: number;
  cancellationCount: number;
  isRepeatOffender: boolean;
}

function CalmCenterContent() {
  const { data: session } = useSession();
  const [data, setData] = useState<CalmCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Running Late modal state
  const [showRunningLateModal, setShowRunningLateModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [runningLateAppointments, setRunningLateAppointments] = useState<RunningLateAppointment[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [contactMethods, setContactMethods] = useState<string[]>(["sms"]);
  const [notifiedCustomers, setNotifiedCustomers] = useState<Set<string>>(new Set());

  // No-Show modal state
  const [showNoShowModal, setShowNoShowModal] = useState(false);
  const [noShowAppointments, setNoShowAppointments] = useState<NoShowAppointment[]>([]);
  const [selectedNoShowAppointment, setSelectedNoShowAppointment] = useState<NoShowAppointment | null>(null);
  const [noShowNotes, setNoShowNotes] = useState("");
  const [isMarkingNoShow, setIsMarkingNoShow] = useState(false);
  const [noShowResult, setNoShowResult] = useState<{
    success: boolean;
    suggestedMessage: string;
    warning: string | null;
    customerPhone: string;
  } | null>(null);

  // Quick Contact modal state
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactAppointments, setContactAppointments] = useState<{
    id: string;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    petName?: string;
    formattedTime: string;
    status: string;
  }[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  useEffect(() => {
    async function fetchCalmCenterData() {
      try {
        const response = await fetch("/api/calm/overview");
        if (response.ok) {
          const calmData = await response.json();
          setData(calmData);
        }
      } catch (error) {
        console.error("Failed to fetch calm center data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (session?.user) {
      fetchCalmCenterData();
    }
  }, [session]);

  // Open Running Late modal and calculate new times
  async function openRunningLateModal() {
    setShowRunningLateModal(true);
    setIsCalculating(true);
    setNotifiedCustomers(new Set());

    try {
      const response = await fetch("/api/calm/running-late", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayMinutes }),
      });

      if (response.ok) {
        const result = await response.json();
        setRunningLateAppointments(result.appointments);
        setContactMethods(result.contactMethods || ["sms"]);
      } else {
        toast.error("Failed to calculate new times");
      }
    } catch (error) {
      console.error("Running late calculation error:", error);
      toast.error("Failed to calculate new times");
    } finally {
      setIsCalculating(false);
    }
  }

  // Recalculate times when delay changes
  async function recalculateTimes(newDelay: number) {
    setDelayMinutes(newDelay);
    setIsCalculating(true);

    try {
      const response = await fetch("/api/calm/running-late", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delayMinutes: newDelay }),
      });

      if (response.ok) {
        const result = await response.json();
        setRunningLateAppointments(result.appointments);
      }
    } catch (error) {
      console.error("Recalculation error:", error);
    } finally {
      setIsCalculating(false);
    }
  }

  // Send notification to a single customer
  function notifyCustomer(appointment: RunningLateAppointment, method: "sms" | "whatsapp") {
    const phone = appointment.customerPhone;
    if (!phone) {
      toast.error("No phone number available");
      return;
    }

    const encodedMessage = encodeURIComponent(appointment.message);

    if (method === "sms") {
      window.location.href = `sms:${phone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    }

    // Mark as notified
    setNotifiedCustomers((prev) => new Set(prev).add(appointment.id));
  }

  // Notify all customers sequentially
  function notifyAllCustomers(method: "sms" | "whatsapp") {
    const toNotify = runningLateAppointments.filter(
      (apt) => apt.customerPhone && !notifiedCustomers.has(apt.id)
    );

    if (toNotify.length === 0) {
      toast.error("No customers to notify");
      return;
    }

    // For SMS, we can create a single message to multiple recipients isn't reliable
    // So we'll notify the first one and let them click through
    if (method === "sms") {
      // Build a combined message with all customers
      const firstApt = toNotify[0];
      notifyCustomer(firstApt, "sms");
      toast.success(`Opened SMS for ${firstApt.customerName}. Continue notifying others individually.`);
    } else {
      // For WhatsApp, open first one
      const firstApt = toNotify[0];
      notifyCustomer(firstApt, "whatsapp");
      toast.success(`Opened WhatsApp for ${firstApt.customerName}. Continue notifying others individually.`);
    }
  }

  function closeRunningLateModal() {
    setShowRunningLateModal(false);
    setRunningLateAppointments([]);
    setNotifiedCustomers(new Set());
  }

  // Open No-Show modal and fetch appointments
  async function openNoShowModal() {
    setShowNoShowModal(true);
    setSelectedNoShowAppointment(null);
    setNoShowNotes("");
    setNoShowResult(null);
    setIsCalculating(true);

    try {
      const response = await fetch("/api/calm/no-show");
      if (response.ok) {
        const result = await response.json();
        setNoShowAppointments(result.appointments);
        setContactMethods(result.contactMethods || ["sms"]);
      } else {
        toast.error("Failed to load appointments");
      }
    } catch (error) {
      console.error("No-show fetch error:", error);
      toast.error("Failed to load appointments");
    } finally {
      setIsCalculating(false);
    }
  }

  // Mark appointment as no-show
  async function handleMarkNoShow() {
    if (!selectedNoShowAppointment) return;

    setIsMarkingNoShow(true);
    try {
      const response = await fetch("/api/calm/no-show", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: selectedNoShowAppointment.id,
          notes: noShowNotes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setNoShowResult({
          success: true,
          suggestedMessage: result.suggestedMessage,
          warning: result.warning,
          customerPhone: selectedNoShowAppointment.customerPhone,
        });
        // Remove from list
        setNoShowAppointments((prev) =>
          prev.filter((apt) => apt.id !== selectedNoShowAppointment.id)
        );
        toast.success("Marked as no-show");
      } else {
        toast.error("Failed to mark as no-show");
      }
    } catch (error) {
      console.error("Mark no-show error:", error);
      toast.error("Failed to mark as no-show");
    } finally {
      setIsMarkingNoShow(false);
    }
  }

  // Send follow-up message to no-show customer
  function sendNoShowMessage(method: "sms" | "whatsapp") {
    if (!noShowResult) return;

    const encodedMessage = encodeURIComponent(noShowResult.suggestedMessage);

    if (method === "sms") {
      window.location.href = `sms:${noShowResult.customerPhone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = noShowResult.customerPhone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    }
  }

  function closeNoShowModal() {
    setShowNoShowModal(false);
    setNoShowAppointments([]);
    setSelectedNoShowAppointment(null);
    setNoShowNotes("");
    setNoShowResult(null);
  }

  // Open Quick Contact modal
  async function openContactModal() {
    setShowContactModal(true);
    setIsLoadingContacts(true);

    try {
      const response = await fetch("/api/calm/contact");
      if (response.ok) {
        const result = await response.json();
        setContactAppointments(result.appointments);
        setContactMethods(result.contactMethods || ["sms", "call"]);
      } else {
        toast.error("Failed to load contacts");
      }
    } catch (error) {
      console.error("Contact fetch error:", error);
      toast.error("Failed to load contacts");
    } finally {
      setIsLoadingContacts(false);
    }
  }

  // Quick contact actions
  function handleQuickCall(phone: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    window.location.href = `tel:${phone}`;
  }

  function handleQuickSMS(phone: string, customerName: string, petName?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    const message = `Hi ${customerName}! Just checking in about ${petName ? petName + "'s " : "your "}appointment today.`;
    const encodedMessage = encodeURIComponent(message);
    window.location.href = `sms:${phone}?body=${encodedMessage}`;
  }

  function handleQuickWhatsApp(phone: string, customerName: string, petName?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    const message = `Hi ${customerName}! Just checking in about ${petName ? petName + "'s " : "your "}appointment today.`;
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phone.replace(/\D/g, "");
    window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
  }

  function handleNavigate(address: string) {
    if (!address) {
      toast.error("No address available");
      return;
    }
    const encodedAddress = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`, "_blank");
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-gray-600">Loading your calm center...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Unable to load calm center data</p>
      </div>
    );
  }

  const statusColors = {
    smooth: "from-green-500 to-emerald-600",
    tight: "from-yellow-500 to-orange-500",
    overloaded: "from-red-500 to-pink-600",
  };

  const statusIcons = {
    smooth: "🙂",
    tight: "😊",
    overloaded: "💪",
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header - Today at a Glance */}
      <div
        className={`bg-gradient-to-br ${
          statusColors[data.dayStatus.status]
        } rounded-xl shadow-lg text-white p-6 mb-6`}
      >
        <div className="flex items-start gap-3 mb-4">
          <Heart className="h-8 w-8 flex-shrink-0" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold mb-1">Today at a Glance</h1>
            <p className="text-white/90 text-lg">
              {data.dayStatus.message} {statusIcons[data.dayStatus.status]}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/80 text-xs mb-1">Total Today</p>
            <p className="text-2xl font-bold">{data.dayStatus.totalAppointments}</p>
            <p className="text-white/80 text-xs">appointments</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/80 text-xs mb-1">Attention Needed</p>
            <p className="text-2xl font-bold">{data.quickRescues.length}</p>
            <p className="text-white/80 text-xs">items</p>
          </div>
        </div>

        {data.dayStatus.stressPoints.length > 0 && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-lg p-3">
            <p className="text-white/90 text-sm font-semibold mb-2">Watch for:</p>
            <ul className="space-y-1">
              {data.dayStatus.stressPoints.map((point, idx) => (
                <li key={idx} className="text-white/80 text-sm flex items-center gap-2">
                  <span className="text-xs">•</span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Section A - Quick Rescues */}
      {data.quickRescues.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-purple-500" />
            Quick Rescues
          </h2>

          <div className="space-y-3">
            {data.quickRescues.map((rescue) => (
              <div
                key={rescue.id}
                className="bg-white rounded-lg shadow-md border-l-4 border-purple-500 p-5"
              >
                <h3 className="font-semibold text-gray-900 mb-2">{rescue.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{rescue.description}</p>
                <button className="btn btn-primary btn-block">
                  <CheckCircle className="h-5 w-5" />
                  {rescue.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section B - Common Calm Actions */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Shield className="h-6 w-6 text-blue-500" />
          Common Calm Actions
        </h2>

        {/* Group 1 - When Behind or Overloaded */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            When Behind or Overloaded
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={openRunningLateModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-red-100 rounded-lg flex-shrink-0">
                <Clock className="h-6 w-6 text-red-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">I&apos;m Running Late</p>
                <p className="text-sm text-gray-600">Adjust schedule & notify customers</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-orange-100 rounded-lg flex-shrink-0">
                <Battery className="h-6 w-6 text-orange-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Today Is Too Heavy</p>
                <p className="text-sm text-gray-600">Get relief options</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Group 2 - Customer Changes */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Customer Changes
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button
              onClick={openContactModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Contact Customer</p>
                <p className="text-sm text-gray-600">Quick call, text, or navigate</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={openNoShowModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-purple-100 rounded-lg flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Cancellation / No-Show</p>
                <p className="text-sm text-gray-600">Handle & fill the gap</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Group 3 - Tough Conversations */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Tough Conversations
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Help Me Reply to This Customer</p>
                <p className="text-sm text-gray-600">Get message templates</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-pink-100 rounded-lg flex-shrink-0">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Customer Is Upset</p>
                <p className="text-sm text-gray-600">Get suggested responses</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>

        {/* Group 4 - Boundaries & Wellbeing */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Boundaries & Wellbeing
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Protect My Evening</p>
                <p className="text-sm text-gray-600">Set day end cutoff</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-teal-100 rounded-lg flex-shrink-0">
                <Coffee className="h-6 w-6 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Give Me a Breather</p>
                <p className="text-sm text-gray-600">Insert break time</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>
          </div>
        </div>
      </div>

      {/* Section C - Calm Inbox */}
      {data.customerSituations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageCircle className="h-6 w-6 text-green-500" />
            Customer Situations
          </h2>

          <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200">
            {data.customerSituations.map((situation) => (
              <div
                key={situation.id}
                className={`p-4 ${
                  situation.needsAction ? "bg-yellow-50" : "bg-white"
                } hover:bg-gray-50 transition-colors`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {situation.type === "resolved" ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : situation.needsAction ? (
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <MessageCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900">{situation.customerName}</p>
                    {situation.message && (
                      <p className="text-sm text-gray-600 mt-1 italic">
                        &quot;{situation.message}&quot;
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {situation.type === "confirmation"
                        ? "Confirmed new time"
                        : situation.type === "reschedule"
                        ? "Needs to reschedule"
                        : situation.type === "concern"
                        ? "Has a concern"
                        : "Resolved"}
                    </p>
                  </div>
                  {situation.needsAction && (
                    <button className="btn btn-sm btn-primary flex-shrink-0">
                      Resolve
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section D - You & Your Day */}
      {data.wellnessAlerts.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            You & Your Day
          </h2>

          <div className="space-y-3">
            {data.wellnessAlerts.map((alert) => (
              <div
                key={alert.id}
                className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg border border-pink-200 p-5"
              >
                <p className="text-gray-800 mb-3">{alert.message}</p>
                <p className="text-sm text-gray-600 mb-4">{alert.suggestion}</p>
                <button className="btn btn-sm btn-outline btn-primary">
                  Tell Me More
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State - All Calm */}
      {data.quickRescues.length === 0 &&
        data.customerSituations.filter((s) => s.needsAction).length === 0 && (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-8 text-center border border-green-200">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Everything looks calm 🌿
            </h3>
            <p className="text-gray-600">
              No urgent items need your attention right now. Enjoy the smooth sailing!
            </p>
          </div>
        )}

      {/* Running Late Modal */}
      {showRunningLateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-red-50 to-orange-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Running Late</h3>
                  <p className="text-sm text-gray-600">Notify your customers with new ETAs</p>
                </div>
              </div>
              <button
                onClick={closeRunningLateModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Delay Selector */}
            <div className="p-4 border-b bg-gray-50">
              <p className="text-sm font-medium text-gray-700 mb-3">How far behind are you?</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => recalculateTimes(Math.max(5, delayMinutes - 5))}
                  disabled={delayMinutes <= 5 || isCalculating}
                  className="btn btn-circle btn-sm bg-gray-200 hover:bg-gray-300 border-0"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <div className="text-center">
                  <span className="text-3xl font-bold text-red-600">{delayMinutes}</span>
                  <span className="text-lg text-gray-500 ml-1">min</span>
                </div>
                <button
                  onClick={() => recalculateTimes(Math.min(60, delayMinutes + 5))}
                  disabled={delayMinutes >= 60 || isCalculating}
                  className="btn btn-circle btn-sm bg-gray-200 hover:bg-gray-300 border-0"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              {/* Quick presets */}
              <div className="flex justify-center gap-2 mt-3">
                {[10, 15, 20, 30].map((min) => (
                  <button
                    key={min}
                    onClick={() => recalculateTimes(min)}
                    disabled={isCalculating}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${
                      delayMinutes === min
                        ? "bg-red-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {min}m
                  </button>
                ))}
              </div>
            </div>

            {/* Appointments List */}
            <div className="flex-1 overflow-y-auto p-4">
              {isCalculating ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-md text-red-600"></span>
                  <span className="ml-2 text-gray-600">Calculating new times...</span>
                </div>
              ) : runningLateAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">No remaining appointments for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    {runningLateAppointments.length} customer{runningLateAppointments.length !== 1 ? "s" : ""} will be affected:
                  </p>
                  {runningLateAppointments.map((apt) => (
                    <div
                      key={apt.id}
                      className={`rounded-lg border p-4 transition-colors ${
                        notifiedCustomers.has(apt.id)
                          ? "bg-green-50 border-green-200"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.customerName}</p>
                          {apt.petName && (
                            <p className="text-sm text-gray-500">{apt.petName}</p>
                          )}
                        </div>
                        {notifiedCustomers.has(apt.id) && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-100 px-2 py-1 rounded-full">
                            <CheckCircle className="h-3 w-3" />
                            Notified
                          </span>
                        )}
                      </div>

                      {/* Time Change */}
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <span className="text-gray-500 line-through">{apt.formattedOriginalTime}</span>
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                        <span className="font-semibold text-red-600">{apt.formattedNewTime}</span>
                      </div>

                      {/* Contact Buttons */}
                      {!notifiedCustomers.has(apt.id) && apt.customerPhone && (
                        <div className="flex gap-2">
                          {contactMethods.includes("sms") && (
                            <button
                              onClick={() => notifyCustomer(apt, "sms")}
                              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 flex-1"
                            >
                              <MessageSquare className="h-4 w-4" />
                              SMS
                            </button>
                          )}
                          {contactMethods.includes("whatsapp") && (
                            <button
                              onClick={() => notifyCustomer(apt, "whatsapp")}
                              className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 flex-1"
                            >
                              💚 WhatsApp
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {runningLateAppointments.length > 0 && !isCalculating && (
              <div className="p-4 border-t bg-gray-50">
                <p className="text-xs text-gray-500 mb-3 text-center">
                  Notify all customers at once, or individually above
                </p>
                <div className="flex gap-2">
                  {contactMethods.includes("sms") && (
                    <button
                      onClick={() => notifyAllCustomers("sms")}
                      disabled={notifiedCustomers.size === runningLateAppointments.length}
                      className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Notify All via SMS
                    </button>
                  )}
                  {contactMethods.includes("whatsapp") && (
                    <button
                      onClick={() => notifyAllCustomers("whatsapp")}
                      disabled={notifiedCustomers.size === runningLateAppointments.length}
                      className="btn flex-1 bg-red-600 hover:bg-red-700 text-white border-0 gap-2"
                    >
                      💚 Notify All via WhatsApp
                    </button>
                  )}
                </div>
                {notifiedCustomers.size > 0 && (
                  <p className="text-sm text-green-600 text-center mt-3">
                    {notifiedCustomers.size} of {runningLateAppointments.length} customers notified
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* No-Show Modal */}
      {showNoShowModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">No-Show / Cancellation</h3>
                  <p className="text-sm text-gray-600">Handle missed appointments</p>
                </div>
              </div>
              <button
                onClick={closeNoShowModal}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isCalculating ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-md text-purple-600"></span>
                  <span className="ml-2 text-gray-600">Loading appointments...</span>
                </div>
              ) : noShowResult ? (
                // Show result after marking no-show
                <div className="space-y-4">
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Marked as No-Show</h4>
                    <p className="text-gray-600 text-sm">The appointment has been recorded.</p>
                  </div>

                  {noShowResult.warning && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-amber-800">{noShowResult.warning}</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Suggested follow-up message:</p>
                    <p className="text-sm text-gray-600 italic mb-4">&ldquo;{noShowResult.suggestedMessage}&rdquo;</p>

                    <div className="flex gap-2">
                      {contactMethods.includes("sms") && (
                        <button
                          onClick={() => sendNoShowMessage("sms")}
                          className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 flex-1"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Send SMS
                        </button>
                      )}
                      {contactMethods.includes("whatsapp") && (
                        <button
                          onClick={() => sendNoShowMessage("whatsapp")}
                          className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 flex-1"
                        >
                          💚 WhatsApp
                        </button>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setNoShowResult(null);
                      setSelectedNoShowAppointment(null);
                      setNoShowNotes("");
                    }}
                    className="w-full btn btn-outline"
                  >
                    Handle Another
                  </button>
                </div>
              ) : selectedNoShowAppointment ? (
                // Confirmation step
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Users className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{selectedNoShowAppointment.customerName}</p>
                        {selectedNoShowAppointment.petName && (
                          <p className="text-sm text-gray-600">{selectedNoShowAppointment.petName}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          Scheduled: {selectedNoShowAppointment.formattedTime}
                        </p>
                        {selectedNoShowAppointment.price > 0 && (
                          <p className="text-sm text-gray-500">
                            Lost revenue: ${selectedNoShowAppointment.price}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedNoShowAppointment.isRepeatOffender && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold text-red-800">Repeat No-Show</p>
                          <p className="text-sm text-red-700">
                            This customer has missed {selectedNoShowAppointment.noShowCount} previous appointment{selectedNoShowAppointment.noShowCount !== 1 ? "s" : ""}.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      value={noShowNotes}
                      onChange={(e) => setNoShowNotes(e.target.value)}
                      placeholder="e.g., Called twice, no answer"
                      className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      rows={2}
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedNoShowAppointment(null)}
                      className="btn btn-outline flex-1"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleMarkNoShow}
                      disabled={isMarkingNoShow}
                      className="btn bg-purple-600 hover:bg-purple-700 text-white border-0 flex-1"
                    >
                      {isMarkingNoShow ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Mark as No-Show
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : noShowAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-gray-600">No appointments to handle</p>
                  <p className="text-sm text-gray-500 mt-1">All today&apos;s appointments are accounted for.</p>
                </div>
              ) : (
                // Appointment selection
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    Select the appointment to mark as no-show:
                  </p>
                  {noShowAppointments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => setSelectedNoShowAppointment(apt)}
                      className="w-full rounded-lg border border-gray-200 p-4 text-left hover:border-purple-300 hover:bg-purple-50 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{apt.customerName}</p>
                          {apt.petName && (
                            <p className="text-sm text-gray-500">{apt.petName}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">
                            {apt.formattedTime}
                            {apt.price > 0 && ` • $${apt.price}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {apt.isRepeatOffender && (
                            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                              Repeat
                            </span>
                          )}
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quick Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Phone className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Quick Contact</h3>
                  <p className="text-sm text-gray-600">Call, text, or navigate to customers</p>
                </div>
              </div>
              <button
                onClick={() => setShowContactModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoadingContacts ? (
                <div className="flex items-center justify-center py-8">
                  <span className="loading loading-spinner loading-md text-blue-600"></span>
                  <span className="ml-2 text-gray-600">Loading contacts...</span>
                </div>
              ) : contactAppointments.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600">No appointments for today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {contactAppointments.map((apt, index) => (
                    <div
                      key={apt.id}
                      className={`rounded-lg border p-4 ${
                        index === 0
                          ? "border-blue-300 bg-blue-50"
                          : "border-gray-200 bg-white"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">{apt.customerName}</p>
                            {index === 0 && (
                              <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                                Next
                              </span>
                            )}
                          </div>
                          {apt.petName && (
                            <p className="text-sm text-gray-500">{apt.petName}</p>
                          )}
                          <p className="text-sm text-gray-500 mt-1">{apt.formattedTime}</p>
                        </div>
                      </div>

                      {/* Quick Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {contactMethods.includes("call") && apt.customerPhone && (
                          <button
                            onClick={() => handleQuickCall(apt.customerPhone)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </button>
                        )}
                        {contactMethods.includes("sms") && apt.customerPhone && (
                          <button
                            onClick={() => handleQuickSMS(apt.customerPhone, apt.customerName, apt.petName)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            SMS
                          </button>
                        )}
                        {contactMethods.includes("whatsapp") && apt.customerPhone && (
                          <button
                            onClick={() => handleQuickWhatsApp(apt.customerPhone, apt.customerName, apt.petName)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1"
                          >
                            💚 WhatsApp
                          </button>
                        )}
                        {apt.customerAddress && (
                          <button
                            onClick={() => handleNavigate(apt.customerAddress)}
                            className="btn btn-sm bg-gray-600 hover:bg-gray-700 text-white border-0 gap-1"
                          >
                            <MapPin className="h-3.5 w-3.5" />
                            Navigate
                          </button>
                        )}
                      </div>

                      {/* Address preview */}
                      {apt.customerAddress && (
                        <p className="text-xs text-gray-400 mt-2 truncate">{apt.customerAddress}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalmCenterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <CalmCenterContent />
    </Suspense>
  );
}
