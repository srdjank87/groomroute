"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Navigation,
  Clock,
  DollarSign,
  Plus,
  Calendar,
  CheckCircle,
  Sparkles,
  Phone,
  MessageSquare,
  SkipForward,
  Maximize,
  Shield,
  Users,
  Smile,
  Coffee,
  UserPlus,
  ChevronDown,
  ChevronUp,
  Zap,
  AlertTriangle,
  X,
  Play,
  Dog,
  Heart,
  BarChart3,
  Info,
} from "lucide-react";
import TrialStatus from "@/components/TrialStatus";
import toast from "react-hot-toast";

interface WorkloadData {
  level: "day-off" | "light" | "moderate" | "busy" | "heavy" | "overloaded";
  label: string;
  message: string;
  color: string;
  textColor: string;
  emoji: string;
  showCalmLink: boolean;
  stressPoints: string[];
  score: number;
}

interface TodaysStats {
  appointments: number;
  totalAppointments: number;
  confirmedCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  dayStatus: "ready" | "in-progress" | "completed" | "no-appointments";
  calmMessage: string;
  hasRoute: boolean;
  nextAppointment?: {
    customerName: string;
    address: string;
    startAt: string; // ISO string - format on client for correct timezone
    petName?: string;
    petBreed?: string;
    petWeight?: number;
    serviceType: string;
    serviceMinutes?: number;
    customerPhone?: string;
    appointmentId: string;
    status?: string;
  };
  hasData: boolean;
  showSampleData: boolean;
  workdayStarted: boolean;
  contactMethods?: string[];
  preferredMessaging?: "SMS" | "WHATSAPP";
  preferredMaps?: "GOOGLE" | "APPLE";
  remainingAppointments?: {
    customerName: string;
    customerPhone?: string;
    startAt: string;
  }[];
  workload?: WorkloadData;
  hasAssistant?: boolean;
  largeDogCount?: number;
  totalMinutes?: number;
}

interface CalmImpact {
  weeklyTimeRecoveredMinutes: number;
  monthlyTimeRecoveredMinutes: number;
  weeklyOrganizedDays: number;
  monthlyOrganizedDays: number;
  weeklyClientsServed: number;
  monthlyClientsServed: number;
  weeklyAppointmentsSmooth: number;
  monthlyAppointmentsSmooth: number;
  calmImpactMessage: string;
}

interface DogsBySize {
  small: number;
  medium: number;
  large: number;
  giant: number;
}

interface TodayPerformance {
  headline: string;
  subtext: string;
  softComparison: string;
  dogsGroomed: number;
  dogsScheduled: number;
  dogsBySize: DogsBySize;
  energyLoad: number;
  largeDogCount: number;
  revenue: number;
  avgDriveMinutes: number | null;
  estimatedFinish: string | null;
  hasAssistant: boolean;
  dayStatus: "not-started" | "in-progress" | "completed";
}

interface WeeklyPerformance {
  headline: string;
  subtext: string;
  dogsGroomed: number;
  dogsBySize: DogsBySize;
  totalEnergyLoad: number;
  revenue: number;
  daysWorked: number;
  avgDogsPerDay: number;
  avgEnergyPerDay: number;
  avgDriveMinutesPerStop: number | null;
  avgRevenuePerDay: number;
}

interface IndustryInsights {
  dogsPerDay: { industry: string; user30Day: number; comparison: string };
  energyLoad: { industry: string; userAvg: number; comparison: string };
  driveTime: { target: string; userAvg: number | null; comparison: string };
  cancellationRate: { typical: string; user: number; comparison: string };
  largeDogs: { typical: string; userAvg: number; comparison: string };
}

interface BreakStats {
  breaksTakenToday: number;
  totalBreakMinutes: number;
  lastBreakTime: string | null;
  scheduledBreaks: number;
}

interface PerformanceData {
  today: TodayPerformance;
  weekly: WeeklyPerformance;
  insights: IndustryInsights;
  routeEfficiency: {
    rating: string;
    ratingKey: string;
    avgMinutesBetweenStops: number;
    totalDriveMinutes: number;
    totalStops: number;
  } | null;
  breakStats: BreakStats;
  hasAssistant: boolean;
  defaultHasAssistant: boolean;
  assistantCapacity?: {
    canAddMore: boolean;
    additionalSlots: number;
    message: string;
  };
}

interface RevenueStats {
  dailyRevenue: {
    date: string;
    dayName: string;
    revenue: number;
    lostRevenue: number;
    appointments: number;
    lostAppointments: number;
  }[];
  weeklyRevenue: number;
  weeklyLostRevenue: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  monthlyLostRevenue: number;
  monthlyAppointments: number;
  avgRevenuePerAppointment: number;
  avgRevenuePerCustomer: number;
  uniqueCustomers: number;
  completionRate: number;
  calmImpact: CalmImpact;
}

// Format time from ISO string - display the UTC time as-is (not converted to local)
// This is because we store appointment times as "intended display time" in UTC
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, '0');
  return `${displayHours}:${displayMinutes} ${period}`;
}

// Get contextual greeting based on time of day and schedule status
function getContextualGreeting(stats: TodaysStats | null, userName?: string | null): { greeting: string; subtext: string } {
  const hour = new Date().getHours();
  const firstName = userName?.split(' ')[0] || '';

  // Time-based base greeting
  let timeGreeting = '';
  if (hour < 12) {
    timeGreeting = 'Good morning';
  } else if (hour < 17) {
    timeGreeting = 'Good afternoon';
  } else {
    timeGreeting = 'Good evening';
  }

  // If no stats yet, simple greeting
  if (!stats) {
    return {
      greeting: `${timeGreeting}${firstName ? `, ${firstName}` : ''}`,
      subtext: 'Loading your day...'
    };
  }

  // Context-aware greeting based on schedule status
  if (!stats.hasData || stats.totalAppointments === 0) {
    return {
      greeting: `${timeGreeting}${firstName ? `, ${firstName}` : ''}`,
      subtext: 'Your schedule is clear today. Time to plan or relax.'
    };
  }

  if (stats.dayStatus === 'completed') {
    return {
      greeting: `Great work${firstName ? `, ${firstName}` : ''}!`,
      subtext: `You've completed all ${stats.totalAppointments} appointment${stats.totalAppointments !== 1 ? 's' : ''} today.`
    };
  }

  if (stats.dayStatus === 'in-progress') {
    const remaining = stats.appointments;
    if (remaining === 1) {
      return {
        greeting: `Almost there${firstName ? `, ${firstName}` : ''}!`,
        subtext: 'One appointment left. You\'ve got this.'
      };
    }
    return {
      greeting: `Keep going${firstName ? `, ${firstName}` : ''}`,
      subtext: `${remaining} appointment${remaining !== 1 ? 's' : ''} remaining today.`
    };
  }

  // Day ready to start
  if (stats.totalAppointments <= 3) {
    return {
      greeting: `${timeGreeting}${firstName ? `, ${firstName}` : ''}`,
      subtext: `A calm day ahead with ${stats.totalAppointments} appointment${stats.totalAppointments !== 1 ? 's' : ''}.`
    };
  }

  return {
    greeting: `${timeGreeting}${firstName ? `, ${firstName}` : ''}`,
    subtext: `${stats.totalAppointments} appointments today. Your route is ready.`
  };
}

// Get day status color based on workload assessment
function getDayStatusColor(stats: TodaysStats | null): { color: string; label: string; showCalmLink: boolean; emoji?: string } {
  if (!stats || !stats.hasData || stats.totalAppointments === 0) {
    return { color: 'bg-gray-400', label: 'No appointments', showCalmLink: false };
  }

  if (stats.dayStatus === 'completed') {
    return { color: 'bg-emerald-500', label: 'Day complete', showCalmLink: false, emoji: '✓' };
  }

  // Use workload assessment if available
  if (stats.workload) {
    return {
      color: stats.workload.color,
      label: stats.workload.label,
      showCalmLink: stats.workload.showCalmLink,
      emoji: stats.workload.emoji,
    };
  }

  // Fallback for backward compatibility
  const remaining = stats.appointments;
  if (remaining <= 2) {
    return { color: 'bg-emerald-500', label: 'Smooth day', showCalmLink: false };
  }
  if (remaining <= 5) {
    return { color: 'bg-amber-500', label: 'Busy day', showCalmLink: true };
  }
  return { color: 'bg-red-500', label: 'Heavy day', showCalmLink: true };
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<TodaysStats | null>(null);
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [isTogglingAssistant, setIsTogglingAssistant] = useState(false);
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
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [completeAppointmentId, setCompleteAppointmentId] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [showRunningLateModal, setShowRunningLateModal] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(15);
  const [isStartingWorkday, setIsStartingWorkday] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageModalType, setMessageModalType] = useState<"sms" | "whatsapp">("sms");
  const [customMessage, setCustomMessage] = useState("");

  // Check if user can use Running Late feature (GROWTH+ only)
  const canUseRunningLate = ['GROWTH', 'PRO', 'TRIAL'].includes(
    session?.user?.subscriptionPlan || ''
  );

  useEffect(() => {
    async function handleSetup() {
      const setupSuccess = searchParams.get("setup") === "success";

      console.log("Dashboard setup - session:", session?.user?.email, "setupSuccess:", setupSuccess);

      // Wait for session to be loaded
      if (!session?.user) {
        console.log("Waiting for session to load...");
        return;
      }

      if (setupSuccess) {
        console.log("Generating sample data...");
        setIsGeneratingSample(true);

        try {
          // Generate sample data for quick win
          const response = await fetch("/api/dashboard/generate-sample", {
            method: "POST",
          });

          console.log("Sample data response status:", response.status);

          if (response.ok) {
            const data = await response.json();
            console.log("Sample data created:", data);
            toast.success("Welcome! We've created sample appointments to show you GroomRoute in action.");
            // Remove the setup query param
            window.history.replaceState({}, "", "/dashboard");
            // Fetch dashboard data
            await fetchDashboardData();
          } else {
            const errorData = await response.json();
            console.error("Sample data generation failed:", errorData);

            // If no groomer found, redirect to onboarding
            if (errorData.error?.includes("No groomer found")) {
              console.log("No groomer found, redirecting to onboarding");
              window.location.href = "/onboarding";
              return;
            }

            // If sample data already exists or other error, just fetch data
            await fetchDashboardData();
          }
        } catch (error) {
          console.error("Failed to generate sample data:", error);
          await fetchDashboardData();
        } finally {
          setIsGeneratingSample(false);
        }
      } else {
        console.log("No setup flag, fetching dashboard data normally");
        await fetchDashboardData();
      }
    }

    handleSetup();
  }, [session, searchParams]);

  async function fetchDashboardData() {
    try {
      const response = await fetch("/api/dashboard/today");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }

      // Fetch revenue stats
      const revenueResponse = await fetch("/api/dashboard/revenue-stats");
      if (revenueResponse.ok) {
        const revenueData = await revenueResponse.json();
        setRevenueStats(revenueData);
      }

      // Fetch performance data
      const performanceResponse = await fetch("/api/dashboard/performance");
      if (performanceResponse.ok) {
        const perfData = await performanceResponse.json();
        setPerformanceData(perfData);
      }

      // Also fetch today's appointments for Start Driving
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      const appointmentsResponse = await fetch(`/api/appointments?date=${today}`);
      if (appointmentsResponse.ok) {
        const appointmentsData = await appointmentsResponse.json();
        setTodaysAppointments(appointmentsData.appointments || []);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function startDriving() {
    if (!stats?.nextAppointment) {
      toast.error("No next appointment to navigate to");
      return;
    }

    const destination = encodeURIComponent(stats.nextAppointment.address);
    let url: string;

    if (stats.preferredMaps === "APPLE") {
      // Apple Maps URL scheme
      url = `https://maps.apple.com/?daddr=${destination}&dirflg=d`;
    } else {
      // Google Maps (default)
      // Using empty string for origin triggers "Your Location" in Google Maps
      url = `https://www.google.com/maps/dir/?api=1&origin=&destination=${destination}&travelmode=driving`;
    }

    // Open in new tab
    window.open(url, '_blank');
    toast.success("Opening directions to next stop");
  }

  function toggleFullscreen() {
    setIsFullscreen(!isFullscreen);
    if (!isFullscreen) {
      toast.success("Focus mode - tap the button again to exit");
      // Scroll to top when entering focus mode
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async function generateDemoData() {
    if (!confirm("This will create 6-8 demo appointments per day for the last 8 days. Continue?")) {
      return;
    }

    setIsGeneratingSample(true);
    try {
      const response = await fetch("/api/dashboard/generate-sample", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Demo appointments created! Refreshing...");
        await fetchDashboardData();
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create demo data");
      }
    } catch (error) {
      console.error("Demo data error:", error);
      toast.error("Failed to create demo data");
    } finally {
      setIsGeneratingSample(false);
    }
  }

  function handleCall(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    window.location.href = `tel:${phone}`;
  }

  function handleSMS(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    setMessageModalType("sms");
    setCustomMessage("");
    setShowMessageModal(true);
  }

  function handleWhatsApp(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    setMessageModalType("whatsapp");
    setCustomMessage("");
    setShowMessageModal(true);
  }

  function sendMessage(messageType: "onmyway" | "custom") {
    const phone = stats?.nextAppointment?.customerPhone;
    if (!phone) {
      toast.error("No phone number available");
      return;
    }

    let message = "";
    if (messageType === "onmyway") {
      message = "Hi! I'm on my way to you now. See you soon!";
    } else {
      message = customMessage;
    }

    const encodedMessage = encodeURIComponent(message);

    if (messageModalType === "sms") {
      window.location.href = `sms:${phone}?body=${encodedMessage}`;
    } else {
      const cleanPhone = phone.replace(/\D/g, '');
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, '_blank');
    }

    setShowMessageModal(false);
    setCustomMessage("");
  }

  function handleSignal(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    // Signal uses signal:// URL scheme
    window.location.href = `signal://send?phone=${phone}`;
  }

  function handleTelegram(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    // Telegram uses tg:// URL scheme
    window.location.href = `tg://resolve?phone=${phone}`;
  }

  function handleSendRunningLate() {
    const phones = stats?.remainingAppointments
      ?.map(a => a.customerPhone)
      .filter(Boolean) || [];

    if (phones.length === 0) {
      toast.error("No upcoming clients to notify");
      return;
    }

    const message = encodeURIComponent(
      `Hi! I'm running about ${delayMinutes} minutes behind schedule. Thanks for your patience!`
    );
    window.location.href = `sms:${phones.join(',')}?body=${message}`;
    setShowRunningLateModal(false);
    toast.success(`Opening SMS to notify ${phones.length} client${phones.length > 1 ? 's' : ''}`);
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

        await fetchDashboardData();
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

  function openCompleteConfirm(appointmentId: string) {
    setCompleteAppointmentId(appointmentId);
    setShowCompleteConfirm(true);
  }

  function closeCompleteConfirm() {
    setShowCompleteConfirm(false);
    setCompleteAppointmentId(null);
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
        toast.success("Appointment completed!");
        closeCompleteConfirm();
        await fetchDashboardData();
      } else {
        toast.error("Failed to complete appointment");
      }
    } catch (error) {
      console.error("Complete appointment error:", error);
      toast.error("Failed to complete appointment");
    } finally {
      setIsCompleting(false);
    }
  }

  async function toggleAssistant() {
    if (!performanceData) return;

    setIsTogglingAssistant(true);
    try {
      const newValue = !performanceData.hasAssistant;
      const response = await fetch("/api/routes/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasAssistant: newValue }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        // Refresh performance data
        const perfResponse = await fetch("/api/dashboard/performance");
        if (perfResponse.ok) {
          const perfData = await perfResponse.json();
          setPerformanceData(perfData);
        }
        // Dispatch event to notify layout of assistant status change
        window.dispatchEvent(new CustomEvent("assistantStatusChanged", { detail: { hasAssistant: newValue } }));
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

  async function handleStartWorkday() {
    setIsStartingWorkday(true);
    try {
      const response = await fetch("/api/routes/start-workday", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Let's do this! Your workday has begun.");
        // Refresh dashboard data to show the Next Stop card
        await fetchDashboardData();
      } else {
        toast.error("Failed to start workday");
      }
    } catch (error) {
      console.error("Start workday error:", error);
      toast.error("Failed to start workday");
    } finally {
      setIsStartingWorkday(false);
    }
  }

  if (isLoading || isGeneratingSample) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          {isGeneratingSample && (
            <p className="mt-4 text-gray-600">Setting up your dashboard...</p>
          )}
        </div>
      </div>
    );
  }

  // Get greeting and status
  const greeting = getContextualGreeting(stats, session?.user?.name);
  const dayStatus = getDayStatusColor(stats);

  return (
    <div className={`max-w-7xl mx-auto pb-20 ${isFullscreen ? 'fixed inset-0 z-[60] bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A] overflow-hidden max-w-none px-0 pb-0 pt-0' : ''}`}>
      {/* Contextual Greeting Header */}
      {!isFullscreen && (
        <div className="mb-6">
          {/* Desktop: side by side, Mobile: stacked */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{greeting.greeting}</h1>
              <p className="text-gray-600 mt-1">{greeting.subtext}</p>
            </div>
            {/* Day Status Indicator - Below greeting on mobile */}
            {stats?.hasData && (
              dayStatus.showCalmLink ? (
                <Link
                  href="/dashboard/calm"
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-full w-fit transition-colors group"
                >
                  {dayStatus.emoji && <span className="text-sm">{dayStatus.emoji}</span>}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dayStatus.color} animate-pulse`}></div>
                  <span className="text-sm text-gray-600 whitespace-nowrap group-hover:text-gray-900">{dayStatus.label}</span>
                  <Heart className="h-3.5 w-3.5 text-gray-400 group-hover:text-pink-500 transition-colors" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-full w-fit">
                  {dayStatus.emoji && <span className="text-sm">{dayStatus.emoji}</span>}
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dayStatus.color}`}></div>
                  <span className="text-sm text-gray-600 whitespace-nowrap">{dayStatus.label}</span>
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Demo Buttons - Show when no appointments today */}
      {!stats?.hasData && !isFullscreen && (
        <div className="mb-4 flex justify-end gap-2">
          <button
            onClick={async () => {
              if (confirm("Clear all sample data and start fresh?")) {
                await fetch("/api/dashboard/clear-sample", { method: "POST" });
                toast.success("Sample data cleared");
                window.location.reload();
              }
            }}
            className="btn btn-sm btn-ghost text-gray-500 hover:text-gray-700 gap-2"
          >
            <X className="h-4 w-4" />
            Clear Sample Data
          </button>
          <button
            onClick={generateDemoData}
            className="btn btn-sm bg-purple-600 hover:bg-purple-700 text-white border-0 gap-2"
          >
            <Sparkles className="h-4 w-4" />
            Generate Demo Appointments
          </button>
        </div>
      )}

      {/* Trial/Subscription Status */}
      {!isFullscreen && <TrialStatus />}

      {/* Sample Data Banner - Only show on first login with no data */}
      {stats?.showSampleData && !isFullscreen && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg shadow-lg text-white p-6 mb-6">
          <div className="flex items-start gap-3">
            <Sparkles className="h-6 w-6 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-1">See GroomRoute in Action</h3>
              <p className="text-white/90 text-sm mb-4">
                We&apos;ve created a sample route with 5 appointments to show you how much time and money you can save. This is just a preview - you can clear it anytime and add your real appointments.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/dashboard/routes"
                  className="btn btn-sm bg-white text-purple-600 hover:bg-gray-100 border-0 font-semibold"
                >
                  View Sample Route
                </Link>
                <button
                  onClick={async () => {
                    if (confirm("Clear sample data and start fresh?")) {
                      await fetch("/api/dashboard/clear-sample", { method: "POST" });
                      window.location.reload();
                    }
                  }}
                  className="btn btn-sm bg-white/20 text-white border-2 border-white/40 hover:bg-white/30 hover:border-white/60 font-semibold px-4"
                >
                  Clear Sample Data
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section - Today's Route */}
      {stats?.hasData && stats.nextAppointment && !stats.workdayStarted ? (
        // Pre-workday state - Show calm message with Start My Workday button
        <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 mb-6 text-center border border-slate-200">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Coffee className="h-10 w-10 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Ready when you are</h2>
          <p className="text-gray-600 mb-1">
            You have {stats.totalAppointments} appointment{stats.totalAppointments !== 1 ? "s" : ""} scheduled for today.
          </p>
          <p className="text-indigo-600 text-sm italic mb-6">
            Take a moment, grab your coffee, and start when you&apos;re ready.
          </p>
          <button
            onClick={handleStartWorkday}
            disabled={isStartingWorkday}
            className="btn btn-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white border-0 font-semibold shadow-lg gap-2 px-8"
          >
            {isStartingWorkday ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <Play className="h-5 w-5" />
            )}
            Start My Workday
          </button>
          <p className="text-gray-400 text-xs mt-4">
            Your first stop: {stats.nextAppointment.customerName} at {formatTime(stats.nextAppointment.startAt)}
          </p>
        </div>
      ) : stats?.hasData && stats.nextAppointment && stats.workdayStarted ? (
        <div className={`text-gray-900 ${
          stats.nextAppointment.status === "IN_PROGRESS"
            ? (isFullscreen
              ? 'min-h-screen flex flex-col justify-start p-4 rounded-none border-0 shadow-none bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100'
              : 'rounded-xl shadow-lg p-6 mb-6 border border-blue-200 bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-100')
            : (isFullscreen
              ? 'min-h-screen flex flex-col justify-start p-4 rounded-none border-0 shadow-none bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100'
              : 'rounded-xl shadow-lg p-6 mb-6 border border-emerald-200 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100')
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {stats.nextAppointment.status === "IN_PROGRESS" ? "In Progress" : "Next Stop"} - {formatTime(stats.nextAppointment.startAt)}
            </h2>
            <div className="flex items-center gap-2">
              {/* Badge hidden on mobile - shown below buttons instead */}
              <p className="hidden sm:block text-gray-500 text-sm">
                {stats.appointments - 1 === 0
                  ? "Last one — you got this! 🎉"
                  : `${stats.appointments - 1} more after this one`}
              </p>
              <button
                onClick={toggleFullscreen}
                className="btn btn-md bg-gray-900/10 hover:bg-gray-900/20 border-0 text-gray-700 gap-1 md:hidden px-4"
                title={isFullscreen ? "Exit focus mode" : "Enter focus mode"}
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-lg p-4 mb-4 border ${
            stats.nextAppointment.status === "IN_PROGRESS"
              ? "bg-white/60 border-blue-200"
              : "bg-white/60 border-emerald-200"
          }`}>
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Column 1: Info and Contact Methods */}
              <div className="flex-1 min-w-0 w-full">
                <div className="text-center md:text-left">
                  <p className="font-bold text-lg mb-1 text-gray-900">{stats.nextAppointment.customerName}</p>
                  {/* Enhanced Pet Display */}
                  {stats.nextAppointment.petName && (
                    <div className="bg-emerald-100/80 rounded-lg px-3 py-2 inline-block mb-2">
                      <p className="text-emerald-800 font-medium text-sm flex items-center gap-2">
                        <span>🐕</span>
                        <span>{stats.nextAppointment.petName}</span>
                        {stats.nextAppointment.petBreed && (
                          <span className="text-emerald-600">({stats.nextAppointment.petBreed})</span>
                        )}
                        {stats.nextAppointment.petWeight && (
                          <span className="text-emerald-600">• {stats.nextAppointment.petWeight} lbs</span>
                        )}
                      </p>
                      <p className="text-emerald-700 text-xs mt-1 font-medium">
                        {stats.nextAppointment.serviceType}
                      </p>
                    </div>
                  )}
                  <p className="text-gray-700 text-sm">{stats.nextAppointment.address}</p>
                  <p className="text-gray-500 text-xs mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(stats.nextAppointment.startAt)}
                    {stats.nextAppointment.serviceMinutes && (
                      <>
                        {" - "}
                        {(() => {
                          const startDate = new Date(stats.nextAppointment.startAt);
                          const endDate = new Date(startDate.getTime() + stats.nextAppointment.serviceMinutes * 60000);
                          const hours = endDate.getUTCHours();
                          const minutes = endDate.getUTCMinutes();
                          const period = hours >= 12 ? 'PM' : 'AM';
                          const displayHours = hours % 12 || 12;
                          return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
                        })()}
                        {` (${stats.nextAppointment.serviceMinutes} min)`}
                      </>
                    )}
                  </p>
                </div>

                {/* Contact Methods - Call + Preferred Messaging */}
                {stats.nextAppointment.customerPhone && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    <button
                      onClick={() => handleCall(stats.nextAppointment?.customerPhone)}
                      className="btn h-10 px-4 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-2"
                    >
                      <Phone className="h-4 w-4" />
                      Call
                    </button>
                    {stats.preferredMessaging === "WHATSAPP" ? (
                      <button
                        onClick={() => handleWhatsApp(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-2"
                      >
                        💚 WhatsApp
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSMS(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-emerald-600 hover:bg-emerald-700 border-0 text-white gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Column 2: Map Preview */}
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <div className="rounded-lg overflow-hidden border-2 border-emerald-200 shadow-md">
                  <Image
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(stats.nextAppointment.address)}&zoom=15&size=200x200&maptype=roadmap&markers=color:red%7C${encodeURIComponent(stats.nextAppointment.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Location map"
                    width={150}
                    height={150}
                    className={isFullscreen ? "w-[200px] h-[200px]" : "w-[150px] h-[150px]"}
                    unoptimized
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Running Late link - GROWTH+ only, only show if there are remaining appointments */}
            {stats.nextAppointment.status !== "IN_PROGRESS" && canUseRunningLate && (stats.remainingAppointments?.length || 0) > 0 && (
              <button
                onClick={() => setShowRunningLateModal(true)}
                className="text-gray-500 hover:text-gray-700 text-sm underline underline-offset-2 transition-colors text-center"
              >
                Running late? Notify all customers
              </button>
            )}

            {/* Primary: Start Driving - Only show when NOT in progress (groomer is already there when in progress) */}
            {stats.nextAppointment.status !== "IN_PROGRESS" && (
              <button
                onClick={startDriving}
                className="w-full font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg bg-teal-600 hover:bg-teal-700 text-white shadow-md"
              >
                <Navigation className="h-6 w-6" />
                Start Driving
              </button>
            )}

            {/* Secondary Actions - Handle & Complete */}
            <div className="grid gap-2 grid-cols-2">
              {/* Handle/Reschedule button - softer language */}
              <button
                onClick={() => stats.nextAppointment && openSkipModal(stats.nextAppointment.appointmentId)}
                className="bg-amber-500 hover:bg-amber-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <SkipForward className="h-5 w-5" />
                <span className="hidden sm:inline">Can&apos;t Make It</span>
                <span className="sm:hidden">Handle</span>
              </button>
              {/* Complete button with confirmation */}
              <button
                onClick={() => stats.nextAppointment && openCompleteConfirm(stats.nextAppointment.appointmentId)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <CheckCircle className="h-5 w-5" />
                Complete
              </button>
            </div>

            {/* Appointments left - separate row on mobile */}
            <div className="flex justify-center sm:hidden mt-3">
              <p className="text-gray-500 text-sm">
                {stats.appointments - 1 === 0
                  ? "Last one — you got this! 🎉"
                  : `${stats.appointments - 1} more after this one`}
              </p>
            </div>
          </div>
        </div>
      ) : stats?.hasData && stats.dayStatus === "completed" ? (
        // End of day - All appointments completed
        <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 rounded-xl shadow-lg p-8 mb-6 text-center border border-emerald-200">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Great work today!</h2>
          <p className="text-gray-600 mb-1">
            You completed {stats.completedCount} appointment{stats.completedCount !== 1 ? "s" : ""} today.
            {(stats.cancelledCount > 0 || stats.noShowCount > 0) && (
              <span className="text-gray-500">
                {stats.cancelledCount > 0 && ` ${stats.cancelledCount} cancelled.`}
                {stats.noShowCount > 0 && ` ${stats.noShowCount} no-show.`}
              </span>
            )}
          </p>
          <p className="text-emerald-600 text-sm italic mt-4">
            &ldquo;Another smooth day in the books. You&apos;ve earned your rest.&rdquo;
          </p>
        </div>
      ) : (
        // Empty state - No appointments scheduled today
        <div className="bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 rounded-xl shadow-lg p-8 mb-6 text-center border border-slate-200">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Smile className="h-8 w-8 text-slate-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Your day is open</h2>
          <p className="text-gray-600 mb-2">
            No appointments scheduled — a chance to catch up, plan ahead, or simply rest.
          </p>
          <p className="text-slate-500 text-sm italic mb-6">
            &ldquo;A clear schedule is an opportunity, not a problem.&rdquo;
          </p>
          <Link
            href="/dashboard/appointments/new"
            className="btn btn-lg bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 font-semibold px-6 py-3 h-auto min-h-0"
          >
            <Plus className="h-5 w-5 flex-shrink-0" />
            <span>Schedule an Appointment</span>
          </Link>
        </div>
      )}

      {/* Day Status Card - Calm & Control messaging (hide at end of day to avoid repetition) */}
      {stats?.hasData && !isFullscreen && stats.dayStatus !== "completed" && (
        (() => {
          // Determine card styling based on workload level
          const workloadLevel = stats.workload?.level || 'moderate';
          const isHeavyOrOverloaded = workloadLevel === 'heavy' || workloadLevel === 'overloaded';
          const isBusy = workloadLevel === 'busy';

          // Color schemes based on workload
          const cardColors = isHeavyOrOverloaded
            ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200'
            : isBusy
            ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
            : 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100';

          const iconBg = isHeavyOrOverloaded
            ? 'bg-orange-100'
            : isBusy
            ? 'bg-amber-100'
            : 'bg-emerald-100';

          const iconColor = isHeavyOrOverloaded
            ? 'text-orange-600'
            : isBusy
            ? 'text-amber-600'
            : 'text-emerald-600';

          const messageColor = isHeavyOrOverloaded
            ? 'text-orange-700'
            : isBusy
            ? 'text-amber-700'
            : 'text-emerald-700';

          // Use workload emoji or default
          const emoji = stats.workload?.emoji || '😊';

          return (
            <div className={`${cardColors} rounded-xl shadow-sm border p-6 mb-6`}>
              <div className="flex items-center gap-4">
                <div className={`p-3 ${iconBg} rounded-full`}>
                  <span className="text-2xl">{emoji}</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {stats.dayStatus === "in-progress"
                      ? "Day in Progress"
                      : stats.workload?.label || "Your Day is Ready"}
                  </h3>
                  <p className="text-gray-600 text-sm mt-0.5">
                    {stats.totalAppointments} appointment{stats.totalAppointments !== 1 ? "s" : ""}
                    {stats.completedCount > 0 && ` · ${stats.completedCount} completed`}
                    {stats.confirmedCount > 0 && stats.completedCount === 0 && ` · All confirmed`}
                  </p>
                  <p className={`${messageColor} font-medium mt-2 text-sm italic`}>
                    &ldquo;{stats.workload?.message || stats.calmMessage}&rdquo;
                  </p>
                </div>
              </div>
            </div>
          );
        })()
      )}

      {/* Today's Progress - Simplified & Calm */}
      {performanceData && stats?.hasData && !isFullscreen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
          <div className="flex items-start justify-between mb-5">
            <h3 className="text-lg font-semibold text-gray-900">Your Progress</h3>
            {/* Assistant Toggle */}
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={toggleAssistant}
                disabled={isTogglingAssistant}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  performanceData.hasAssistant
                    ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <UserPlus className="h-4 w-4" />
                {performanceData.hasAssistant ? "With Assistant" : "Solo"}
              </button>
              {/* Capacity indicator - shows when working with assistant and has capacity */}
              {performanceData.assistantCapacity?.canAddMore && (
                <span className="text-xs text-blue-600 font-medium">
                  +{performanceData.assistantCapacity.additionalSlots} slots available
                </span>
              )}
            </div>
          </div>

          {/* Dynamic Progress Context */}
          {performanceData.today.dogsScheduled > 0 && (
            <div className="mb-6">
              {/* Progress Bar - Larger and more prominent */}
              <div className="flex items-center gap-4 mb-3">
                <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(performanceData.today.dogsGroomed / performanceData.today.dogsScheduled) * 100}%`
                    }}
                  />
                </div>
                <span className="text-lg font-bold text-emerald-600">
                  {performanceData.today.dogsGroomed}/{performanceData.today.dogsScheduled}
                </span>
              </div>
              {/* Contextual message based on progress */}
              <p className="text-gray-600">
                {performanceData.today.dogsGroomed === 0
                  ? `Ready to start your day with ${performanceData.today.dogsScheduled} appointments`
                  : performanceData.today.dogsGroomed === performanceData.today.dogsScheduled
                    ? "All done! Time to head home."
                    : performanceData.today.dogsGroomed >= performanceData.today.dogsScheduled / 2
                      ? `Past halfway! ${performanceData.today.dogsScheduled - performanceData.today.dogsGroomed} more to go.`
                      : `Good start! ${performanceData.today.dogsScheduled - performanceData.today.dogsGroomed} appointments remaining.`
                }
              </p>
            </div>
          )}

          {/* Simplified Stats - Just 3 key metrics */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            {/* Est. Finish Time */}
            <div className="text-center p-3 sm:p-4 bg-emerald-50 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 mb-1">
                <Clock className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-emerald-700 font-medium">Est. Finish</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-emerald-700">
                {performanceData.today.estimatedFinish || "—"}
              </p>
            </div>
            {/* Large Dogs */}
            <div className="text-center p-3 sm:p-4 bg-amber-50 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 mb-1">
                <Dog className="h-4 w-4 text-amber-600 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-amber-700 font-medium">Large Dogs</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-amber-700">
                {performanceData.today.largeDogCount}
              </p>
            </div>
            {/* Today's Earnings */}
            <div className="text-center p-3 sm:p-4 bg-blue-50 rounded-xl">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 mb-1">
                <DollarSign className="h-4 w-4 text-blue-600 flex-shrink-0" />
                <p className="text-[10px] sm:text-xs text-blue-700 font-medium">Earnings</p>
              </div>
              <p className="text-lg sm:text-xl font-bold text-blue-700">
                ${performanceData.today.revenue.toFixed(0)}
              </p>
            </div>
          </div>

          {/* Break Reminder - More gentle */}
          {performanceData.breakStats && performanceData.today.dogsGroomed > 0 && performanceData.today.dogsGroomed < performanceData.today.dogsScheduled && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl mt-6">
              <Coffee className="h-5 w-5 text-gray-500" />
              <p className="text-sm text-gray-600">
                {performanceData.breakStats.breaksTakenToday === 0
                  ? "Remember to take a break when you need one"
                  : `${performanceData.breakStats.breaksTakenToday} break${performanceData.breakStats.breaksTakenToday !== 1 ? "s" : ""} taken · ${performanceData.breakStats.totalBreakMinutes} min`}
              </p>
            </div>
          )}

          {/* Expandable Details */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 transition-colors mt-6"
          >
            {showInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showInsights ? "Hide details" : "Show more details"}
          </button>

          {showInsights && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 group relative">
                    <span className="text-gray-500">Energy load today</span>
                    <div className="relative">
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-50">
                        Measures your workload based on dog size and service type. Helps track sustainable pace.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">
                    {performanceData.today.energyLoad}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 group relative">
                    <span className="text-gray-500">Dogs per day (30d avg)</span>
                    <div className="relative">
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-50">
                        Your average number of dogs groomed per working day over the past 30 days.
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">
                    {performanceData.insights.dogsPerDay.user30Day.toFixed(1)}
                  </span>
                </div>
                {performanceData.insights.driveTime.userAvg !== null && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 group relative">
                      <span className="text-gray-500">Avg drive time</span>
                      <div className="relative">
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-50">
                          Average time spent driving between appointments based on your route history.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </div>
                    <span className="font-medium text-gray-700">
                      {performanceData.insights.driveTime.userAvg} min
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5 group relative">
                    <span className="text-gray-500">Completion rate</span>
                    <div className="relative">
                      <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-48 z-50">
                        Percentage of scheduled appointments that were completed (not cancelled or no-show).
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                      </div>
                    </div>
                  </div>
                  <span className="font-medium text-gray-700">
                    {(100 - performanceData.insights.cancellationRate.user).toFixed(0)}%
                  </span>
                </div>
                {performanceData.routeEfficiency && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1.5 group relative">
                      <span className="text-gray-500">Route efficiency</span>
                      <div className="relative">
                        <Info className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none w-52 z-50">
                          Rates how well your route is organized geographically. Higher ratings mean less time driving between appointments.
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
                        </div>
                      </div>
                    </div>
                    <span className="font-medium text-gray-700">
                      {performanceData.routeEfficiency.rating}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Body Care Recommendation - Show based on workload/large dogs */}
      {!isFullscreen && stats?.hasData && stats.workdayStarted && (
        (() => {
          // Determine if we should show body care recommendation
          const largeDogCount = stats.largeDogCount || 0;
          const workloadLevel = stats.workload?.level || 'light';
          const completedCount = stats.completedCount || 0;

          // Show recommendation if:
          // 1. Heavy/overloaded day
          // 2. 2+ large dogs groomed
          // 3. After completing 3+ appointments
          const shouldShowBodyCare =
            workloadLevel === 'heavy' ||
            workloadLevel === 'overloaded' ||
            largeDogCount >= 2 ||
            completedCount >= 3;

          if (!shouldShowBodyCare) return null;

          // Choose recommendation message based on context
          let title = "Time for a quick reset?";
          let message = "Your body works hard for you. A few stretches can help prevent strain.";
          let emoji = "🧘";

          if (largeDogCount >= 2) {
            title = "Heavy lifting today";
            message = `${largeDogCount} large dogs groomed. Give your back and shoulders some love.`;
            emoji = "💪";
          } else if (workloadLevel === 'heavy' || workloadLevel === 'overloaded') {
            title = "Busy day — take care of yourself";
            message = "A quick stretch or reset can help you finish strong.";
            emoji = "🌟";
          } else if (completedCount >= 3) {
            title = "You're on a roll!";
            message = "Great momentum. A quick stretch keeps you going strong.";
            emoji = "⚡";
          }

          return (
            <div className="mb-6">
              <Link
                href="/dashboard/calm#body-care"
                className="block p-4 bg-gradient-to-r from-teal-50 via-cyan-50 to-teal-50 rounded-xl border border-teal-200 hover:border-teal-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full shadow-sm text-2xl">
                    {emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{title}</h3>
                    <p className="text-sm text-gray-600">{message}</p>
                  </div>
                  <span className="text-teal-600 font-medium text-sm whitespace-nowrap">Body Care →</span>
                </div>
              </Link>
            </div>
          );
        })()
      )}

      {/* Need a Breather? - Calm Center Link */}
      {!isFullscreen && (
        <div className="mb-8">
          <Link
            href="/dashboard/calm"
            className="block p-5 bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 rounded-xl border border-pink-200 hover:border-pink-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm">
                <Heart className="h-6 w-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Need a breather?</h3>
                <p className="text-sm text-gray-600">Visit the Calm Center for scripts, templates, and support</p>
              </div>
              <span className="text-pink-500 font-medium text-sm">Visit</span>
            </div>
          </Link>
        </div>
      )}

      {/* Quick Actions - Calmer styling */}
      {!isFullscreen && (
      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-500 mb-3">Quick Actions</h3>
        {/* Stack vertically on mobile, 3 columns on desktop */}
        <div className="flex flex-col sm:grid sm:grid-cols-3 gap-3 sm:gap-4">
          <Link
            href="/dashboard/appointments/new"
            className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 sm:p-2.5 bg-emerald-100 rounded-lg flex-shrink-0">
              <Calendar className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-900 block truncate">New Appointment</span>
              <span className="text-xs text-gray-500 hidden sm:block">Schedule a visit</span>
            </div>
          </Link>

          <Link
            href="/dashboard/customers/new"
            className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 sm:p-2.5 bg-blue-100 rounded-lg flex-shrink-0">
              <UserPlus className="h-5 w-5 text-blue-600" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-900 block truncate">Add Customer</span>
              <span className="text-xs text-gray-500 hidden sm:block">New client</span>
            </div>
          </Link>

          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-sm transition-all"
          >
            <div className="p-2 sm:p-2.5 bg-purple-100 rounded-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="min-w-0">
              <span className="font-medium text-gray-900 block truncate">Analytics</span>
              <span className="text-xs text-gray-500 hidden sm:block">View stats</span>
            </div>
          </Link>
        </div>
      </div>
      )}

      {/* Handle Appointment Modal */}
      {showSkipModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {!skipWarning ? (
              // Reason selection view
              <>
                <div className="flex items-center justify-between p-4 border-b">
                  <h3 className="text-lg font-semibold">Handle Appointment</h3>
                  <button onClick={closeSkipModal} className="btn btn-ghost btn-sm btn-circle">
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <div className="p-4">
                  <p className="text-gray-600 mb-4">These things happen — let&apos;s log it and move on.</p>

                  <div className="space-y-2 mb-4">
                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "CANCELLED" ? "border-amber-500 bg-amber-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="CANCELLED"
                        checked={skipReason === "CANCELLED"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio radio-warning"
                      />
                      <div>
                        <p className="font-medium">Customer needed to cancel</p>
                        <p className="text-sm text-gray-500">Life happens — they&apos;ll reschedule when ready</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "NO_SHOW" ? "border-amber-500 bg-amber-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="NO_SHOW"
                        checked={skipReason === "NO_SHOW"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio radio-warning"
                      />
                      <div>
                        <p className="font-medium">Couldn&apos;t connect</p>
                        <p className="text-sm text-gray-500">No answer or they weren&apos;t available</p>
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
                        <p className="font-medium">Moving to another day</p>
                        <p className="text-sm text-gray-500">We&apos;ll find a better time</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${skipReason === "OTHER" ? "border-gray-400 bg-gray-50" : "hover:bg-gray-50"}`}>
                      <input
                        type="radio"
                        name="skipReason"
                        value="OTHER"
                        checked={skipReason === "OTHER"}
                        onChange={(e) => setSkipReason(e.target.value)}
                        className="radio"
                      />
                      <div>
                        <p className="font-medium">Something else</p>
                        <p className="text-sm text-gray-500">I&apos;ll add a note below</p>
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
                      Go Back
                    </button>
                    <button
                      onClick={handleSkipAppointment}
                      className="btn bg-gray-600 hover:bg-gray-700 text-white flex-1"
                      disabled={!skipReason || isSkipping}
                    >
                      {isSkipping ? (
                        <span className="loading loading-spinner loading-sm"></span>
                      ) : (
                        "Confirm"
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

      {/* Running Late Modal - GROWTH+ only */}
      {showRunningLateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Notify Customers</h3>
              <button
                onClick={() => setShowRunningLateModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Let your remaining customers know you&apos;re running a bit behind. This opens your SMS app with a pre-filled message.
              </p>

              {/* Delay selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How far behind are you?
                </label>
                <div className="flex gap-2">
                  {[10, 15, 30, 45].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setDelayMinutes(mins)}
                      className={`flex-1 py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                        delayMinutes === mins
                          ? "bg-amber-500 text-white border-amber-500"
                          : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                      }`}
                    >
                      {mins} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview customers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customers to notify ({stats?.remainingAppointments?.length || 0})
                </label>
                <div className="bg-gray-50 rounded-lg p-3 max-h-32 overflow-y-auto">
                  {stats?.remainingAppointments && stats.remainingAppointments.length > 0 ? (
                    <ul className="space-y-1">
                      {stats.remainingAppointments.map((apt, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-center gap-2">
                          <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                          {apt.customerName} — {formatTime(apt.startAt)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No remaining appointments</p>
                  )}
                </div>
              </div>

              {/* Message preview */}
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Message preview:</span><br />
                  &ldquo;Hi! I&apos;m running about {delayMinutes} minutes behind schedule. Thanks for your patience!&rdquo;
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowRunningLateModal(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendRunningLate}
                  className="btn bg-amber-500 hover:bg-amber-600 text-white flex-1"
                  disabled={!stats?.remainingAppointments?.length}
                >
                  Send Updates
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Message Modal - SMS/WhatsApp message selection */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Send {messageModalType === "sms" ? "SMS" : "WhatsApp"} Message
              </h3>
              <button
                onClick={() => setShowMessageModal(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <p className="text-gray-600 mb-4">
                Choose a quick message or write your own to send to {stats?.nextAppointment?.customerName}.
              </p>

              {/* Quick message options */}
              <div className="space-y-2 mb-4">
                <button
                  onClick={() => sendMessage("onmyway")}
                  className="w-full p-3 text-left rounded-lg border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-full">
                      <Clock className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-emerald-800">On My Way</p>
                      <p className="text-sm text-emerald-600">&ldquo;Hi! I&apos;m on my way to you now. See you soon!&rdquo;</p>
                    </div>
                  </div>
                </button>
              </div>

              {/* Custom message section */}
              <div className="border-t pt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Or write a custom message
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  rows={3}
                />
                <button
                  onClick={() => sendMessage("custom")}
                  disabled={!customMessage.trim()}
                  className="w-full mt-3 btn bg-gray-800 hover:bg-gray-900 text-white disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <MessageSquare className="h-4 w-4" />
                  Send Custom Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
