"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface EventConfig {
  name: string;
  label: string;
  description: string;
  fields: { key: string; label: string; defaultValue: string; optional?: boolean }[];
}

const EVENTS: EventConfig[] = [
  {
    name: "loopsOnSignup",
    label: "Signup",
    description: "User creates account (triggers abandoned checkout sequence)",
    fields: [
      { key: "name", label: "Full Name", defaultValue: "Test User" },
      { key: "businessName", label: "Business Name", defaultValue: "Test Grooming" },
      { key: "plan", label: "Plan", defaultValue: "monthly" },
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnCheckoutCompleted",
    label: "Checkout Completed",
    description: "User completes Stripe checkout (exits abandoned checkout, triggers onboarding)",
    fields: [
      { key: "plan", label: "Plan", defaultValue: "monthly" },
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "phone", label: "Phone", defaultValue: "", optional: true },
      { key: "planPrice", label: "Plan Price", defaultValue: "$29", optional: true },
      { key: "trialEndDate", label: "Trial End Date", defaultValue: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0], optional: true },
      { key: "cardLast4", label: "Card Last 4", defaultValue: "4242", optional: true },
    ],
  },
  {
    name: "loopsOnTrialConverted",
    label: "Trial Converted",
    description: "Trial converts to paid subscription",
    fields: [
      { key: "plan", label: "Plan", defaultValue: "monthly" },
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnSubscriptionCanceled",
    label: "Subscription Canceled",
    description: "Subscription canceled (triggers winback sequence after 60 days)",
    fields: [
      { key: "previousPlan", label: "Previous Plan", defaultValue: "monthly" },
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnResubscribed",
    label: "Resubscribed",
    description: "Churned customer resubscribes (exits winback sequence)",
    fields: [
      { key: "plan", label: "Plan", defaultValue: "monthly" },
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "phone", label: "Phone", defaultValue: "", optional: true },
    ],
  },
  {
    name: "loopsOnFirstCustomerAdded",
    label: "First Customer Added",
    description: "User adds first client (exits 'no clients' sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnFirstAppointmentCreated",
    label: "First Appointment Created",
    description: "User creates first appointment (exits 'no appointments' sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnFirstRouteOptimized",
    label: "First Route Optimized",
    description: "User optimizes first route (exits route optimization nudge)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "stops", label: "Stops", defaultValue: "5" },
    ],
  },
  {
    name: "loopsOnPWAInstalled",
    label: "PWA Installed",
    description: "User installs PWA (exits PWA reminder sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnUserActive",
    label: "User Active",
    description: "User logs in (exits re-engagement sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnPaymentFailed",
    label: "Payment Failed",
    description: "Invoice payment fails (triggers payment failed sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "amount", label: "Amount", defaultValue: "29" },
    ],
  },
  {
    name: "loopsOnPaymentSucceeded",
    label: "Payment Succeeded",
    description: "Payment succeeds after failure (exits payment failed sequence)",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
    ],
  },
  {
    name: "loopsOnBookingEnabled",
    label: "Booking Enabled",
    description: "Groomer enables online booking page",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "bookingSlug", label: "Booking Slug", defaultValue: "test-grooming", optional: true },
    ],
  },
  {
    name: "loopsOnBookingReceived",
    label: "Booking Received",
    description: "Client books through public booking page",
    fields: [
      { key: "accountId", label: "Account ID", defaultValue: "test-123" },
      { key: "clientName", label: "Client Name", defaultValue: "Jane Doe" },
    ],
  },
];

type Status = "idle" | "loading" | "success" | "error";

export default function LoopsTestPage() {
  const [email, setEmail] = useState("");
  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [fieldValues, setFieldValues] = useState<Record<string, Record<string, string>>>(() => {
    const initial: Record<string, Record<string, string>> = {};
    for (const event of EVENTS) {
      initial[event.name] = {};
      for (const field of event.fields) {
        initial[event.name][field.key] = field.defaultValue;
      }
    }
    return initial;
  });

  const updateField = (eventName: string, key: string, value: string) => {
    setFieldValues((prev) => ({
      ...prev,
      [eventName]: { ...prev[eventName], [key]: value },
    }));
  };

  const sendEvent = async (eventName: string) => {
    if (!email) {
      setStatuses((prev) => ({ ...prev, [eventName]: "error" }));
      setResponses((prev) => ({ ...prev, [eventName]: "Please enter an email address" }));
      return;
    }

    setStatuses((prev) => ({ ...prev, [eventName]: "loading" }));
    try {
      const params = { email, ...fieldValues[eventName] };
      const res = await fetch("/api/admin/loops-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventName, params }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatuses((prev) => ({ ...prev, [eventName]: "success" }));
        setResponses((prev) => ({ ...prev, [eventName]: JSON.stringify(data) }));
      } else {
        setStatuses((prev) => ({ ...prev, [eventName]: "error" }));
        setResponses((prev) => ({ ...prev, [eventName]: data.error || "Failed" }));
      }
    } catch (err) {
      setStatuses((prev) => ({ ...prev, [eventName]: "error" }));
      setResponses((prev) => ({ ...prev, [eventName]: String(err) }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Loops Event Tester</h1>
              <p className="text-sm text-gray-600">Send test events to Loops to verify your integration</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Global email input */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Test Email (used for all events)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your-test-email@example.com"
            className="input input-bordered w-full max-w-md border-2 border-gray-300"
          />
          <p className="text-xs text-gray-500 mt-1">This contact must exist in Loops, or will be created on first event.</p>
        </div>

        {/* Event cards */}
        <div className="space-y-4">
          {EVENTS.map((event) => (
            <div key={event.name} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{event.label}</h3>
                  <p className="text-sm text-gray-500 mb-3">{event.description}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {event.fields.map((field) => (
                      <div key={field.key}>
                        <label className="block text-xs text-gray-500 mb-0.5">
                          {field.label}
                          {field.optional && <span className="text-gray-400"> (optional)</span>}
                        </label>
                        <input
                          type="text"
                          value={fieldValues[event.name]?.[field.key] ?? ""}
                          onChange={(e) => updateField(event.name, field.key, e.target.value)}
                          className="input input-bordered input-sm w-full border border-gray-300 text-sm"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => sendEvent(event.name)}
                  disabled={statuses[event.name] === "loading"}
                  className="btn btn-sm bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-1 mt-1 shrink-0"
                >
                  {statuses[event.name] === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : statuses[event.name] === "success" ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : statuses[event.name] === "error" ? (
                    <AlertCircle className="w-4 h-4" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>
              {responses[event.name] && (
                <div
                  className={`mt-2 text-xs p-2 rounded ${
                    statuses[event.name] === "success"
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-700"
                  }`}
                >
                  {responses[event.name]}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
