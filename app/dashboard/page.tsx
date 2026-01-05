"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Navigation,
  Clock,
  DollarSign,
  Plus,
  Calendar,
  CheckCircle,
  TrendingDown,
  Sparkles,
  Phone,
  MessageSquare,
  SkipForward
} from "lucide-react";
import TrialStatus from "@/components/TrialStatus";
import toast from "react-hot-toast";

interface TodaysStats {
  appointments: number;
  nextAppointment?: {
    customerName: string;
    address: string;
    time: string;
    petName?: string;
    serviceType: string;
    customerPhone?: string;
    appointmentId: string;
  };
  timeSaved: number; // minutes
  milesSaved: number;
  estimatedGasSavings: number;
  hasData: boolean;
  showSampleData: boolean;
  contactMethods?: string[];
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<TodaysStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);

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

  async function generateDemoData() {
    if (!confirm("This will create 5 demo appointments for today. Continue?")) {
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

  async function handleSkipAppointment(appointmentId: string) {
    if (!confirm("Skip this appointment?")) {
      return;
    }

    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });

      if (response.ok) {
        toast.success("Appointment skipped");
        await fetchDashboardData();
      } else {
        toast.error("Failed to skip appointment");
      }
    } catch (error) {
      console.error("Skip appointment error:", error);
      toast.error("Failed to skip appointment");
    }
  }

  async function handleCompleteAppointment(appointmentId: string) {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      if (response.ok) {
        toast.success("Appointment completed!");
        await fetchDashboardData();
      } else {
        toast.error("Failed to complete appointment");
      }
    } catch (error) {
      console.error("Complete appointment error:", error);
      toast.error("Failed to complete appointment");
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
    <div className="max-w-7xl mx-auto pb-20">
      {/* Demo Button - Only show when no appointments */}
      {!stats?.hasData && (
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
      <TrialStatus />

      {/* Sample Data Banner - Only show on first login with no data */}
      {stats?.showSampleData && (
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
        <div className="bg-gradient-to-br from-[#2D2D2D] via-[#3D3D3D] to-[#4A4A4A] rounded-xl shadow-lg text-white p-6 mb-6 border border-[#A5744A]/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Next Stop</h2>
            <div className="badge badge-lg bg-[#A5744A]/30 border border-[#A5744A]/50 text-white">
              {stats.appointments} {stats.appointments === 1 ? 'appointment' : 'appointments'} today
            </div>
          </div>

          <div className="bg-[#A5744A]/10 backdrop-blur-sm rounded-lg p-4 mb-4 border border-[#A5744A]/20">
            <div className="flex flex-col md:flex-row items-start gap-4">
              {/* Column 1: Info and Contact Methods */}
              <div className="flex-1 min-w-0 w-full">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-3">
                  <div className="flex-shrink-0 mt-1">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div className="flex-1 min-w-0 text-center md:text-left">
                    <p className="font-bold text-lg mb-1">{stats.nextAppointment.customerName}</p>
                    {stats.nextAppointment.petName && (
                      <p className="text-white/80 text-sm mb-1">{stats.nextAppointment.petName} - {stats.nextAppointment.serviceType}</p>
                    )}
                    <p className="text-white/90 text-sm">{stats.nextAppointment.address}</p>
                    <p className="text-white/80 text-xs mt-2 flex items-center justify-center md:justify-start gap-1">
                      <Clock className="h-3 w-3" />
                      {stats.nextAppointment.time}
                    </p>
                  </div>
                </div>

                {/* Contact Methods */}
                {stats.nextAppointment.customerPhone && stats.contactMethods && stats.contactMethods.length > 0 && (
                  <div className="flex gap-2 mt-3 flex-wrap justify-center md:justify-start">
                    {stats.contactMethods.includes("call") && (
                      <button
                        onClick={() => handleCall(stats.nextAppointment?.customerPhone)}
                        className="btn h-12 px-6 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <Phone className="h-5 w-5" />
                        Call
                      </button>
                    )}
                    {stats.contactMethods.includes("sms") && (
                      <button
                        onClick={() => handleSMS(stats.nextAppointment?.customerPhone)}
                        className="btn h-12 px-6 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        <MessageSquare className="h-5 w-5" />
                        SMS
                      </button>
                    )}
                    {stats.contactMethods.includes("whatsapp") && (
                      <button
                        onClick={() => handleWhatsApp(stats.nextAppointment?.customerPhone)}
                        className="btn h-12 px-6 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        💚 WhatsApp
                      </button>
                    )}
                    {stats.contactMethods.includes("signal") && (
                      <button
                        onClick={() => handleSignal(stats.nextAppointment?.customerPhone)}
                        className="btn h-12 px-6 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
                      >
                        🔵 Signal
                      </button>
                    )}
                    {stats.contactMethods.includes("telegram") && (
                      <button
                        onClick={() => handleTelegram(stats.nextAppointment?.customerPhone)}
                        className="btn h-12 px-6 bg-white/20 hover:bg-white/30 border-0 text-white gap-2"
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
                  {/* Mobile: 200x200, Desktop: 300x300 */}
                  <img
                    src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(stats.nextAppointment.address)}&zoom=15&size=300x300&maptype=roadmap&markers=color:red%7C${encodeURIComponent(stats.nextAppointment.address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`}
                    alt="Location map"
                    className="w-[150px] h-[150px] md:w-[300px] md:h-[300px]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary: Start Driving - Full Width, Prominent */}
            <button
              onClick={startDriving}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-3 py-6 px-12 font-bold shadow-lg text-lg min-h-[80px]"
            >
              <Navigation className="h-6 w-6" />
              <span>Start Driving</span>
            </button>

            {/* Secondary Actions - 3 Column Grid */}
            <div className="grid grid-cols-3 gap-2">
              <Link
                href="/app/routes"
                className="btn btn-ghost border border-[#A5744A]/50 hover:bg-[#A5744A]/20 gap-1 h-11 text-xs"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Route</span>
              </Link>
              <button
                onClick={() => stats.nextAppointment && handleSkipAppointment(stats.nextAppointment.appointmentId)}
                className="btn bg-red-500/80 hover:bg-red-500/90 border border-red-300/30 text-white gap-1 h-11 text-xs"
              >
                <SkipForward className="h-4 w-4" />
                <span className="hidden sm:inline">Skip</span>
              </button>
              <button
                onClick={() => stats.nextAppointment && handleCompleteAppointment(stats.nextAppointment.appointmentId)}
                className="btn bg-green-500/80 hover:bg-green-500/90 border border-green-300/30 text-white gap-1 h-11 text-xs"
              >
                <CheckCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Done</span>
              </button>
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

      {/* Savings Stats - Only show when there's data */}
      {stats?.hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.timeSaved} min</p>
                <p className="text-sm text-gray-600">Time Saved Today</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <TrendingDown className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.milesSaved} mi</p>
                <p className="text-sm text-gray-600">Miles Saved</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">${stats.estimatedGasSavings.toFixed(2)}</p>
                <p className="text-sm text-gray-600">Gas Saved</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* One-Tap Quick Actions */}
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
