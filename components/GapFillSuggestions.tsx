"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Phone, MessageSquare, Plus, Users, MapPin, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Pet {
  id: string;
  name: string;
  breed: string | null;
}

interface SuggestedClient {
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  customerAddress: string;
  pets: Pet[];
  serviceAreaName: string | null;
  serviceAreaColor: string | null;
  preferredDays: string[];
  preferredTimes: string[];
  flexibleTiming: boolean;
  matchScore: number;
  matchReasons: string[];
}

interface Gap {
  startTime: string;
  endTime: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  startTime24h: string;
  endTime24h: string;
  durationMinutes: number;
  previousAppointment: {
    id: string;
    customerName: string;
    endTime: string;
  } | null;
  nextAppointment: {
    id: string;
    customerName: string;
    startTime: string;
  } | null;
  suggestedClients: SuggestedClient[];
}

interface GapData {
  date: string;
  dayOfWeek: string;
  areaForDay: {
    id: string;
    name: string;
    color: string;
  } | null;
  workingHours: {
    start: string;
    end: string;
  };
  appointmentCount: number;
  gaps: Gap[];
  totalGapMinutes: number;
}

interface GapFillSuggestionsProps {
  date?: string; // ISO date string, defaults to today
  minGapMinutes?: number; // Minimum gap to show, defaults to 45
  compact?: boolean; // Show compact version
  preferredMessaging?: "SMS" | "WHATSAPP";
}

export default function GapFillSuggestions({
  date,
  minGapMinutes = 45,
  compact = false,
  preferredMessaging = "SMS",
}: GapFillSuggestionsProps) {
  const [gapData, setGapData] = useState<GapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedGap, setExpandedGap] = useState<number | null>(null);

  const fetchGaps = useCallback(async () => {
    try {
      const targetDate = date || new Date().toISOString().split("T")[0];
      const response = await fetch(`/api/gaps?date=${targetDate}&minGap=${minGapMinutes}`);
      if (response.ok) {
        const data = await response.json();
        setGapData(data);
        // Auto-expand first gap if there are suggestions
        if (data.gaps.length > 0 && data.gaps[0].suggestedClients.length > 0) {
          setExpandedGap(0);
        }
      }
    } catch (error) {
      console.error("Failed to fetch gaps:", error);
    } finally {
      setIsLoading(false);
    }
  }, [date, minGapMinutes]);

  useEffect(() => {
    fetchGaps();
  }, [fetchGaps]);

  const handleCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  const handleMessage = (phone: string) => {
    if (preferredMessaging === "WHATSAPP") {
      const cleanPhone = phone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}`, "_blank");
    } else {
      window.location.href = `sms:${phone}`;
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border p-4">
        <div className="flex items-center justify-center py-6">
          <span className="loading loading-spinner loading-md text-purple-500"></span>
        </div>
      </div>
    );
  }

  if (!gapData || gapData.gaps.length === 0) {
    return null; // Don't show anything if no gaps
  }

  const hasWaitlistSuggestions = gapData.gaps.some((gap) => gap.suggestedClients.length > 0);

  if (compact) {
    // Compact version for dashboard - just show that gaps exist
    return (
      <Link
        href="/dashboard/routes"
        className="block bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 p-4 hover:shadow-md transition-shadow"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {gapData.gaps.length} schedule gap{gapData.gaps.length !== 1 ? "s" : ""} today
            </p>
            <p className="text-sm text-purple-600">
              {gapData.totalGapMinutes} min available
              {hasWaitlistSuggestions && " - waitlist matches found"}
            </p>
          </div>
          {hasWaitlistSuggestions && (
            <div className="flex items-center gap-1 text-purple-600">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">
                {gapData.gaps.reduce((sum, g) => sum + g.suggestedClients.length, 0)}
              </span>
            </div>
          )}
        </div>
      </Link>
    );
  }

  // Full version with expandable gaps
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Fill Your Gaps</h3>
              <p className="text-sm text-gray-600">
                {gapData.totalGapMinutes} min available across {gapData.gaps.length} gap{gapData.gaps.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          {gapData.areaForDay && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `${gapData.areaForDay.color}20`,
                color: gapData.areaForDay.color,
              }}
            >
              <MapPin className="h-3 w-3" />
              {gapData.areaForDay.name}
            </div>
          )}
        </div>
      </div>

      {/* Gaps List */}
      <div className="divide-y">
        {gapData.gaps.map((gap, index) => (
          <div key={index} className="p-4">
            {/* Gap Header */}
            <button
              onClick={() => setExpandedGap(expandedGap === index ? null : index)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <div className="text-center min-w-[80px]">
                  <p className="text-sm font-semibold text-gray-900">
                    {gap.startTimeFormatted}
                  </p>
                  <p className="text-xs text-gray-500">to {gap.endTimeFormatted}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{gap.durationMinutes} min gap</p>
                  <p className="text-xs text-gray-500">
                    {gap.previousAppointment
                      ? `After ${gap.previousAppointment.customerName}`
                      : "Start of day"}
                    {gap.nextAppointment && ` - Before ${gap.nextAppointment.customerName}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {gap.suggestedClients.length > 0 && (
                  <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                    {gap.suggestedClients.length} match{gap.suggestedClients.length !== 1 ? "es" : ""}
                  </span>
                )}
                {expandedGap === index ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </button>

            {/* Expanded Content */}
            {expandedGap === index && (
              <div className="mt-4 space-y-3">
                {gap.suggestedClients.length === 0 ? (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">
                      No waitlist clients match this time slot
                    </p>
                    <Link
                      href="/dashboard/customers"
                      className="text-sm text-[#A5744A] hover:underline font-medium mt-1 inline-block"
                    >
                      Add clients to waitlist
                    </Link>
                  </div>
                ) : (
                  gap.suggestedClients.map((client) => (
                    <div
                      key={client.customerId}
                      className="bg-gray-50 rounded-lg p-3 border border-gray-100"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-medium text-gray-900">{client.customerName}</p>
                          <p className="text-xs text-gray-500">{client.customerAddress}</p>
                          {client.pets.length > 0 && (
                            <p className="text-xs text-gray-600 mt-1">
                              {client.pets.map((p) => p.name).join(", ")}
                              {client.pets[0].breed && ` (${client.pets[0].breed})`}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <div
                            className="text-xs font-medium px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor:
                                client.matchScore >= 70
                                  ? "#dcfce7"
                                  : client.matchScore >= 40
                                  ? "#fef9c3"
                                  : "#f3f4f6",
                              color:
                                client.matchScore >= 70
                                  ? "#166534"
                                  : client.matchScore >= 40
                                  ? "#854d0e"
                                  : "#374151",
                            }}
                          >
                            {client.matchScore}% match
                          </div>
                        </div>
                      </div>

                      {/* Match Reasons */}
                      {client.matchReasons.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {client.matchReasons.map((reason, i) => (
                            <span
                              key={i}
                              className="text-xs text-purple-700 bg-purple-100 px-2 py-0.5 rounded"
                            >
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex gap-2">
                        {client.customerPhone && (
                          <>
                            <button
                              onClick={() => handleCall(client.customerPhone!)}
                              className="btn btn-xs btn-ghost gap-1"
                            >
                              <Phone className="h-3 w-3" />
                              Call
                            </button>
                            <button
                              onClick={() => handleMessage(client.customerPhone!)}
                              className="btn btn-xs btn-ghost gap-1"
                            >
                              <MessageSquare className="h-3 w-3" />
                              {preferredMessaging === "WHATSAPP" ? "WhatsApp" : "Text"}
                            </button>
                          </>
                        )}
                        <Link
                          href={`/dashboard/appointments/new?customerId=${client.customerId}&suggestedDate=${gapData.date}&suggestedTime=${gap.startTime24h}`}
                          className="btn btn-xs bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1 ml-auto"
                        >
                          <Plus className="h-3 w-3" />
                          Book
                        </Link>
                      </div>
                    </div>
                  ))
                )}

                {/* Quick Book - new client */}
                <Link
                  href={`/dashboard/appointments/new?suggestedDate=${gapData.date}&suggestedTime=${gap.startTime24h}`}
                  className="flex items-center justify-center gap-2 text-sm text-[#A5744A] hover:bg-orange-50 p-2 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  Book any client for this slot
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
