"use client";

import { useState } from "react";
import { X, MessageSquare, Check, Clock, MapPin, Zap, ChevronDown, ChevronUp } from "lucide-react";

interface RouteChange {
  id: string;
  order: number;
  customerName: string;
  petName: string;
  customerPhone: string | null;
  address: string;
  oldStartAt: string;
  newStartAt: string;
  timeChanged: boolean;
  serviceMinutes: number;
}

interface RouteDetails {
  stops: number;
  avgMinutesBetweenStops: number;
  totalDriveMinutes: number;
  formattedDriveTime: string;
  efficiency: string;
  totalDistanceMiles: number;
}

interface OptimizePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  changes: RouteChange[];
  routeDetails: RouteDetails | null;
  estimatedFinish: string | null;
  appointmentsAffected: number;
  isLoading: boolean;
  preferredMessaging: "SMS" | "WHATSAPP";
}

function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const hours = date.getUTCHours();
  const minutes = date.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes.toString().padStart(2, "0");
  return `${displayHours}:${displayMinutes} ${period}`;
}

function generateNotificationMessage(
  customerName: string,
  petName: string,
  oldTime: string,
  newTime: string
): string {
  const firstName = customerName.split(" ")[0];
  return `Hi ${firstName}, your grooming appointment for ${petName} has been rescheduled from ${oldTime} to ${newTime} today. Let me know if this works for you!`;
}

export default function OptimizePreviewModal({
  isOpen,
  onClose,
  onConfirm,
  changes,
  routeDetails,
  estimatedFinish,
  appointmentsAffected,
  isLoading,
  preferredMessaging,
}: OptimizePreviewModalProps) {
  const [notifiedCustomers, setNotifiedCustomers] = useState<Set<string>>(new Set());
  const [showAllStops, setShowAllStops] = useState(false);

  if (!isOpen) return null;

  const useWhatsApp = preferredMessaging === "WHATSAPP";
  const affectedChanges = changes.filter((c) => c.timeChanged);
  const unchangedChanges = changes.filter((c) => !c.timeChanged);

  function handleNotifyCustomer(change: RouteChange) {
    if (!change.customerPhone) return;

    const message = generateNotificationMessage(
      change.customerName,
      change.petName,
      formatTime(change.oldStartAt),
      formatTime(change.newStartAt)
    );
    const encodedMessage = encodeURIComponent(message);

    if (useWhatsApp) {
      const cleanPhone = change.customerPhone.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    } else {
      window.location.href = `sms:${change.customerPhone}?body=${encodedMessage}`;
    }

    // Mark as notified
    setNotifiedCustomers((prev) => new Set(prev).add(change.id));
  }

  function handleNotifyAll() {
    affectedChanges.forEach((change) => {
      if (change.customerPhone && !notifiedCustomers.has(change.id)) {
        handleNotifyCustomer(change);
      }
    });
  }

  const customersToNotify = affectedChanges.filter(
    (c) => c.customerPhone && !notifiedCustomers.has(c.id)
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-emerald-50 to-teal-50">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Route Optimization Preview</h3>
            <p className="text-sm text-gray-600">Review changes before applying</p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Route Stats */}
        {routeDetails && (
          <div className="p-4 bg-gray-50 border-b">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-gray-900">{routeDetails.stops}</div>
                <div className="text-xs text-gray-500">Stops</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{routeDetails.formattedDriveTime}</div>
                <div className="text-xs text-gray-500">Drive Time</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{routeDetails.totalDistanceMiles} mi</div>
                <div className="text-xs text-gray-500">Total Distance</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-emerald-600">{routeDetails.efficiency}</div>
                <div className="text-xs text-gray-500">Efficiency</div>
              </div>
            </div>
            {estimatedFinish && (
              <div className="mt-3 text-center text-sm text-gray-600">
                <Clock className="h-4 w-4 inline mr-1" />
                Estimated finish: <span className="font-medium">{estimatedFinish}</span>
              </div>
            )}
          </div>
        )}

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {affectedChanges.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-emerald-600" />
              </div>
              <p className="text-gray-900 font-medium">Route is already optimal!</p>
              <p className="text-gray-600 text-sm mt-1">
                No time changes needed - your appointments are in the best order.
              </p>
            </div>
          ) : (
            <>
              {/* Affected Appointments */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">
                    {appointmentsAffected} appointment{appointmentsAffected !== 1 ? "s" : ""} will be rescheduled
                  </h4>
                  {customersToNotify > 0 && (
                    <button
                      onClick={handleNotifyAll}
                      className="btn btn-sm btn-ghost text-blue-600 gap-1"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Notify All ({customersToNotify})
                    </button>
                  )}
                </div>

                <div className="space-y-3">
                  {affectedChanges.map((change) => (
                    <div
                      key={change.id}
                      className="bg-amber-50 rounded-lg p-3 border border-amber-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center text-xs font-bold">
                              {change.order}
                            </span>
                            <p className="font-medium text-gray-900 truncate">
                              {change.customerName}
                            </p>
                          </div>
                          <p className="text-sm text-gray-600 ml-8">{change.petName}</p>
                          <p className="text-xs text-gray-500 ml-8 truncate flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />
                            {change.address}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-2">
                          {change.customerPhone ? (
                            notifiedCustomers.has(change.id) ? (
                              <span className="text-xs text-emerald-600 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Notified
                              </span>
                            ) : (
                              <button
                                onClick={() => handleNotifyCustomer(change)}
                                className="btn btn-sm btn-ghost gap-1 text-blue-600"
                              >
                                <MessageSquare className="h-4 w-4" />
                                {useWhatsApp ? "WhatsApp" : "SMS"}
                              </button>
                            )
                          ) : (
                            <span className="text-xs text-gray-400">No phone</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 ml-8 flex items-center gap-2 text-sm">
                        <span className="text-gray-500 line-through">
                          {formatTime(change.oldStartAt)}
                        </span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium text-amber-700">
                          {formatTime(change.newStartAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Unchanged Appointments (collapsible) */}
              {unchangedChanges.length > 0 && (
                <div className="mt-4">
                  <button
                    onClick={() => setShowAllStops(!showAllStops)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                  >
                    {showAllStops ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    {unchangedChanges.length} appointment{unchangedChanges.length !== 1 ? "s" : ""} unchanged
                  </button>

                  {showAllStops && (
                    <div className="mt-2 space-y-2">
                      {unchangedChanges.map((change) => (
                        <div
                          key={change.id}
                          className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                        >
                          <div className="flex items-center gap-2">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold">
                              {change.order}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {change.customerName} - {change.petName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {formatTime(change.newStartAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {affectedChanges.length > 0 && notifiedCustomers.size < affectedChanges.filter((c) => c.customerPhone).length && (
            <p className="text-xs text-gray-500 mb-3 text-center">
              Tip: Notify customers before applying changes so they know their new appointment time.
            </p>
          )}
          <div className="flex gap-2">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white flex-1 gap-2"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  Apply Optimization
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
