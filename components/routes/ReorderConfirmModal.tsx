"use client";

import { X, MessageSquare, Send } from "lucide-react";

interface TimeChange {
  id: string;
  customerName: string;
  petName: string;
  customerPhone: string | null;
  oldStartAt: string;
  newStartAt: string;
  timeChanged: boolean;
}

interface ReorderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  timeChanges: TimeChange[];
  isLoading: boolean;
  contactMethods: string[];
  preferredMessaging?: "SMS" | "WHATSAPP";
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

function generateETAMessage(customerName: string, petName: string, newTime: string): string {
  const firstName = customerName.split(" ")[0];
  return `Hi ${firstName}! I'll be arriving for ${petName}'s grooming around ${newTime} today. See you soon!`;
}

// Generic message for group notifications (no personalization)
function generateGroupMessage(): string {
  return `Hi! Your grooming appointment time has been adjusted for today. Please check your updated time. Let me know if you have any questions!`;
}

export default function ReorderConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  timeChanges,
  isLoading,
  contactMethods,
  preferredMessaging = "SMS",
}: ReorderConfirmModalProps) {
  if (!isOpen) return null;

  const affectedChanges = timeChanges.filter((change) => change.timeChanged);
  const useWhatsApp = preferredMessaging === "WHATSAPP";

  function handleNotifyCustomer(change: TimeChange) {
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
  }

  function handleNotifyAll() {
    // Open notification for each affected customer with a phone number
    const customersToNotify = affectedChanges.filter((change) => change.customerPhone);

    if (customersToNotify.length === 0) return;

    // Use generic message for group notifications
    const message = generateGroupMessage();
    const encodedMessage = encodeURIComponent(message);

    if (useWhatsApp) {
      // WhatsApp doesn't support group compose, notify first customer
      const firstCustomer = customersToNotify[0];
      const cleanPhone = firstCustomer.customerPhone!.replace(/\D/g, "");
      window.open(`https://wa.me/1${cleanPhone}?text=${encodedMessage}`, "_blank");
    } else {
      // Combine all phone numbers for group SMS
      const phoneNumbers = customersToNotify.map((c) => c.customerPhone).join(",");
      window.location.href = `sms:${phoneNumbers}?body=${encodedMessage}`;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Confirm Route Changes</h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="btn btn-ghost btn-sm btn-circle"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto flex-1">
          {affectedChanges.length === 0 ? (
            <p className="text-gray-600 text-center py-4">
              No time changes needed - the order is already optimal.
            </p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">
                The following appointments will have their times updated:
              </p>

              <div className="space-y-3">
                {affectedChanges.map((change) => (
                  <div
                    key={change.id}
                    className="bg-gray-50 rounded-lg p-3 border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {change.customerName}
                        </p>
                        <p className="text-sm text-gray-600">{change.petName}</p>
                      </div>
                      {change.customerPhone && (
                        <button
                          onClick={() => handleNotifyCustomer(change)}
                          className="btn btn-sm btn-ghost gap-1 text-blue-600"
                        >
                          <MessageSquare className="h-4 w-4" />
                          Notify
                        </button>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-sm">
                      <span className="text-gray-500 line-through">
                        {formatTime(change.oldStartAt)}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className="font-medium text-[#A5744A]">
                        {formatTime(change.newStartAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50">
          {affectedChanges.length > 0 &&
            affectedChanges.some((c) => c.customerPhone) && (
              <button
                onClick={handleNotifyAll}
                className="btn btn-outline w-full mb-3 gap-2"
              >
                <Send className="h-4 w-4" />
                Notify All Customers ({affectedChanges.filter((c) => c.customerPhone).length})
              </button>
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
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white flex-1"
            >
              {isLoading ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                "Confirm Changes"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
