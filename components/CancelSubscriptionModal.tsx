"use client";

import { useState } from "react";
import { X } from "lucide-react";
import toast from "react-hot-toast";

interface CancelSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  periodEnd: string | null;
}

const INITIAL_REASONS = [
  { id: "pricing", label: "Too expensive" },
  { id: "missing_feature", label: "Missing features I need" },
  { id: "not_enough_clients", label: "Not enough clients to justify it" },
  { id: "setup_difficulty", label: "Too complicated to set up" },
  { id: "switching", label: "Switching to another tool" },
  { id: "going_out_of_business", label: "Closing my business" },
  { id: "other", label: "Other" },
];

const TOTAL_STEPS = 5;

export default function CancelSubscriptionModal({
  isOpen,
  onClose,
  periodEnd,
}: CancelSubscriptionModalProps) {
  const [step, setStep] = useState(1);
  const [selectedReason, setSelectedReason] = useState<string | null>(null);
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [aiQuestion, setAiQuestion] = useState<string>("");
  const [userResponse, setUserResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [analysisReady, setAnalysisReady] = useState(false);
  const [additionalFeedback, setAdditionalFeedback] = useState("");

  if (!isOpen) return null;

  const handleReasonSelect = async (reasonId: string) => {
    setSelectedReason(reasonId);
    const reasonLabel = INITIAL_REASONS.find((r) => r.id === reasonId)?.label || reasonId;

    setIsLoading(true);
    try {
      const newMessages = [{ role: "user" as const, content: `I want to cancel because: ${reasonLabel}` }];
      const res = await fetch("/api/subscription/cancel/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, interviewId }),
      });
      const data = await res.json();

      setMessages([...newMessages, { role: "assistant", content: data.reply }]);
      setInterviewId(data.interviewId);
      setAiQuestion(data.reply);
      if (data.analysis) setAnalysisReady(true);
      setStep(2);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowUp = async () => {
    if (!userResponse.trim()) return;

    setIsLoading(true);
    try {
      const newMessages = [...messages, { role: "user" as const, content: userResponse }];
      const res = await fetch("/api/subscription/cancel/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, interviewId }),
      });
      const data = await res.json();

      const updatedMessages = [...newMessages, { role: "assistant", content: data.reply }];
      setMessages(updatedMessages);
      setAiQuestion(data.reply);
      setUserResponse("");

      if (data.analysis) {
        setAnalysisReady(true);
      }

      // Move to next step
      if (step < 3) {
        setStep(step + 1);
      } else {
        // After step 3, go to additional feedback
        setStep(4);
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdditionalFeedback = async () => {
    if (additionalFeedback.trim()) {
      // Save additional feedback as a final message
      const newMessages = [...messages, { role: "user" as const, content: `Additional feedback: ${additionalFeedback}` }];
      try {
        await fetch("/api/subscription/cancel/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: newMessages, interviewId }),
        });
        setMessages(newMessages);
      } catch {
        // Non-critical, continue to confirmation
      }
    }
    setStep(5);
  };

  const handleConfirmCancel = async () => {
    setIsCanceling(true);
    try {
      const res = await fetch("/api/subscription/cancel/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ interviewId }),
      });
      const data = await res.json();

      if (data.success) {
        toast.success("Your subscription has been canceled.");
        onClose();
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to cancel subscription.");
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsCanceling(false);
    }
  };

  const handleStay = async () => {
    // Mark interview as retained
    if (interviewId) {
      try {
        await fetch("/api/subscription/cancel/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, { role: "user", content: "USER_DECIDED_TO_STAY" }],
            interviewId,
          }),
        });
      } catch {
        // Non-critical
      }
    }
    toast.success("Great, welcome back!");
    onClose();
  };

  const formattedPeriodEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg relative">
        {/* Progress bar */}
        <div className="flex gap-1.5 p-4 pb-0">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i < step ? "bg-gray-900" : "bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={handleStay}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-6 pt-4">
          {/* Step 1: Select reason */}
          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                What&apos;s the main reason you&apos;re canceling?
              </h2>
              <p className="text-sm text-gray-500 mb-6">
                Your feedback helps us improve GroomRoute for everyone.
              </p>
              <div className="space-y-2">
                {INITIAL_REASONS.map((reason) => (
                  <button
                    key={reason.id}
                    onClick={() => handleReasonSelect(reason.id)}
                    disabled={isLoading}
                    className={`w-full text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedReason === reason.id
                        ? "border-gray-900 bg-gray-50"
                        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                    } ${isLoading ? "opacity-50 cursor-wait" : ""}`}
                  >
                    <span className="text-gray-900">{reason.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Steps 2-3: AI follow-up questions */}
          {(step === 2 || step === 3) && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                {aiQuestion}
              </h2>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                placeholder="Tell us what happened..."
                className="w-full mt-4 p-3 border border-gray-200 rounded-lg resize-none h-28 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                disabled={isLoading}
              />
              <button
                onClick={handleFollowUp}
                disabled={isLoading || !userResponse.trim()}
                className="mt-4 btn bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  <>Continue &rarr;</>
                )}
              </button>
            </div>
          )}

          {/* Step 4: Additional feedback */}
          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">
                Is there anything else you&apos;d like us to know?
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Optional - any additional feedback is appreciated.
              </p>
              <textarea
                value={additionalFeedback}
                onChange={(e) => setAdditionalFeedback(e.target.value)}
                placeholder="Anything else on your mind..."
                className="w-full p-3 border border-gray-200 rounded-lg resize-none h-28 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              />
              <button
                onClick={handleAdditionalFeedback}
                className="mt-4 btn bg-gray-900 text-white hover:bg-gray-800"
              >
                Continue &rarr;
              </button>
            </div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Are you sure?
              </h2>
              <p className="text-gray-600 mb-6">
                {formattedPeriodEnd ? (
                  <>Your subscription will remain active until <strong>{formattedPeriodEnd}</strong>. After that, you&apos;ll lose access to route optimization, online booking, and all premium features.</>
                ) : (
                  <>Once canceled, you&apos;ll lose access to route optimization, online booking, and all premium features.</>
                )}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleStay}
                  className="w-full btn bg-gray-900 text-white hover:bg-gray-800"
                >
                  Never mind, I&apos;ll stay
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={isCanceling}
                  className="w-full btn btn-ghost text-red-600 hover:bg-red-50"
                >
                  {isCanceling ? (
                    <span className="loading loading-spinner loading-sm" />
                  ) : (
                    "Confirm cancellation"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
