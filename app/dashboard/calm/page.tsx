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
  Navigation,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

interface DayStatus {
  status: "smooth" | "tight" | "overloaded";
  message: string;
  totalAppointments: number;
  stressPoints: string[];
  // Additional workload context from unified assessment
  workloadLevel?: "day-off" | "light" | "moderate" | "busy" | "heavy" | "overloaded";
  workloadLabel?: string;
  workloadEmoji?: string;
  workloadColor?: string;
  workloadScore?: number;
  hasAssistant?: boolean;
  largeDogCount?: number;
  totalMinutes?: number;
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

interface LightenDaySuggestion {
  id: string;
  type: "reschedule" | "shorten" | "delegate" | "break";
  title: string;
  description: string;
  action: string;
  appointmentId?: string;
  customerName?: string;
  petName?: string;
  time?: string;
  impact: string;
}

interface LightenDayAppointment {
  id: string;
  customerName: string;
  customerPhone: string;
  petName?: string;
  formattedTime: string;
  status: string;
  canReschedule: boolean;
}

interface MessageTemplate {
  id: string;
  category: string;
  title: string;
  preview: string;
  message: string;
}

interface ReplyHelpCustomer {
  id: string;
  appointmentId: string;
  name: string;
  phone: string;
  petName?: string;
  time: string;
}

interface UpsetScenario {
  id: string;
  title: string;
  description: string;
  suggestedResponses: {
    id: string;
    tone: "empathetic" | "professional" | "apologetic";
    label: string;
    message: string;
  }[];
}

interface ProtectEveningOption {
  id: string;
  label: string;
  description: string;
  hour: number;
  appointmentsAffected: number;
}

interface BreakSlot {
  id: string;
  afterAppointmentId: string;
  afterCustomerName: string;
  beforeAppointmentId?: string;
  beforeCustomerName?: string;
  startTime: string;
  endTime: string;
  duration: number;
  suggestedBreakDuration: number;
  type: "gap" | "extend" | "end";
}

interface BreakDuration {
  minutes: number;
  label: string;
  description: string;
}

interface TravelRiskSegment {
  id: string;
  fromCustomer: string;
  fromAddress: string;
  fromEndTime: string;
  toCustomer: string;
  toAddress: string;
  toStartTime: string;
  gapMinutes: number;
  estimatedTravelMinutes: number;
  riskLevel: "tight" | "risky" | "impossible";
  suggestion: string;
}

interface TravelRiskSummary {
  totalSegments: number;
  riskySegments: number;
  impossibleCount: number;
  riskyCount: number;
  tightCount: number;
  message: string;
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

  // Lighten Day modal state
  const [showLightenDayModal, setShowLightenDayModal] = useState(false);
  const [lightenDaySuggestions, setLightenDaySuggestions] = useState<LightenDaySuggestion[]>([]);
  const [lightenDayAppointments, setLightenDayAppointments] = useState<LightenDayAppointment[]>([]);
  const [lightenDayAssessment, setLightenDayAssessment] = useState<{ status: string; message: string } | null>(null);
  const [isLoadingLightenDay, setIsLoadingLightenDay] = useState(false);
  const [selectedBufferMinutes, setSelectedBufferMinutes] = useState<number>(10);
  const [isAddingBuffer, setIsAddingBuffer] = useState(false);
  const [bufferResult, setBufferResult] = useState<{
    success: boolean;
    message: string;
    adjustedAppointments: { customerName: string; oldTime: string; newTime: string }[];
  } | null>(null);

  // Reply Help modal state
  const [showReplyHelpModal, setShowReplyHelpModal] = useState(false);
  const [replyTemplates, setReplyTemplates] = useState<MessageTemplate[]>([]);
  const [replyCustomers, setReplyCustomers] = useState<ReplyHelpCustomer[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [selectedReplyCustomer, setSelectedReplyCustomer] = useState<ReplyHelpCustomer | null>(null);
  const [customizedMessage, setCustomizedMessage] = useState("");
  const [isLoadingReplyHelp, setIsLoadingReplyHelp] = useState(false);

  // Upset Customer modal state
  const [showUpsetModal, setShowUpsetModal] = useState(false);
  const [upsetScenarios, setUpsetScenarios] = useState<UpsetScenario[]>([]);
  const [upsetCustomers, setUpsetCustomers] = useState<ReplyHelpCustomer[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<UpsetScenario | null>(null);
  const [selectedUpsetCustomer, setSelectedUpsetCustomer] = useState<ReplyHelpCustomer | null>(null);
  const [selectedUpsetResponse, setSelectedUpsetResponse] = useState<string>("");
  const [isLoadingUpset, setIsLoadingUpset] = useState(false);

  // Protect Evening modal state
  const [showProtectEveningModal, setShowProtectEveningModal] = useState(false);
  const [protectEveningOptions, setProtectEveningOptions] = useState<ProtectEveningOption[]>([]);
  const [currentEndHour, setCurrentEndHour] = useState<number>(18);
  const [estimatedEndTime, setEstimatedEndTime] = useState<string | null>(null);
  const [isLoadingProtectEvening, setIsLoadingProtectEvening] = useState(false);
  const [isSavingProtectEvening, setIsSavingProtectEvening] = useState(false);

  // Breather modal state
  const [showBreatherModal, setShowBreatherModal] = useState(false);
  const [breakSlots, setBreakSlots] = useState<BreakSlot[]>([]);
  const [breakDurations, setBreakDurations] = useState<BreakDuration[]>([]);
  const [selectedBreakSlot, setSelectedBreakSlot] = useState<BreakSlot | null>(null);
  const [selectedBreakDuration, setSelectedBreakDuration] = useState<number>(15);
  const [isLoadingBreather, setIsLoadingBreather] = useState(false);
  const [breakTaken, setBreakTaken] = useState(false);
  const [breakMessage, setBreakMessage] = useState("");

  // Travel Risk modal state
  const [showTravelRiskModal, setShowTravelRiskModal] = useState(false);
  const [travelRiskSegments, setTravelRiskSegments] = useState<TravelRiskSegment[]>([]);
  const [travelRiskSummary, setTravelRiskSummary] = useState<TravelRiskSummary | null>(null);
  const [isLoadingTravelRisk, setIsLoadingTravelRisk] = useState(false);

  // Body Care / Exercise state
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<typeof bodyExercises[0] | null>(null);
  const [exerciseStep, setExerciseStep] = useState(0);

  // Body Care exercises specifically for groomers
  const bodyExercises = [
    {
      id: "hands-wrists",
      area: "Hands & Wrists",
      emoji: "🤲",
      color: "from-blue-500 to-indigo-500",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      duration: "2 min",
      description: "Relief for tired hands from scissoring and clipping",
      steps: [
        { title: "Finger Spreads", instruction: "Spread your fingers wide, hold for 5 seconds, then make a fist. Repeat 10 times.", duration: 30 },
        { title: "Wrist Circles", instruction: "Rotate each wrist slowly in circles - 10 times clockwise, 10 times counter-clockwise.", duration: 30 },
        { title: "Prayer Stretch", instruction: "Press palms together in front of chest, fingers pointing up. Slowly lower hands while keeping palms together until you feel a stretch. Hold 15 seconds.", duration: 20 },
        { title: "Shake It Out", instruction: "Let your hands hang loose and shake them vigorously for 10 seconds. Feel the tension release.", duration: 10 },
      ],
    },
    {
      id: "shoulders-upper-back",
      area: "Shoulders & Upper Back",
      emoji: "💪",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      duration: "3 min",
      description: "Release tension from holding arms up while grooming",
      steps: [
        { title: "Shoulder Rolls", instruction: "Roll shoulders forward 5 times in big circles, then backward 5 times. Keep movements slow and controlled.", duration: 30 },
        { title: "Cross-Body Stretch", instruction: "Bring right arm across your chest, use left hand to gently press it closer. Hold 15 seconds, then switch sides.", duration: 40 },
        { title: "Shoulder Blade Squeeze", instruction: "Stand tall, squeeze your shoulder blades together as if holding a pencil between them. Hold 5 seconds, release. Repeat 8 times.", duration: 40 },
        { title: "Neck Release", instruction: "Drop your right ear toward your right shoulder. Gently press with your right hand for a deeper stretch. Hold 20 seconds, then switch sides.", duration: 50 },
        { title: "Upper Back Stretch", instruction: "Clasp hands in front, round your upper back like a cat, push hands away from chest. Hold 15 seconds.", duration: 20 },
      ],
    },
    {
      id: "lower-back",
      area: "Lower Back",
      emoji: "🦴",
      color: "from-amber-500 to-orange-500",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      duration: "3 min",
      description: "Ease strain from bending over grooming tables",
      steps: [
        { title: "Standing Back Extension", instruction: "Place hands on lower back, gently arch backward, looking up at the ceiling. Hold 10 seconds. Repeat 3 times.", duration: 40 },
        { title: "Hip Flexor Stretch", instruction: "Step one foot forward into a lunge, keep back straight, push hips forward gently. Hold 20 seconds each side.", duration: 50 },
        { title: "Cat-Cow (Standing)", instruction: "With hands on thighs, round your back up like a cat, then arch it down. Flow between positions 8 times.", duration: 40 },
        { title: "Gentle Twist", instruction: "Feet shoulder-width apart, cross arms over chest, slowly rotate torso left, then right. 10 times each direction.", duration: 40 },
        { title: "Forward Fold", instruction: "Let your upper body hang down toward your toes (bend knees if needed). Let gravity stretch your lower back. Hold 20 seconds.", duration: 20 },
      ],
    },
    {
      id: "legs-feet",
      area: "Legs & Feet",
      emoji: "🦶",
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      duration: "2 min",
      description: "Recovery for standing and moving all day",
      steps: [
        { title: "Calf Raises", instruction: "Rise up onto your toes, hold 2 seconds, lower slowly. Repeat 15 times. Hold onto something for balance if needed.", duration: 40 },
        { title: "Ankle Circles", instruction: "Lift one foot, rotate ankle 10 times each direction. Switch feet.", duration: 30 },
        { title: "Toe Stretches", instruction: "If you can, slip off your shoes and spread your toes wide. Scrunch them up, then spread. Repeat 10 times.", duration: 20 },
        { title: "Quad Stretch", instruction: "Hold onto something, grab one ankle behind you, gently pull heel toward glutes. Hold 20 seconds each leg.", duration: 45 },
      ],
    },
    {
      id: "quick-reset",
      area: "Quick Full-Body Reset",
      emoji: "⚡",
      color: "from-cyan-500 to-blue-500",
      bgColor: "bg-cyan-50",
      borderColor: "border-cyan-200",
      duration: "1 min",
      description: "Fast refresh between appointments",
      steps: [
        { title: "Deep Breaths", instruction: "Take 3 slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 6.", duration: 20 },
        { title: "Full Body Shake", instruction: "Shake your whole body - hands, arms, shoulders, legs. Let everything loose for 10 seconds.", duration: 15 },
        { title: "Reach & Release", instruction: "Reach both arms high overhead, stretch tall, then let everything drop and relax. Repeat 3 times.", duration: 20 },
        { title: "Roll Shoulders Back", instruction: "3 big shoulder rolls backward to reset your posture. Stand tall and confident.", duration: 10 },
      ],
    },
  ];

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

  // Handle hash navigation (e.g., #body-care)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        const id = window.location.hash.substring(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  }, [isLoading]); // Re-run when loading completes

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
      toast.error("No clients to notify");
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

  // Open Lighten Day modal
  async function openLightenDayModal() {
    setShowLightenDayModal(true);
    setIsLoadingLightenDay(true);
    setBufferResult(null);
    setSelectedBufferMinutes(10);

    try {
      const response = await fetch("/api/calm/lighten-day");
      if (response.ok) {
        const result = await response.json();
        setLightenDaySuggestions(result.suggestions);
        setLightenDayAppointments(result.appointments);
        setLightenDayAssessment(result.dayAssessment);
        setContactMethods(result.contactMethods || ["sms", "call"]);
      } else {
        toast.error("Failed to analyze your day");
      }
    } catch (error) {
      console.error("Lighten day fetch error:", error);
      toast.error("Failed to analyze your day");
    } finally {
      setIsLoadingLightenDay(false);
    }
  }

  // Add buffer time between appointments
  async function addBufferTime() {
    setIsAddingBuffer(true);

    try {
      const response = await fetch("/api/calm/lighten-day", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bufferMinutes: selectedBufferMinutes }),
      });

      if (response.ok) {
        const result = await response.json();
        setBufferResult({
          success: result.success,
          message: result.message,
          adjustedAppointments: result.adjustedAppointments || [],
        });
        if (result.adjustedCount > 0) {
          toast.success(result.message);
        } else {
          toast.success("No adjustments needed - appointments already have buffer time");
        }
      } else {
        toast.error("Failed to add buffer time");
      }
    } catch (error) {
      console.error("Add buffer error:", error);
      toast.error("Failed to add buffer time");
    } finally {
      setIsAddingBuffer(false);
    }
  }

  function sendRescheduleMessage(phone: string, customerName: string, petName?: string, method: "sms" | "whatsapp" = "sms") {
    // Extract first name only
    const firstName = customerName.split(" ")[0];
    const message = `Hi ${firstName}! I'm having a packed day and want to give ${petName || "your pet"} my full attention. Would you be open to rescheduling to tomorrow or later this week? I'll prioritize you!`;
    const encodedMessage = encodeURIComponent(message);

    if (method === "sms") {
      window.location.href = `sms:${phone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    }
  }

  // Open Reply Help modal
  async function openReplyHelpModal() {
    setShowReplyHelpModal(true);
    setIsLoadingReplyHelp(true);
    setSelectedTemplate(null);
    setSelectedReplyCustomer(null);
    setCustomizedMessage("");

    try {
      const response = await fetch("/api/calm/reply-help");
      if (response.ok) {
        const result = await response.json();
        setReplyTemplates(result.templates);
        setReplyCustomers(result.customers);
        setContactMethods(result.contactMethods || ["sms", "call"]);
      } else {
        toast.error("Failed to load message templates");
      }
    } catch (error) {
      console.error("Reply help fetch error:", error);
      toast.error("Failed to load message templates");
    } finally {
      setIsLoadingReplyHelp(false);
    }
  }

  // Helper to get first name only
  function getFirstName(fullName: string): string {
    return fullName.split(" ")[0];
  }

  function selectTemplate(template: MessageTemplate) {
    setSelectedTemplate(template);
    // Pre-fill the customized message with placeholders replaced if customer is selected
    if (selectedReplyCustomer) {
      const firstName = getFirstName(selectedReplyCustomer.name);
      const msg = template.message
        .replace(/\[CUSTOMER\]/g, firstName)
        .replace(/\[PET\]/g, selectedReplyCustomer.petName || "your pet")
        .replace(/\[TIME\]/g, selectedReplyCustomer.time);
      setCustomizedMessage(msg);
    } else {
      setCustomizedMessage(template.message);
    }
  }

  function selectReplyCustomer(customer: ReplyHelpCustomer) {
    setSelectedReplyCustomer(customer);
    // Update message with customer info if template is selected
    if (selectedTemplate) {
      const firstName = getFirstName(customer.name);
      const msg = selectedTemplate.message
        .replace(/\[CUSTOMER\]/g, firstName)
        .replace(/\[PET\]/g, customer.petName || "your pet")
        .replace(/\[TIME\]/g, customer.time);
      setCustomizedMessage(msg);
    }
  }

  function sendReplyMessage(method: "sms" | "whatsapp") {
    if (!selectedReplyCustomer || !customizedMessage) {
      toast.error("Please select a client and message");
      return;
    }

    const encodedMessage = encodeURIComponent(customizedMessage);
    const phone = selectedReplyCustomer.phone;

    if (method === "sms") {
      window.location.href = `sms:${phone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    }
  }

  // Open Upset Customer modal
  async function openUpsetModal() {
    setShowUpsetModal(true);
    setIsLoadingUpset(true);
    setSelectedScenario(null);
    setSelectedUpsetCustomer(null);
    setSelectedUpsetResponse("");

    try {
      const response = await fetch("/api/calm/upset-customer");
      if (response.ok) {
        const result = await response.json();
        setUpsetScenarios(result.scenarios);
        setUpsetCustomers(result.customers);
        setContactMethods(result.contactMethods || ["sms", "call"]);
      } else {
        toast.error("Failed to load responses");
      }
    } catch (error) {
      console.error("Upset customer fetch error:", error);
      toast.error("Failed to load responses");
    } finally {
      setIsLoadingUpset(false);
    }
  }

  function selectUpsetScenario(scenario: UpsetScenario) {
    setSelectedScenario(scenario);
    setSelectedUpsetResponse("");
  }

  function selectUpsetResponse(responseMessage: string) {
    // Replace placeholders with customer info if selected
    if (selectedUpsetCustomer) {
      const firstName = getFirstName(selectedUpsetCustomer.name);
      const msg = responseMessage
        .replace(/\[CUSTOMER\]/g, firstName)
        .replace(/\[PET\]/g, selectedUpsetCustomer.petName || "your pet")
        .replace(/\[TIME\]/g, selectedUpsetCustomer.time);
      setSelectedUpsetResponse(msg);
    } else {
      setSelectedUpsetResponse(responseMessage);
    }
  }

  function sendUpsetResponse(method: "sms" | "whatsapp") {
    if (!selectedUpsetCustomer || !selectedUpsetResponse) {
      toast.error("Please select a client and response");
      return;
    }

    const encodedMessage = encodeURIComponent(selectedUpsetResponse);
    const phone = selectedUpsetCustomer.phone;

    if (method === "sms") {
      window.location.href = `sms:${phone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    }
  }

  // Open Protect Evening modal
  async function openProtectEveningModal() {
    setShowProtectEveningModal(true);
    setIsLoadingProtectEvening(true);

    try {
      const response = await fetch("/api/calm/protect-evening");
      if (response.ok) {
        const result = await response.json();
        setProtectEveningOptions(result.protectionOptions);
        setCurrentEndHour(result.currentEndHourSetting);
        setEstimatedEndTime(result.formattedEstimatedEndTime);
        setContactMethods(result.contactMethods || ["sms", "call"]);
      } else {
        toast.error("Failed to load evening protection options");
      }
    } catch (error) {
      console.error("Protect evening fetch error:", error);
      toast.error("Failed to load evening protection options");
    } finally {
      setIsLoadingProtectEvening(false);
    }
  }

  async function saveEveningProtection(endHour: number) {
    setIsSavingProtectEvening(true);

    try {
      const response = await fetch("/api/calm/protect-evening", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endHour }),
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentEndHour(endHour);
        toast.success(result.message);
      } else {
        toast.error("Failed to update evening protection");
      }
    } catch (error) {
      console.error("Save evening protection error:", error);
      toast.error("Failed to update evening protection");
    } finally {
      setIsSavingProtectEvening(false);
    }
  }

  // Open Breather modal
  async function openBreatherModal() {
    setShowBreatherModal(true);
    setIsLoadingBreather(true);
    setBreakTaken(false);
    setBreakMessage("");
    setSelectedBreakSlot(null);

    try {
      const response = await fetch("/api/calm/breather");
      if (response.ok) {
        const result = await response.json();
        setBreakSlots(result.breakSlots);
        setBreakDurations(result.breakDurations);
      } else {
        toast.error("Failed to find break slots");
      }
    } catch (error) {
      console.error("Breather fetch error:", error);
      toast.error("Failed to find break slots");
    } finally {
      setIsLoadingBreather(false);
    }
  }

  async function takeBreak() {
    try {
      const response = await fetch("/api/calm/breather", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          breakDuration: selectedBreakDuration,
          afterAppointmentId: selectedBreakSlot?.afterAppointmentId,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setBreakTaken(true);
        setBreakMessage(result.message);
        toast.success("Break time! Enjoy your rest.");
      } else {
        toast.error("Failed to log break");
      }
    } catch (error) {
      console.error("Take break error:", error);
      toast.error("Failed to log break");
    }
  }

  // Open Travel Risk modal
  async function openTravelRiskModal() {
    setShowTravelRiskModal(true);
    setIsLoadingTravelRisk(true);

    try {
      const response = await fetch("/api/calm/travel-risk");
      if (response.ok) {
        const result = await response.json();
        setTravelRiskSegments(result.segments || []);
        setTravelRiskSummary(result.summary || null);
      } else {
        toast.error("Failed to analyze travel risks");
      }
    } catch (error) {
      console.error("Travel risk fetch error:", error);
      toast.error("Failed to analyze travel risks");
    } finally {
      setIsLoadingTravelRisk(false);
    }
  }

  // Handle travel risk actions
  function handleTravelRiskAction(action: string) {
    if (action === "add_buffer") {
      // Close travel risk modal and open lighten day modal
      setShowTravelRiskModal(false);
      openLightenDayModal();
    } else if (action === "optimize_route") {
      // Navigate to routes page
      window.location.href = "/dashboard/routes";
    } else if (action === "view_map") {
      // Navigate to routes page
      window.location.href = "/dashboard/routes";
    }
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

  const statusStyles = {
    smooth: {
      bg: "from-emerald-50 via-teal-50 to-cyan-100",
      border: "border-emerald-200",
      iconColor: "text-emerald-600",
      titleColor: "text-gray-900",
      textColor: "text-gray-700",
      cardBg: "bg-white/60 border-emerald-200",
      statBg: "bg-emerald-100/50",
      statText: "text-emerald-800",
    },
    tight: {
      bg: "from-amber-50 via-orange-50 to-yellow-100",
      border: "border-amber-200",
      iconColor: "text-amber-600",
      titleColor: "text-gray-900",
      textColor: "text-gray-700",
      cardBg: "bg-white/60 border-amber-200",
      statBg: "bg-amber-100/50",
      statText: "text-amber-800",
    },
    overloaded: {
      bg: "from-rose-50 via-pink-50 to-red-100",
      border: "border-rose-200",
      iconColor: "text-rose-600",
      titleColor: "text-gray-900",
      textColor: "text-gray-700",
      cardBg: "bg-white/60 border-rose-200",
      statBg: "bg-rose-100/50",
      statText: "text-rose-800",
    },
  };

  const statusIcons = {
    smooth: "🙂",
    tight: "😊",
    overloaded: "💪",
  };

  const currentStyle = statusStyles[data.dayStatus.status];

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header - Today at a Glance */}
      <div
        className={`bg-gradient-to-br ${currentStyle.bg} rounded-xl shadow-lg p-6 mb-6 border ${currentStyle.border}`}
      >
        <div className="flex items-start gap-3 mb-4">
          <Heart className={`h-8 w-8 flex-shrink-0 ${currentStyle.iconColor}`} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className={`text-2xl font-bold ${currentStyle.titleColor}`}>Today at a Glance</h1>
              {data.dayStatus.workloadEmoji && (
                <span className="text-xl">{data.dayStatus.workloadEmoji}</span>
              )}
              {data.dayStatus.workloadLabel && (
                <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${currentStyle.statBg} ${currentStyle.statText}`}>
                  {data.dayStatus.workloadLabel}
                </span>
              )}
            </div>
            <p className={`${currentStyle.textColor} text-lg`}>
              {data.dayStatus.message}
            </p>
            {data.dayStatus.hasAssistant && (
              <p className={`${currentStyle.textColor} text-sm mt-1 flex items-center gap-1`}>
                <span>👥</span> Working with assistant today
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className={`${currentStyle.statBg} backdrop-blur-sm rounded-lg p-3 border ${currentStyle.border}`}>
            <p className="text-gray-500 text-xs mb-1">Appointments</p>
            <p className={`text-2xl font-bold ${currentStyle.statText}`}>{data.dayStatus.totalAppointments}</p>
            <p className="text-gray-500 text-xs">today</p>
          </div>
          <div className={`${currentStyle.statBg} backdrop-blur-sm rounded-lg p-3 border ${currentStyle.border}`}>
            <p className="text-gray-500 text-xs mb-1">Grooming Time</p>
            <p className={`text-2xl font-bold ${currentStyle.statText}`}>
              {data.dayStatus.totalMinutes ? Math.round(data.dayStatus.totalMinutes / 60) : 0}
            </p>
            <p className="text-gray-500 text-xs">hours</p>
          </div>
          <div className={`${currentStyle.statBg} backdrop-blur-sm rounded-lg p-3 border ${currentStyle.border}`}>
            <p className="text-gray-500 text-xs mb-1">Large Dogs</p>
            <p className={`text-2xl font-bold ${currentStyle.statText}`}>{data.dayStatus.largeDogCount || 0}</p>
            <p className="text-gray-500 text-xs">50+ lbs</p>
          </div>
        </div>

        {data.dayStatus.stressPoints.length > 0 && (
          <div className={`mt-4 bg-white/60 backdrop-blur-sm rounded-lg p-3 border ${currentStyle.border}`}>
            <p className={`${currentStyle.textColor} text-sm font-semibold mb-2`}>Watch for:</p>
            <ul className="space-y-1">
              {data.dayStatus.stressPoints.map((point, idx) => (
                <li key={idx} className="text-gray-600 text-sm flex items-center gap-2">
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
            {data.quickRescues.map((rescue) => {
              // Determine border color based on rescue type
              const borderColor = rescue.type === "travel_risk" ? "border-orange-500" :
                rescue.type === "running_behind" ? "border-red-500" :
                rescue.type === "schedule_gap" ? "border-blue-500" :
                "border-purple-500";

              // Determine button action based on rescue type
              const handleRescueAction = () => {
                switch (rescue.type) {
                  case "travel_risk":
                    openTravelRiskModal();
                    break;
                  case "running_behind":
                    openLightenDayModal();
                    break;
                  case "schedule_gap":
                    openBreatherModal();
                    break;
                  case "missing_confirmations":
                    openContactModal();
                    break;
                  default:
                    break;
                }
              };

              return (
              <div
                key={rescue.id}
                className={`bg-white rounded-lg shadow-md border-l-4 ${borderColor} p-5`}
              >
                <h3 className="font-semibold text-gray-900 mb-2">{rescue.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{rescue.description}</p>
                <button
                  onClick={handleRescueAction}
                  className="btn btn-primary btn-block border-2 border-purple-600"
                >
                  <CheckCircle className="h-5 w-5" />
                  {rescue.action}
                </button>
              </div>
              );
            })}
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
                <p className="text-sm text-gray-600">Adjust schedule & notify clients</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={openLightenDayModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
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

        {/* Group 2 - Client Changes */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">
            Client Changes
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
                <p className="font-semibold text-gray-900">Contact Client</p>
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
            <button
              onClick={openReplyHelpModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-green-100 rounded-lg flex-shrink-0">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Help Me Reply to This Client</p>
                <p className="text-sm text-gray-600">Get message templates</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={openUpsetModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-pink-100 rounded-lg flex-shrink-0">
                <Heart className="h-6 w-6 text-pink-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Client Is Upset</p>
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
            <button
              onClick={openProtectEveningModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
              <div className="p-3 bg-indigo-100 rounded-lg flex-shrink-0">
                <Shield className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Protect My Evening</p>
                <p className="text-sm text-gray-600">Set day end cutoff</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button
              onClick={openBreatherModal}
              className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left w-full"
            >
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
            Client Situations
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

      {/* Section D - Body Care */}
      <div id="body-care" className="mb-6 scroll-mt-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🧘</span>
          Body Care
        </h2>
        <p className="text-gray-600 text-sm mb-4">
          Quick stretches and exercises designed for groomers. Take care of the body that takes care of so many pups!
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bodyExercises.map((exercise) => (
            <button
              key={exercise.id}
              onClick={() => {
                setSelectedExercise(exercise);
                setExerciseStep(0);
                setShowExerciseModal(true);
              }}
              className={`${exercise.bgColor} ${exercise.borderColor} border rounded-xl p-4 text-left hover:shadow-md transition-all hover:scale-[1.02]`}
            >
              <div className="text-2xl mb-2">{exercise.emoji}</div>
              <p className="font-semibold text-gray-900 text-sm">{exercise.area}</p>
              <p className="text-xs text-gray-600 mt-1">{exercise.duration}</p>
            </button>
          ))}
        </div>

        {/* Tip of the day */}
        <div className="mt-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200 p-4">
          <p className="text-sm text-indigo-800">
            <span className="font-semibold">Pro tip:</span> Try the Quick Reset between appointments to prevent fatigue buildup. Even 60 seconds makes a difference!
          </p>
        </div>
      </div>

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
                  <p className="text-sm text-gray-600">Notify your clients with new ETAs</p>
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
                    {runningLateAppointments.length} client{runningLateAppointments.length !== 1 ? "s" : ""} will be affected:
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
                  Notify all clients at once, or individually above
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
                    {notifiedCustomers.size} of {runningLateAppointments.length} clients notified
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
                  <p className="text-sm text-gray-600">Call, text, or navigate to clients</p>
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
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 px-3"
                          >
                            <Phone className="h-3.5 w-3.5" />
                            Call
                          </button>
                        )}
                        {contactMethods.includes("sms") && apt.customerPhone && (
                          <button
                            onClick={() => handleQuickSMS(apt.customerPhone, apt.customerName, apt.petName)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 px-3"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            SMS
                          </button>
                        )}
                        {contactMethods.includes("whatsapp") && apt.customerPhone && (
                          <button
                            onClick={() => handleQuickWhatsApp(apt.customerPhone, apt.customerName, apt.petName)}
                            className="btn btn-sm bg-emerald-600 hover:bg-emerald-700 text-white border-0 gap-1 px-3"
                          >
                            💚 WhatsApp
                          </button>
                        )}
                        {apt.customerAddress && (
                          <button
                            onClick={() => handleNavigate(apt.customerAddress)}
                            className="btn btn-sm bg-gray-600 hover:bg-gray-700 text-white border-0 gap-1 px-3"
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

      {/* Lighten Day Modal - "Today Is Too Heavy" */}
      {showLightenDayModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Battery className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Today Is Too Heavy</h3>
                </div>
                <button
                  onClick={() => setShowLightenDayModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingLightenDay ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-amber-500"></span>
                </div>
              ) : (
                <>
                  {/* Day Assessment */}
                  {lightenDayAssessment && (
                    <div className={`p-4 rounded-lg mb-6 ${
                      lightenDayAssessment.status === "heavy" ? "bg-red-50 border border-red-200" :
                      lightenDayAssessment.status === "moderate" ? "bg-amber-50 border border-amber-200" :
                      "bg-green-50 border border-green-200"
                    }`}>
                      <p className="font-medium">{lightenDayAssessment.message}</p>
                    </div>
                  )}

                  {/* Buffer Time Section */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-700 mb-3">Add Buffer Time Between Appointments</h4>
                    {bufferResult ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="font-medium text-green-700">{bufferResult.message}</p>
                        {bufferResult.adjustedAppointments.length > 0 && (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-green-600 font-medium">Adjusted appointments:</p>
                            {bufferResult.adjustedAppointments.map((apt, idx) => (
                              <div key={idx} className="text-sm text-green-700 flex items-center gap-2">
                                <span>{apt.customerName}:</span>
                                <span className="line-through text-gray-400">{apt.oldTime}</span>
                                <span>→</span>
                                <span className="font-medium">{apt.newTime}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                        <p className="text-sm text-amber-700 mb-3">
                          Add breathing room between back-to-back appointments to reduce stress.
                        </p>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-sm text-gray-600">Buffer time:</span>
                          <div className="flex gap-2">
                            {[5, 10, 15, 20].map((mins) => (
                              <button
                                key={mins}
                                onClick={() => setSelectedBufferMinutes(mins)}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                                  selectedBufferMinutes === mins
                                    ? "bg-amber-500 text-white"
                                    : "bg-white border border-amber-300 text-amber-700 hover:bg-amber-100"
                                }`}
                              >
                                {mins} min
                              </button>
                            ))}
                          </div>
                        </div>
                        <button
                          onClick={addBufferTime}
                          disabled={isAddingBuffer}
                          className="btn w-full bg-amber-500 hover:bg-amber-600 text-white border-0"
                        >
                          {isAddingBuffer ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Adding buffers...
                            </>
                          ) : (
                            <>
                              <Clock className="h-4 w-4 mr-2" />
                              Add {selectedBufferMinutes}-min Buffers
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Suggestions */}
                  {lightenDaySuggestions.filter(s => s.type !== "break").length > 0 && (
                    <div className="space-y-4 mb-6">
                      <h4 className="font-semibold text-gray-700">Other suggestions:</h4>
                      {lightenDaySuggestions.filter(s => s.type !== "break").map((suggestion) => (
                        <div key={suggestion.id} className="bg-gray-50 rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="font-medium text-gray-900">{suggestion.title}</h5>
                              <p className="text-gray-600 text-sm mt-1">{suggestion.description}</p>
                              {suggestion.customerName && (
                                <p className="text-amber-600 text-sm mt-2">
                                  {suggestion.customerName} {suggestion.petName && `(${suggestion.petName})`} at {suggestion.time}
                                </p>
                              )}
                              <p className="text-green-600 text-xs mt-1">{suggestion.impact}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Appointments that can be rescheduled */}
                  {lightenDayAppointments.filter(a => a.canReschedule).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Appointments you could reschedule:</h4>
                      <div className="space-y-3">
                        {lightenDayAppointments.filter(a => a.canReschedule).map((apt) => (
                          <div key={apt.id} className="bg-white border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{apt.customerName}</p>
                                <p className="text-sm text-gray-600">
                                  {apt.petName && `${apt.petName} - `}{apt.formattedTime}
                                </p>
                              </div>
                              <div className="flex gap-2">
                                {contactMethods.includes("sms") && apt.customerPhone && (
                                  <button
                                    onClick={() => sendRescheduleMessage(apt.customerPhone, apt.customerName, apt.petName, "sms")}
                                    className="btn btn-sm bg-amber-500 hover:bg-amber-600 text-white border-0 px-3"
                                  >
                                    <MessageSquare className="h-4 w-4" />
                                    SMS
                                  </button>
                                )}
                                {contactMethods.includes("whatsapp") && apt.customerPhone && (
                                  <button
                                    onClick={() => sendRescheduleMessage(apt.customerPhone, apt.customerName, apt.petName, "whatsapp")}
                                    className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-0 px-3"
                                  >
                                    WhatsApp
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowLightenDayModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Help Modal - "Help me reply to this customer" */}
      {showReplyHelpModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <MessageCircle className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Help Me Reply</h3>
                </div>
                <button
                  onClick={() => setShowReplyHelpModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingReplyHelp ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-blue-500"></span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 1: Select Customer */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">1. Select Customer</h4>
                    {replyCustomers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {replyCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => selectReplyCustomer(customer)}
                            className={`px-4 py-2 rounded-lg text-sm transition ${
                              selectedReplyCustomer?.id === customer.id
                                ? "bg-blue-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {customer.name} {customer.petName && `(${customer.petName})`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No appointments today</p>
                    )}
                  </div>

                  {/* Step 2: Select Template */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">2. Choose a Message Template</h4>
                    <div className="space-y-2">
                      {Array.from(new Set(replyTemplates.map(t => t.category))).map(category => (
                        <div key={category}>
                          <p className="text-xs uppercase text-gray-500 mb-2">{category}</p>
                          <div className="grid gap-2">
                            {replyTemplates.filter(t => t.category === category).map(template => (
                              <button
                                key={template.id}
                                onClick={() => selectTemplate(template)}
                                className={`text-left p-3 rounded-lg transition ${
                                  selectedTemplate?.id === template.id
                                    ? "bg-blue-50 border-2 border-blue-500"
                                    : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                                }`}
                              >
                                <p className="font-medium text-gray-900">{template.title}</p>
                                <p className="text-sm text-gray-600 truncate">{template.preview}</p>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Customize & Send */}
                  {selectedTemplate && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">3. Customize & Send</h4>
                      <textarea
                        value={customizedMessage}
                        onChange={(e) => setCustomizedMessage(e.target.value)}
                        className="textarea textarea-bordered w-full h-32"
                        placeholder="Your message..."
                      />
                      <div className="flex gap-2 mt-3">
                        {contactMethods.includes("sms") && selectedReplyCustomer && (
                          <button
                            onClick={() => sendReplyMessage("sms")}
                            className="btn flex-1 bg-blue-500 hover:bg-blue-600 text-white border-0"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send SMS
                          </button>
                        )}
                        {contactMethods.includes("whatsapp") && selectedReplyCustomer && (
                          <button
                            onClick={() => sendReplyMessage("whatsapp")}
                            className="btn flex-1 bg-green-500 hover:bg-green-600 text-white border-0"
                          >
                            Send WhatsApp
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowReplyHelpModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upset Customer Modal */}
      {showUpsetModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Heart className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Customer Is Upset</h3>
                </div>
                <button
                  onClick={() => setShowUpsetModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingUpset ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-rose-500"></span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Calming Tips */}
                  <div className="bg-rose-50 rounded-lg p-4">
                    <p className="font-medium text-rose-700 mb-2">Take a breath first:</p>
                    <ul className="text-sm text-rose-600 space-y-1">
                      <li>• Take a deep breath before responding</li>
                      <li>• Acknowledge their feelings first</li>
                      <li>• Focus on solutions, not excuses</li>
                    </ul>
                  </div>

                  {/* Step 1: Select Customer */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">1. Which Customer?</h4>
                    {upsetCustomers.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {upsetCustomers.map((customer) => (
                          <button
                            key={customer.id}
                            onClick={() => setSelectedUpsetCustomer(customer)}
                            className={`px-4 py-2 rounded-lg text-sm transition ${
                              selectedUpsetCustomer?.id === customer.id
                                ? "bg-rose-500 text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                            }`}
                          >
                            {customer.name} {customer.petName && `(${customer.petName})`}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-sm">No appointments today. You can still select a scenario below.</p>
                    )}
                  </div>

                  {/* Step 2: What happened */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">2. What Happened?</h4>
                    <div className="grid gap-2">
                      {upsetScenarios.map((scenario) => (
                        <button
                          key={scenario.id}
                          onClick={() => selectUpsetScenario(scenario)}
                          className={`text-left p-4 rounded-lg transition ${
                            selectedScenario?.id === scenario.id
                              ? "bg-rose-50 border-2 border-rose-500"
                              : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                          }`}
                        >
                          <p className="font-medium text-gray-900">{scenario.title}</p>
                          <p className="text-sm text-gray-600">{scenario.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 3: Choose Response Tone */}
                  {selectedScenario && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">3. Choose Your Response Tone</h4>
                      <div className="grid gap-2">
                        {selectedScenario.suggestedResponses.map((response) => (
                          <button
                            key={response.id}
                            onClick={() => selectUpsetResponse(response.message)}
                            className={`text-left p-4 rounded-lg transition ${
                              selectedUpsetResponse.includes(response.message.substring(0, 20))
                                ? "bg-rose-50 border-2 border-rose-500"
                                : "bg-gray-50 hover:bg-gray-100 border-2 border-transparent"
                            }`}
                          >
                            <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium mb-2 ${
                              response.tone === "empathetic" ? "bg-blue-100 text-blue-700" :
                              response.tone === "professional" ? "bg-gray-200 text-gray-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>
                              {response.label}
                            </span>
                            <p className="text-sm text-gray-700">{response.message}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Step 4: Send */}
                  {selectedUpsetResponse && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">4. Review & Send</h4>
                      <div className="bg-gray-50 rounded-lg p-4 mb-3">
                        <p className="text-sm text-gray-700">{selectedUpsetResponse}</p>
                      </div>
                      <div className="flex gap-2">
                        {contactMethods.includes("sms") && selectedUpsetCustomer && (
                          <button
                            onClick={() => sendUpsetResponse("sms")}
                            className="btn flex-1 bg-rose-500 hover:bg-rose-600 text-white border-0"
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Send SMS
                          </button>
                        )}
                        {contactMethods.includes("whatsapp") && selectedUpsetCustomer && (
                          <button
                            onClick={() => sendUpsetResponse("whatsapp")}
                            className="btn flex-1 bg-green-500 hover:bg-green-600 text-white border-0"
                          >
                            Send WhatsApp
                          </button>
                        )}
                      </div>
                      {!selectedUpsetCustomer && (
                        <p className="text-sm text-gray-500 mt-2 text-center">Select a customer above to send</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowUpsetModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Protect Evening Modal */}
      {showProtectEveningModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Shield className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Protect My Evening</h3>
                </div>
                <button
                  onClick={() => setShowProtectEveningModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingProtectEvening ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-indigo-500"></span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Current Status */}
                  <div className="bg-indigo-50 rounded-lg p-4">
                    <p className="text-sm text-indigo-600">
                      {estimatedEndTime
                        ? `Your day currently ends around ${estimatedEndTime}`
                        : "No appointments scheduled for today"
                      }
                    </p>
                    <p className="text-sm text-indigo-500 mt-1">
                      Current end time setting: {currentEndHour > 12 ? currentEndHour - 12 : currentEndHour}:00 {currentEndHour >= 12 ? "PM" : "AM"}
                    </p>
                  </div>

                  {/* Protection Options */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">Set your workday end time:</h4>
                    <div className="space-y-2">
                      {protectEveningOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => saveEveningProtection(option.hour)}
                          disabled={isSavingProtectEvening}
                          className={`w-full text-left p-4 rounded-lg transition border-2 ${
                            currentEndHour === option.hour
                              ? "bg-indigo-50 border-indigo-500"
                              : "bg-gray-50 hover:bg-gray-100 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{option.label}</p>
                              <p className="text-sm text-gray-600">{option.description}</p>
                            </div>
                            {option.appointmentsAffected > 0 && (
                              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded">
                                {option.appointmentsAffected} affected
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tips */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-purple-700 font-medium mb-2">Why protect your evening?</p>
                    <ul className="text-sm text-purple-600 space-y-1">
                      <li>• Better work-life balance</li>
                      <li>• Time for family and self-care</li>
                      <li>• More energy for tomorrow</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowProtectEveningModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Breather Modal - "Give Me a Breather" */}
      {showBreatherModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Coffee className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Take a Breather</h3>
                </div>
                <button
                  onClick={() => setShowBreatherModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingBreather ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-teal-500"></span>
                </div>
              ) : breakTaken ? (
                /* Break Taken Confirmation */
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">🧘</div>
                  <h4 className="text-xl font-bold text-gray-900 mb-2">Enjoy Your Break!</h4>
                  <p className="text-gray-600 mb-4">{breakMessage}</p>
                  <p className="text-sm text-teal-600">
                    You selected a {selectedBreakDuration}-minute break.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Available Break Slots */}
                  {breakSlots.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">When to take a break:</h4>
                      <div className="space-y-2">
                        {breakSlots.map((slot) => (
                          <button
                            key={slot.id}
                            onClick={() => setSelectedBreakSlot(slot)}
                            className={`w-full text-left p-4 rounded-lg transition border-2 ${
                              selectedBreakSlot?.id === slot.id
                                ? "bg-teal-50 border-teal-500"
                                : "bg-gray-50 hover:bg-gray-100 border-transparent"
                            }`}
                          >
                            <p className="font-medium text-gray-900">
                              After {slot.afterCustomerName}
                            </p>
                            <p className="text-sm text-gray-600">
                              {slot.startTime} - {slot.endTime}
                              {slot.type === "gap" && ` (${slot.duration} min gap)`}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Break Duration Selection */}
                  <div>
                    <h4 className="font-semibold text-gray-700 mb-3">How long?</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {breakDurations.map((duration) => (
                        <button
                          key={duration.minutes}
                          onClick={() => setSelectedBreakDuration(duration.minutes)}
                          className={`p-3 rounded-lg text-left transition border-2 ${
                            selectedBreakDuration === duration.minutes
                              ? "bg-teal-50 border-teal-500"
                              : "bg-gray-50 hover:bg-gray-100 border-transparent"
                          }`}
                        >
                          <p className="font-medium text-gray-900">{duration.label}</p>
                          <p className="text-xs text-gray-600">{duration.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Take Break Button */}
                  <button
                    onClick={takeBreak}
                    className="btn w-full bg-teal-500 hover:bg-teal-600 text-white border-0"
                  >
                    <Coffee className="h-4 w-4 mr-2" />
                    Start My {selectedBreakDuration}-Minute Break
                  </button>

                  {/* Tips */}
                  <div className="bg-cyan-50 rounded-lg p-4">
                    <p className="text-sm text-cyan-700 font-medium mb-2">Break ideas:</p>
                    <ul className="text-sm text-cyan-600 space-y-1">
                      <li>• Stretch and move around</li>
                      <li>• Hydrate - drink some water</li>
                      <li>• Step outside for fresh air</li>
                      <li>• Close your eyes for a moment</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowBreatherModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                {breakTaken ? "Done" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Travel Risk Modal - "Fix My Route" */}
      {showTravelRiskModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <Navigation className="h-6 w-6" />
                  <h3 className="text-xl font-bold">Travel Time Risk</h3>
                </div>
                <button
                  onClick={() => setShowTravelRiskModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {isLoadingTravelRisk ? (
                <div className="flex items-center justify-center py-12">
                  <span className="loading loading-spinner loading-lg text-orange-500"></span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Summary */}
                  {travelRiskSummary && (
                    <div className={`p-4 rounded-lg ${
                      travelRiskSummary.impossibleCount > 0 ? "bg-red-50 border border-red-200" :
                      travelRiskSummary.riskyCount > 0 ? "bg-orange-50 border border-orange-200" :
                      travelRiskSummary.tightCount > 0 ? "bg-amber-50 border border-amber-200" :
                      "bg-green-50 border border-green-200"
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className={`h-5 w-5 ${
                          travelRiskSummary.impossibleCount > 0 ? "text-red-600" :
                          travelRiskSummary.riskyCount > 0 ? "text-orange-600" :
                          travelRiskSummary.tightCount > 0 ? "text-amber-600" :
                          "text-green-600"
                        }`} />
                        <p className="font-semibold">{travelRiskSummary.message}</p>
                      </div>
                      <p className="text-sm text-gray-600">
                        {travelRiskSummary.riskySegments} of {travelRiskSummary.totalSegments} segments need attention
                      </p>
                    </div>
                  )}

                  {/* Risk Segments */}
                  {travelRiskSegments.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Problem Areas:</h4>
                      <div className="space-y-3">
                        {travelRiskSegments.map((segment) => (
                          <div
                            key={segment.id}
                            className={`rounded-lg p-4 border-l-4 ${
                              segment.riskLevel === "impossible" ? "bg-red-50 border-red-500" :
                              segment.riskLevel === "risky" ? "bg-orange-50 border-orange-500" :
                              "bg-amber-50 border-amber-500"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                    segment.riskLevel === "impossible" ? "bg-red-200 text-red-800" :
                                    segment.riskLevel === "risky" ? "bg-orange-200 text-orange-800" :
                                    "bg-amber-200 text-amber-800"
                                  }`}>
                                    {segment.riskLevel === "impossible" ? "Impossible" :
                                     segment.riskLevel === "risky" ? "High Risk" : "Tight"}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {segment.gapMinutes} min gap
                                  </span>
                                </div>
                                <p className="font-medium text-gray-900">
                                  {segment.fromCustomer} → {segment.toCustomer}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {segment.fromEndTime} → {segment.toStartTime}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700 mt-2">{segment.suggestion}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                      </div>
                      <p className="text-gray-600">Your route looks good! All travel times are adequate.</p>
                    </div>
                  )}

                  {/* Quick Actions */}
                  {travelRiskSegments.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-3">Quick Fixes:</h4>
                      <div className="grid gap-2">
                        <button
                          onClick={() => handleTravelRiskAction("add_buffer")}
                          className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-orange-200 hover:border-orange-400 transition text-left"
                        >
                          <div className="p-2 bg-orange-100 rounded-lg">
                            <Clock className="h-5 w-5 text-orange-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Add Buffer Time</p>
                            <p className="text-sm text-gray-600">Automatically add buffer between appointments</p>
                          </div>
                        </button>

                        <button
                          onClick={() => handleTravelRiskAction("optimize_route")}
                          className="flex items-center gap-3 p-4 bg-white rounded-lg border-2 border-blue-200 hover:border-blue-400 transition text-left"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Navigation className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Go to Routes Page</p>
                            <p className="text-sm text-gray-600">Optimize route order or reschedule appointments</p>
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => setShowTravelRiskModal(false)}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Exercise Modal - Body Care */}
      {showExerciseModal && selectedExercise && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedExercise.color} px-6 py-4`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-white">
                  <span className="text-2xl">{selectedExercise.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold">{selectedExercise.area}</h3>
                    <p className="text-white/80 text-sm">{selectedExercise.duration}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowExerciseModal(false);
                    setSelectedExercise(null);
                    setExerciseStep(0);
                  }}
                  className="text-white/80 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
              {/* Progress indicator */}
              <div className="flex gap-1 mb-6">
                {selectedExercise.steps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${
                      idx <= exerciseStep ? "bg-gradient-to-r " + selectedExercise.color : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              {/* Current step */}
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">
                  Step {exerciseStep + 1} of {selectedExercise.steps.length}
                </p>
                <h4 className="text-xl font-bold text-gray-900 mb-4">
                  {selectedExercise.steps[exerciseStep].title}
                </h4>
                <div className={`${selectedExercise.bgColor} ${selectedExercise.borderColor} border rounded-xl p-6 mb-6`}>
                  <p className="text-gray-700 leading-relaxed">
                    {selectedExercise.steps[exerciseStep].instruction}
                  </p>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-3">
                  {exerciseStep > 0 && (
                    <button
                      onClick={() => setExerciseStep(exerciseStep - 1)}
                      className="btn flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-0"
                    >
                      Previous
                    </button>
                  )}
                  {exerciseStep < selectedExercise.steps.length - 1 ? (
                    <button
                      onClick={() => setExerciseStep(exerciseStep + 1)}
                      className={`btn flex-1 text-white border-0 bg-gradient-to-r ${selectedExercise.color} hover:opacity-90`}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setShowExerciseModal(false);
                        setSelectedExercise(null);
                        setExerciseStep(0);
                        toast.success("Great job! Your body thanks you", { icon: "💪" });
                      }}
                      className="btn flex-1 bg-green-500 hover:bg-green-600 text-white border-0"
                    >
                      Complete!
                    </button>
                  )}
                </div>
              </div>

              {/* Encouragement */}
              <div className="mt-6 text-center text-sm text-gray-500">
                {exerciseStep === 0 && "Take your time - listen to your body"}
                {exerciseStep === 1 && "You're doing great!"}
                {exerciseStep === 2 && "Halfway there - keep going!"}
                {exerciseStep >= 3 && "Almost done - you've got this!"}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t px-6 py-4 bg-gray-50">
              <button
                onClick={() => {
                  setShowExerciseModal(false);
                  setSelectedExercise(null);
                  setExerciseStep(0);
                }}
                className="btn w-full bg-gray-200 hover:bg-gray-300 text-gray-700 border-0"
              >
                Close
              </button>
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
