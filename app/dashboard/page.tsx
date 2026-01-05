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
} from "lucide-react";
import TrialStatus from "@/components/TrialStatus";
import toast from "react-hot-toast";

interface TodaysStats {
  appointments: number;
  totalAppointments: number;
  confirmedCount: number;
  completedCount: number;
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
  contactMethods?: string[];
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
      const today = new Date().toISOString().split('T')[0];
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

    // Build Google Maps directions URL from current location to next appointment
    // Using empty string for origin triggers "Your Location" in Google Maps
    const destination = encodeURIComponent(stats.nextAppointment.address);
    const url = `https://www.google.com/maps/dir/?api=1&origin=&destination=${destination}&travelmode=driving`;

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
    window.location.href = `sms:${phone}`;
  }

  function handleWhatsApp(phone?: string) {
    if (!phone) {
      toast.error("No phone number available");
      return;
    }
    // Remove non-digits from phone number
    const cleanPhone = phone.replace(/\D/g, '');
    window.open(`https://wa.me/1${cleanPhone}`, '_blank');
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

  async function handleStartGrooming(appointmentId: string) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "IN_PROGRESS" }),
      });

      if (response.ok) {
        toast.success("Grooming started!");
        await fetchDashboardData();
      } else {
        toast.error("Failed to start grooming");
      }
    } catch (error) {
      console.error("Start grooming error:", error);
      toast.error("Failed to start grooming");
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

  return (
    <div className={`max-w-7xl mx-auto pb-20 ${isFullscreen ? 'fixed inset-0 z-[60] bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A] overflow-hidden max-w-none px-0 pb-0 pt-0' : ''}`}>
      {/* Demo Button - Only show when no appointments */}
      {!stats?.hasData && !isFullscreen && (
        <div className="mb-4 flex justify-end">
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
                  href="/app/routes"
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
      {stats?.hasData && stats.nextAppointment ? (
        <div className={`text-white ${
          stats.nextAppointment.status === "IN_PROGRESS"
            ? (isFullscreen
              ? 'min-h-screen flex flex-col justify-start p-4 rounded-none border-0 shadow-none bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800'
              : 'rounded-xl shadow-lg p-6 mb-6 border border-blue-400/30 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800')
            : (isFullscreen
              ? 'min-h-screen flex flex-col justify-start p-4 rounded-none border-0 shadow-none bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A]'
              : 'rounded-xl shadow-lg p-6 mb-6 border border-[#A5744A]/30 bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A]')
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {stats.nextAppointment.status === "IN_PROGRESS" ? "In Progress" : "Next Stop"} - {formatTime(stats.nextAppointment.startAt)}
            </h2>
            <div className="flex items-center gap-2">
              {/* Badge hidden on mobile - shown below buttons instead */}
              <p className="hidden sm:block text-white/60 text-sm">
                {stats.appointments - 1} more after this one
              </p>
              <button
                onClick={toggleFullscreen}
                className="btn btn-md bg-white/20 hover:bg-white/30 border-0 text-white gap-1 md:hidden px-4"
                title={isFullscreen ? "Exit focus mode" : "Enter focus mode"}
              >
                <Maximize className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className={`backdrop-blur-sm rounded-lg p-4 mb-4 border ${
            stats.nextAppointment.status === "IN_PROGRESS"
              ? "bg-white/10 border-white/20"
              : "bg-[#A5744A]/10 border-[#A5744A]/20"
          }`}>
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Column 1: Info and Contact Methods */}
              <div className="flex-1 min-w-0 w-full">
                <div className="text-center md:text-left">
                  <p className="font-bold text-lg mb-1">{stats.nextAppointment.customerName}</p>
                  {/* Enhanced Pet Display */}
                  {stats.nextAppointment.petName && (
                    <div className="bg-white/10 rounded-lg px-3 py-2 inline-block mb-2">
                      <p className="text-white font-medium text-sm flex items-center gap-2">
                        <span>🐕</span>
                        <span>{stats.nextAppointment.petName}</span>
                        {stats.nextAppointment.petBreed && (
                          <span className="text-white/70">({stats.nextAppointment.petBreed})</span>
                        )}
                        {stats.nextAppointment.petWeight && (
                          <span className="text-white/70">• {stats.nextAppointment.petWeight} lbs</span>
                        )}
                      </p>
                      <p className="text-white/90 text-xs mt-1 font-medium">
                        {stats.nextAppointment.serviceType}
                      </p>
                    </div>
                  )}
                  <p className="text-white/90 text-sm">{stats.nextAppointment.address}</p>
                  <p className="text-white/80 text-xs mt-2 flex items-center justify-center md:justify-start gap-1">
                    <Clock className="h-3 w-3" />
                    {formatTime(stats.nextAppointment.startAt)}
                    {stats.nextAppointment.serviceMinutes && ` (${stats.nextAppointment.serviceMinutes} min)`}
                  </p>
                </div>

                {/* Contact Methods */}
                {stats.nextAppointment.customerPhone && stats.contactMethods && stats.contactMethods.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {stats.contactMethods.includes("call") && (
                      <button
                        onClick={() => handleCall(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </button>
                    )}
                    {stats.contactMethods.includes("sms") && (
                      <button
                        onClick={() => handleSMS(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <MessageSquare className="h-4 w-4" />
                        SMS
                      </button>
                    )}
                    {stats.contactMethods.includes("whatsapp") && (
                      <button
                        onClick={() => handleWhatsApp(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        💚 WhatsApp
                      </button>
                    )}
                    {stats.contactMethods.includes("signal") && (
                      <button
                        onClick={() => handleSignal(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        🔵 Signal
                      </button>
                    )}
                    {stats.contactMethods.includes("telegram") && (
                      <button
                        onClick={() => handleTelegram(stats.nextAppointment?.customerPhone)}
                        className="btn h-10 px-4 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        ✈️ Telegram
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Column 2: Map Preview */}
              <div className="w-full md:w-auto flex justify-center md:justify-end">
                <div className="rounded-lg overflow-hidden border-2 border-white/20">
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
            {/* Primary: Start Driving - Only show when NOT in progress (groomer is already there when in progress) */}
            {stats.nextAppointment.status !== "IN_PROGRESS" && (
              <button
                onClick={startDriving}
                className="w-full font-semibold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg bg-[#A5744A] hover:bg-[#8B6239] text-white"
              >
                <Navigation className="h-6 w-6" />
                Start Driving
              </button>
            )}

            {/* Secondary Actions - Start Grooming, Skip & Complete */}
            <div className={`grid gap-2 ${stats.nextAppointment.status === "CONFIRMED" ? "grid-cols-3" : "grid-cols-2"}`}>
              {/* Start Grooming - Only show when CONFIRMED */}
              {stats.nextAppointment.status === "CONFIRMED" && (
                <button
                  onClick={() => stats.nextAppointment && handleStartGrooming(stats.nextAppointment.appointmentId)}
                  className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Play className="h-5 w-5" />
                  <span className="hidden sm:inline">Start Grooming</span>
                  <span className="sm:hidden">Start</span>
                </button>
              )}
              {/* Skip button */}
              <button
                onClick={() => stats.nextAppointment && openSkipModal(stats.nextAppointment.appointmentId)}
                className="bg-red-500/80 hover:bg-red-500/90 border border-red-300/30 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <SkipForward className="h-5 w-5" />
                Skip
              </button>
              {/* Complete button with confirmation */}
              <button
                onClick={() => stats.nextAppointment && openCompleteConfirm(stats.nextAppointment.appointmentId)}
                className="bg-green-500/80 hover:bg-green-500/90 border border-green-300/30 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="h-5 w-5" />
                Complete
              </button>
            </div>

            {/* Appointments left - separate row on mobile */}
            <div className="flex justify-center sm:hidden mt-3">
              <p className="text-white/60 text-sm">
                {stats.appointments - 1} more after this one
              </p>
            </div>
          </div>
        </div>
      ) : (
        // Empty state - No appointments today
        <div className="bg-white rounded-xl shadow-lg p-8 mb-6 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">No Appointments Today</h2>
          <p className="text-gray-600 mb-6">
            Start by adding your first customer and scheduling an appointment
          </p>
          <Link
            href="/app/appointments"
            className="btn btn-lg bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 font-semibold"
          >
            <Plus className="h-5 w-5" />
            Schedule Appointment
          </Link>
        </div>
      )}

      {/* Day Status Card - Calm & Control messaging */}
      {stats?.hasData && !isFullscreen && (
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-sm border border-emerald-100 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-full">
              <Smile className="h-7 w-7 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {stats.dayStatus === "completed"
                  ? "Day Complete"
                  : stats.dayStatus === "in-progress"
                    ? "Day in Progress"
                    : "Your Day is Ready"}
              </h3>
              <p className="text-gray-600 text-sm mt-0.5">
                {stats.totalAppointments} appointment{stats.totalAppointments !== 1 ? "s" : ""}
                {stats.completedCount > 0 && ` · ${stats.completedCount} completed`}
                {stats.confirmedCount > 0 && stats.completedCount === 0 && ` · All confirmed`}
              </p>
              <p className="text-emerald-700 font-medium mt-2 text-sm italic">
                &ldquo;{stats.calmMessage}&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Performance - Supportive Achievement */}
      {performanceData && stats?.hasData && !isFullscreen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today&apos;s Performance</h3>
            {/* Assistant Toggle */}
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
              {performanceData.hasAssistant ? "With Bather" : "Solo"}
            </button>
          </div>

          {/* Headline */}
          <p className="text-2xl font-bold text-emerald-600 mb-1">
            {performanceData.today.headline}
          </p>
          <p className="text-gray-600 mb-2">
            {performanceData.today.subtext}
          </p>

          {/* Dynamic Progress Context */}
          {performanceData.today.dogsScheduled > 0 && (
            <div className="mb-4">
              {/* Progress Bar */}
              <div className="flex items-center gap-3 mb-2">
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                    style={{
                      width: `${(performanceData.today.dogsGroomed / performanceData.today.dogsScheduled) * 100}%`
                    }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  {Math.round((performanceData.today.dogsGroomed / performanceData.today.dogsScheduled) * 100)}%
                </span>
              </div>
              {/* Contextual message based on progress */}
              <p className="text-xs text-gray-500">
                {performanceData.today.dogsGroomed === 0
                  ? `${performanceData.today.dogsScheduled} appointments ahead - you've got this!`
                  : performanceData.today.dogsGroomed === performanceData.today.dogsScheduled
                    ? "All done! Great work today."
                    : performanceData.today.dogsGroomed >= performanceData.today.dogsScheduled / 2
                      ? `Past the halfway mark! ${performanceData.today.dogsScheduled - performanceData.today.dogsGroomed} more to go.`
                      : `Good progress! ${performanceData.today.dogsScheduled - performanceData.today.dogsGroomed} appointments remaining.`
                }
              </p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">
                {performanceData.today.dogsGroomed}/{performanceData.today.dogsScheduled}
              </p>
              <p className="text-xs text-gray-500">Dogs</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">
                {performanceData.today.energyLoad}
              </p>
              <p className="text-xs text-gray-500">Energy Load</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-gray-900">
                {performanceData.today.largeDogCount}
              </p>
              <p className="text-xs text-gray-500">Large Dogs</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 text-center">
              <p className="text-xl font-bold text-[#A5744A]">
                ${performanceData.today.revenue.toFixed(0)}
              </p>
              <p className="text-xs text-gray-500">Revenue</p>
            </div>
          </div>

          {/* Break Stats */}
          {performanceData.breakStats && (
            <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg mb-4">
              <Coffee className="h-5 w-5 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {performanceData.breakStats.breaksTakenToday === 0
                    ? "No breaks yet today"
                    : `${performanceData.breakStats.breaksTakenToday} break${performanceData.breakStats.breaksTakenToday !== 1 ? "s" : ""} taken`}
                  {performanceData.breakStats.totalBreakMinutes > 0 &&
                    ` (${performanceData.breakStats.totalBreakMinutes} min)`}
                </p>
                <p className="text-xs text-gray-500">
                  {performanceData.breakStats.breaksTakenToday === 0
                    ? "Remember: rest isn't lazy, it's sustainable"
                    : "Taking breaks protects your career longevity"}
                </p>
              </div>
            </div>
          )}

          {/* Soft Comparison */}
          <p className="text-sm text-gray-500 mb-4">
            {performanceData.today.softComparison}
          </p>

          {/* Expandable Industry Insights */}
          <button
            onClick={() => setShowInsights(!showInsights)}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showInsights ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            See industry insights
          </button>

          {showInsights && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Dogs per day</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {performanceData.insights.dogsPerDay.user30Day.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      vs {performanceData.insights.dogsPerDay.industry}
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Energy load</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {performanceData.insights.energyLoad.userAvg.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      ({performanceData.insights.energyLoad.comparison})
                    </span>
                  </div>
                </div>
                {performanceData.insights.driveTime.userAvg !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Avg drive time</span>
                    <div className="text-right">
                      <span className="font-medium text-gray-900">
                        {performanceData.insights.driveTime.userAvg} min
                      </span>
                      <span className="text-gray-400 text-xs ml-2">
                        (target: {performanceData.insights.driveTime.target})
                      </span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cancellation rate</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {performanceData.insights.cancellationRate.user.toFixed(1)}%
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      (typical: {performanceData.insights.cancellationRate.typical})
                    </span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Large dogs/day</span>
                  <div className="text-right">
                    <span className="font-medium text-gray-900">
                      {performanceData.insights.largeDogs.userAvg.toFixed(1)}
                    </span>
                    <span className="text-gray-400 text-xs ml-2">
                      ({performanceData.insights.largeDogs.typical})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Route Efficiency */}
          {performanceData.routeEfficiency && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">Route Efficiency</span>
                </div>
                <span className={`text-sm font-medium ${
                  performanceData.routeEfficiency.ratingKey === "excellent"
                    ? "text-green-600"
                    : performanceData.routeEfficiency.ratingKey === "good"
                      ? "text-blue-600"
                      : "text-amber-600"
                }`}>
                  {performanceData.routeEfficiency.rating}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {performanceData.routeEfficiency.avgMinutesBetweenStops} min avg between stops
                {performanceData.today.estimatedFinish && ` · Est. finish: ${performanceData.today.estimatedFinish}`}
              </p>
            </div>
          )}
        </div>
      )}

      {/* This Week - Calm Impact Summary */}
      {revenueStats?.calmImpact && !isFullscreen && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Days Organized */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyOrganizedDays}
                </p>
                <p className="text-xs text-gray-600">Days organized</p>
              </div>
            </div>

            {/* Appointments Ran Smoothly */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyAppointmentsSmooth}
                </p>
                <p className="text-xs text-gray-600">Ran smoothly</p>
              </div>
            </div>

            {/* Clients Served */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyClientsServed}
                </p>
                <p className="text-xs text-gray-600">Happy clients</p>
              </div>
            </div>
          </div>

          {/* Calm Impact Message */}
          {revenueStats.calmImpact.calmImpactMessage && (
            <p className="text-center text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
              {revenueStats.calmImpact.calmImpactMessage}
            </p>
          )}
        </div>
      )}

      {/* Your Earnings - Only show when not in fullscreen */}
      {revenueStats && !isFullscreen && (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Earnings</h2>
          </div>

          {/* Revenue Chart */}
          <div className="p-6">
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Last 7 Days</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-green-400"></div>
                    <span className="text-gray-600">Earned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-300"></div>
                    <span className="text-gray-600">Lost</span>
                  </div>
                </div>
              </div>
              {/* Chart with Y-axis */}
              <div className="flex gap-2">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between h-[160px] text-xs text-gray-500 pr-2" style={{ minWidth: '40px' }}>
                  {(() => {
                    const maxTotal = Math.max(...revenueStats.dailyRevenue.map(d => d.revenue + d.lostRevenue), 1);
                    return (
                      <>
                        <span>${maxTotal.toFixed(0)}</span>
                        <span>${(maxTotal * 0.75).toFixed(0)}</span>
                        <span>${(maxTotal * 0.5).toFixed(0)}</span>
                        <span>${(maxTotal * 0.25).toFixed(0)}</span>
                        <span>$0</span>
                      </>
                    );
                  })()}
                </div>
                {/* Chart bars */}
                <div className="flex-1 flex items-end justify-between gap-2 h-48">
                  {revenueStats.dailyRevenue.map((day) => {
                    const totalRevenue = day.revenue + day.lostRevenue;
                    const maxTotal = Math.max(...revenueStats.dailyRevenue.map(d => d.revenue + d.lostRevenue));
                    const totalHeightPercent = maxTotal > 0 ? (totalRevenue / maxTotal) * 100 : 0;
                    const earnedHeightPercent = totalRevenue > 0 ? (day.revenue / totalRevenue) * 100 : 0;
                    const lostHeightPercent = totalRevenue > 0 ? (day.lostRevenue / totalRevenue) * 100 : 0;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full flex flex-col justify-end" style={{ height: '160px' }}>
                          <div
                            className="w-full flex flex-col justify-end cursor-pointer group"
                            style={{ height: `${totalHeightPercent}%`, minHeight: totalRevenue > 0 ? '8px' : '0' }}
                          >
                            {/* Lost revenue (top - red) */}
                            {day.lostRevenue > 0 && (
                              <div
                                className="w-full bg-red-300 rounded-t-lg transition-all hover:bg-red-400"
                                style={{ height: `${lostHeightPercent}%`, minHeight: '4px' }}
                                title={`Lost: $${day.lostRevenue.toFixed(0)} (${day.lostAppointments} cancelled/no-show)`}
                              />
                            )}
                            {/* Earned revenue (bottom - green) */}
                            {day.revenue > 0 && (
                              <div
                                className={`w-full bg-gradient-to-t from-green-500 to-green-400 transition-all hover:opacity-80 ${day.lostRevenue === 0 ? 'rounded-t-lg' : ''}`}
                                style={{ height: `${earnedHeightPercent}%`, minHeight: '4px' }}
                                title={`Earned: $${day.revenue.toFixed(0)} (${day.appointments} completed)`}
                              />
                            )}
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1.5 rounded whitespace-nowrap z-10">
                              <div className="text-green-300">${day.revenue.toFixed(0)} earned</div>
                              {day.lostRevenue > 0 && <div className="text-red-300">${day.lostRevenue.toFixed(0)} lost</div>}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{day.dayName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.weeklyRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Weekly Earnings</p>
                <p className="text-xs text-gray-500">{revenueStats.weeklyAppointments} jobs completed</p>
                {revenueStats.weeklyLostRevenue > 0 && (
                  <p className="text-xs text-red-500 mt-1">-${revenueStats.weeklyLostRevenue.toFixed(0)} lost</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Monthly Earnings</p>
                <p className="text-xs text-gray-500">{revenueStats.monthlyAppointments} jobs completed</p>
                {revenueStats.monthlyLostRevenue > 0 && (
                  <p className="text-xs text-red-500 mt-1">-${revenueStats.monthlyLostRevenue.toFixed(0)} lost</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.avgRevenuePerAppointment.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Avg per Job</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{revenueStats.completionRate.toFixed(0)}%</p>
                <p className="text-xs text-gray-600 mt-1">Completion Rate</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Tap Quick Actions */}
      {!isFullscreen && (
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
            <Link
              href="/app/appointments/new"
              className="flex flex-col items-center gap-2 p-4 border-2 border-[#A5744A]/30 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
            >
              <div className="p-3 bg-[#A5744A] rounded-full">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900">New Appointment</span>
            </Link>

            <Link
              href="/app/customers/new"
              className="flex flex-col items-center gap-2 p-4 border-2 border-[#A5744A]/20 rounded-lg hover:bg-orange-50 transition-colors text-center"
            >
              <div className="p-3 bg-[#A5744A]/20 rounded-full">
                <Plus className="h-6 w-6 text-[#8B6239]" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Add Customer</span>
            </Link>
          </div>
        </div>
      </div>
      )}

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
