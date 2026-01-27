"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Loader2,
  ExternalLink,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface CalendarRequest {
  accountId: string;
  accountName: string;
  userEmail: string;
  userName: string;
  requestedAt: string;
  approved: boolean;
  connected: boolean;
}

export default function CalendarRequestsPage() {
  const [requests, setRequests] = useState<CalendarRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch("/api/admin/calendar-requests");
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/admin/login";
          return;
        }
        throw new Error("Failed to fetch");
      }
      const data = await res.json();
      setRequests(data.requests);
    } catch (error) {
      console.error("Failed to fetch requests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (accountId: string) => {
    setApprovingId(accountId);
    try {
      const res = await fetch("/api/admin/calendar-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });

      if (res.ok) {
        // Update local state
        setRequests((prev) =>
          prev.map((r) =>
            r.accountId === accountId ? { ...r, approved: true } : r
          )
        );
      } else {
        alert("Failed to approve request");
      }
    } catch (error) {
      console.error("Failed to approve:", error);
      alert("Failed to approve request");
    } finally {
      setApprovingId(null);
    }
  };

  const pendingRequests = requests.filter((r) => !r.approved && !r.connected);
  const approvedRequests = requests.filter((r) => r.approved && !r.connected);
  const connectedRequests = requests.filter((r) => r.connected);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Google Calendar Requests
              </h1>
              <p className="text-sm text-gray-600">
                Manage beta access requests for Google Calendar integration
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="space-y-8">
            {/* Instructions */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="font-medium text-amber-900 mb-2">
                How to approve requests
              </h3>
              <ol className="text-sm text-amber-800 space-y-1 list-decimal list-inside">
                <li>
                  Go to{" "}
                  <a
                    href="https://console.cloud.google.com/apis/credentials/consent"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline inline-flex items-center gap-1"
                  >
                    Google Cloud Console - OAuth consent screen
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </li>
                <li>Scroll down to "Test users" and click "Add Users"</li>
                <li>Add the user's email address from below</li>
                <li>
                  Come back here and click "Approve" to enable their access
                </li>
              </ol>
            </div>

            {/* Pending Requests */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Pending Requests ({pendingRequests.length})
                </h2>
              </div>
              {pendingRequests.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No pending requests
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingRequests.map((request) => (
                    <div
                      key={request.accountId}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.accountName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.userEmail}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Requested{" "}
                          {new Date(request.requestedAt).toLocaleDateString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            }
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            navigator.clipboard.writeText(request.userEmail)
                          }
                          className="btn btn-sm btn-ghost text-gray-600"
                        >
                          Copy Email
                        </button>
                        <button
                          onClick={() => handleApprove(request.accountId)}
                          disabled={approvingId === request.accountId}
                          className="btn btn-sm bg-green-500 hover:bg-green-600 text-white border-0"
                        >
                          {approvingId === request.accountId ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Check className="w-4 h-4 mr-1" />
                              Approve
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Approved (Waiting to Connect) */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Approved - Waiting to Connect ({approvedRequests.length})
                </h2>
              </div>
              {approvedRequests.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No approved requests waiting to connect
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {approvedRequests.map((request) => (
                    <div
                      key={request.accountId}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.accountName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.userEmail}
                        </p>
                      </div>
                      <span className="text-sm text-green-600 font-medium">
                        Approved
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connected */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900">
                  Connected ({connectedRequests.length})
                </h2>
              </div>
              {connectedRequests.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No connected accounts
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {connectedRequests.map((request) => (
                    <div
                      key={request.accountId}
                      className="px-6 py-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {request.accountName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {request.userEmail}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium">
                        <Check className="w-4 h-4" />
                        Connected
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
