"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, TrendingDown, UserCheck, UserX, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Interview {
  id: string;
  accountId: string;
  messages: { role: string; content: string }[];
  rootCause: string | null;
  categories: string[];
  wasRetained: boolean;
  canceledAt: string | null;
  createdAt: string;
  account: {
    name: string;
    subscriptionPlan: string;
  };
}

interface Stats {
  totalInterviews: number;
  canceled: number;
  retained: number;
  retentionRate: number;
  topReasons: { category: string; count: number }[];
}

const CATEGORY_LABELS: Record<string, string> = {
  pricing: "Pricing",
  missing_feature: "Missing Feature",
  setup_difficulty: "Setup Difficulty",
  not_enough_clients: "Not Enough Clients",
  switching_to_competitor: "Switching to Competitor",
  going_out_of_business: "Going Out of Business",
  technical_issue: "Technical Issue",
  poor_support: "Poor Support",
  not_using_enough: "Not Using Enough",
  other: "Other",
};

export default function ChurnDashboardPage() {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/churn");
        if (res.ok) {
          const data = await res.json();
          setInterviews(data.interviews);
          setStats(data.stats);
        } else {
          toast.error("Failed to load churn data");
        }
      } catch {
        toast.error("Failed to load churn data");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Settings
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <TrendingDown className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Churn Insights</h1>
            <p className="text-gray-600">
              Understand why users cancel and what to fix
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-xl border p-4 text-center">
            <p className="text-3xl font-bold text-gray-900">{stats.totalInterviews}</p>
            <p className="text-sm text-gray-500">Total Interviews</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <UserX className="h-5 w-5 text-red-500" />
              <p className="text-3xl font-bold text-red-600">{stats.canceled}</p>
            </div>
            <p className="text-sm text-gray-500">Canceled</p>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="flex items-center justify-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              <p className="text-3xl font-bold text-emerald-600">{stats.retained}</p>
            </div>
            <p className="text-sm text-gray-500">Retained ({stats.retentionRate}%)</p>
          </div>
        </div>
      )}

      {/* Top Reasons */}
      {stats && stats.topReasons.length > 0 && (
        <div className="bg-white rounded-xl border p-6 mb-8">
          <h2 className="font-semibold text-gray-900 mb-4">Top Cancellation Reasons</h2>
          <div className="space-y-3">
            {stats.topReasons.map((reason) => {
              const maxCount = stats.topReasons[0].count;
              const percentage = Math.round((reason.count / maxCount) * 100);
              return (
                <div key={reason.category}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-gray-700">
                      {CATEGORY_LABELS[reason.category] || reason.category}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{reason.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-red-400 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interviews List */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="font-semibold text-gray-900">Recent Cancellation Interviews</h2>
        </div>

        {interviews.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No cancellation interviews yet.
          </div>
        ) : (
          <div className="divide-y">
            {interviews.map((interview) => (
              <div key={interview.id} className="p-4">
                <button
                  onClick={() =>
                    setExpandedId(expandedId === interview.id ? null : interview.id)
                  }
                  className="w-full flex items-center justify-between text-left"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {interview.account.name}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        interview.canceledAt
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}>
                        {interview.canceledAt ? "Canceled" : "Retained"}
                      </span>
                      <span className="text-xs text-gray-400">
                        {interview.account.subscriptionPlan}
                      </span>
                    </div>
                    {interview.rootCause && (
                      <p className="text-sm text-gray-600 mt-1">{interview.rootCause}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {interview.categories.map((cat) => (
                        <span key={cat} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                          {CATEGORY_LABELS[cat] || cat}
                        </span>
                      ))}
                      <span className="text-xs text-gray-400">
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {expandedId === interview.id ? (
                    <ChevronUp className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>

                {/* Expanded conversation */}
                {expandedId === interview.id && (
                  <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-3">
                    {(interview.messages as { role: string; content: string }[]).map(
                      (msg, i) => (
                        <div key={i}>
                          <p className="text-xs font-medium text-gray-400 mb-0.5">
                            {msg.role === "user" ? "User" : "AI Agent"}
                          </p>
                          <p className="text-sm text-gray-700">{msg.content}</p>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
