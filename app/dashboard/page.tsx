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
  Sparkles
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
  };
  timeSaved: number; // minutes
  milesSaved: number;
  estimatedGasSavings: number;
  hasData: boolean;
  showSampleData: boolean;
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [stats, setStats] = useState<TodaysStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);

  useEffect(() => {
    async function handleSetup() {
      const setupSuccess = searchParams.get("setup") === "success";

      if (setupSuccess && session?.user) {
        setIsGeneratingSample(true);

        try {
          // Generate sample data for quick win
          const response = await fetch("/api/dashboard/generate-sample", {
            method: "POST",
          });

          if (response.ok) {
            toast.success("Welcome! We've created sample appointments to show you GroomRoute in action.");
            // Remove the setup query param
            window.history.replaceState({}, "", "/dashboard");
            // Fetch dashboard data
            await fetchDashboardData();
          } else {
            // If sample data already exists or generation failed, just fetch data
            await fetchDashboardData();
          }
        } catch (error) {
          console.error("Failed to generate sample data:", error);
          await fetchDashboardData();
        } finally {
          setIsGeneratingSample(false);
        }
      } else if (session?.user) {
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
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setIsLoading(false);
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
                  className="btn btn-sm bg-white text-purple-600 hover:bg-gray-100 border-0"
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
                  className="btn btn-sm btn-ghost border border-white/30 hover:bg-white/10"
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
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg text-white p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Next Stop</h2>
            <div className="badge badge-lg bg-white/20 border-0 text-white">
              {stats.appointments} appointments today
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 mb-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-1">
                <MapPin className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg mb-1">{stats.nextAppointment.customerName}</p>
                {stats.nextAppointment.petName && (
                  <p className="text-white/80 text-sm mb-1">{stats.nextAppointment.petName} - {stats.nextAppointment.serviceType}</p>
                )}
                <p className="text-white/90 text-sm">{stats.nextAppointment.address}</p>
                <p className="text-white/80 text-xs mt-2 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {stats.nextAppointment.time}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/app/routes"
              className="btn btn-lg bg-white text-blue-600 hover:bg-gray-100 border-0 flex-1"
            >
              <Navigation className="h-5 w-5" />
              Start Navigation
            </Link>
            <Link
              href="/app/appointments"
              className="btn btn-lg btn-ghost border border-white/30 hover:bg-white/10 flex-1"
            >
              <Calendar className="h-5 w-5" />
              View Schedule
            </Link>
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
            className="btn btn-primary btn-lg"
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Link
              href="/app/appointments"
              className="flex flex-col items-center gap-2 p-4 border-2 border-blue-200 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
            >
              <div className="p-3 bg-blue-500 rounded-full">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="font-semibold text-sm text-gray-900">New Appointment</span>
            </Link>

            <Link
              href="/app/customers"
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="p-3 bg-gray-200 rounded-full">
                <Plus className="h-6 w-6 text-gray-700" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Add Customer</span>
            </Link>

            <Link
              href="/app/routes"
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="p-3 bg-gray-200 rounded-full">
                <Navigation className="h-6 w-6 text-gray-700" />
              </div>
              <span className="font-semibold text-sm text-gray-900">View Routes</span>
            </Link>

            <Link
              href="/app/appointments"
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center"
            >
              <div className="p-3 bg-gray-200 rounded-full">
                <CheckCircle className="h-6 w-6 text-gray-700" />
              </div>
              <span className="font-semibold text-sm text-gray-900">Complete Job</span>
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
