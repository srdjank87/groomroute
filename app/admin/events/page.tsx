"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Activity,
  ChevronLeft,
  ChevronRight,
  Filter,
  UserPlus,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  TrendingDown,
  Key,
  Trash2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AdminEvent {
  id: string;
  type: string;
  accountId: string | null;
  accountName: string | null;
  userId: string | null;
  userEmail: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

interface EventsResponse {
  events: AdminEvent[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  typeCounts: { type: string; count: number }[];
}

const eventTypeIcons: Record<string, React.ReactNode> = {
  signup: <UserPlus className="w-4 h-4" />,
  subscription_started: <CheckCircle className="w-4 h-4" />,
  subscription_canceled: <AlertCircle className="w-4 h-4" />,
  subscription_renewed: <RefreshCw className="w-4 h-4" />,
  payment_succeeded: <CreditCard className="w-4 h-4" />,
  payment_failed: <AlertCircle className="w-4 h-4" />,
  trial_expired: <Clock className="w-4 h-4" />,
  plan_upgraded: <TrendingUp className="w-4 h-4" />,
  plan_downgraded: <TrendingDown className="w-4 h-4" />,
  team_member_invited: <Users className="w-4 h-4" />,
  team_member_joined: <UserPlus className="w-4 h-4" />,
  seat_added: <Users className="w-4 h-4" />,
  seat_removed: <Users className="w-4 h-4" />,
  account_deleted: <Trash2 className="w-4 h-4" />,
  password_reset_requested: <Key className="w-4 h-4" />,
  password_reset_completed: <Key className="w-4 h-4" />,
};

const eventTypeColors: Record<string, string> = {
  signup: "bg-green-100 text-green-700",
  subscription_started: "bg-green-100 text-green-700",
  subscription_canceled: "bg-red-100 text-red-700",
  subscription_renewed: "bg-blue-100 text-blue-700",
  payment_succeeded: "bg-green-100 text-green-700",
  payment_failed: "bg-red-100 text-red-700",
  trial_expired: "bg-yellow-100 text-yellow-700",
  plan_upgraded: "bg-purple-100 text-purple-700",
  plan_downgraded: "bg-orange-100 text-orange-700",
  team_member_invited: "bg-blue-100 text-blue-700",
  team_member_joined: "bg-green-100 text-green-700",
  seat_added: "bg-blue-100 text-blue-700",
  seat_removed: "bg-orange-100 text-orange-700",
  account_deleted: "bg-red-100 text-red-700",
  password_reset_requested: "bg-yellow-100 text-yellow-700",
  password_reset_completed: "bg-green-100 text-green-700",
};

function formatEventType(type: string): string {
  return type
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function AdminEventsPage() {
  const [data, setData] = useState<EventsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedType, setSelectedType] = useState<string>("");

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "30",
      });
      if (selectedType) {
        params.set("type", selectedType);
      }

      const response = await fetch(`/api/admin/events?${params}`);
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
    } finally {
      setIsLoading(false);
    }
  }, [page, selectedType]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleTypeFilter = (type: string) => {
    setSelectedType(type);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Event Log</h1>
                <p className="text-sm text-gray-600">
                  Audit trail of important system events
                </p>
              </div>
            </div>
            <a
              href="https://us.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            >
              <span>PostHog Analytics</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {data && data.typeCounts.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Filter className="w-4 h-4" />
                <span>Filter by type:</span>
              </div>
              <button
                onClick={() => handleTypeFilter("")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === ""
                    ? "bg-[#A5744A] text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Events
              </button>
              {data.typeCounts.slice(0, 6).map((tc) => (
                <button
                  key={tc.type}
                  onClick={() => handleTypeFilter(tc.type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === tc.type
                      ? "bg-[#A5744A] text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {formatEventType(tc.type)} ({tc.count})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-gray-500" />
              Recent Events
              {data && (
                <span className="text-sm font-normal text-gray-500">
                  ({data.pagination.total} total)
                </span>
              )}
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center">
              <span className="loading loading-spinner loading-lg text-[#A5744A]"></span>
            </div>
          ) : data?.events.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No events yet</p>
              <p className="text-sm mt-1">
                Events will appear here as users sign up, subscribe, and perform important actions.
              </p>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg max-w-md mx-auto text-left">
                <p className="text-xs font-medium text-gray-700 mb-2">Events that are tracked:</p>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>- New account signups</li>
                  <li>- Subscription changes (start, cancel, renew)</li>
                  <li>- Payment events (success, failure)</li>
                  <li>- Team invitations and joins</li>
                  <li>- Password reset requests</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {data?.events.map((event) => (
                <div
                  key={event.id}
                  className="p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`p-2 rounded-lg ${
                        eventTypeColors[event.type] || "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {eventTypeIcons[event.type] || (
                        <Activity className="w-4 h-4" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            eventTypeColors[event.type] ||
                            "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {formatEventType(event.type)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(event.createdAt), {
                            addSuffix: true,
                          })}
                        </span>
                      </div>
                      <p className="text-gray-900">{event.description}</p>
                      {event.accountId && (
                        <Link
                          href={`/admin/accounts/${event.accountId}`}
                          className="text-sm text-[#A5744A] hover:underline mt-1 inline-block"
                        >
                          View Account
                        </Link>
                      )}
                      {event.metadata && Object.keys(event.metadata).length > 0 && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                            View details
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">
                            {JSON.stringify(event.metadata, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right text-xs text-gray-500 whitespace-nowrap">
                      {new Date(event.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                      <br />
                      {new Date(event.createdAt).toLocaleTimeString("en-US", {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {data && data.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Page {data.pagination.page} of {data.pagination.totalPages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(data.pagination.totalPages, p + 1))
                  }
                  disabled={page === data.pagination.totalPages}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
