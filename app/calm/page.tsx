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
} from "lucide-react";

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

function CalmCenterContent() {
  const { data: session } = useSession();
  const [data, setData] = useState<CalmCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
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
            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
              <div className="p-3 bg-blue-100 rounded-lg flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900">Customer Wants to Reschedule</p>
                <p className="text-sm text-gray-600">Find best alternate times</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </button>

            <button className="flex items-center gap-3 p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200 text-left">
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
