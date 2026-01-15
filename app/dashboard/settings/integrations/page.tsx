"use client";

import Link from "next/link";
import { ArrowLeft, Calendar, Clock } from "lucide-react";

export default function IntegrationsPage() {
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
          <div className="p-2 bg-sky-100 rounded-lg">
            <Calendar className="h-6 w-6 text-sky-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integrations</h1>
            <p className="text-gray-600">
              Connect external services to enhance your workflow
            </p>
          </div>
        </div>
      </div>

      {/* Google Calendar Integration - Coming Soon */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gray-100 rounded-lg">
                <svg
                  viewBox="0 0 24 24"
                  className="h-8 w-8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M19.5 4H4.5C3.67157 4 3 4.67157 3 5.5V18.5C3 19.3284 3.67157 20 4.5 20H19.5C20.3284 20 21 19.3284 21 18.5V5.5C21 4.67157 20.3284 4 19.5 4Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M3 8H21V5.5C21 4.67157 20.3284 4 19.5 4H4.5C3.67157 4 3 4.67157 3 5.5V8Z"
                    fill="#1967D2"
                  />
                  <path
                    d="M8 12H10V14H8V12ZM11 12H13V14H11V12ZM14 12H16V14H14V12ZM8 15H10V17H8V15ZM11 15H13V17H11V15Z"
                    fill="white"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Google Calendar
                  </h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                    <Clock className="h-3 w-3" />
                    Coming Soon
                  </span>
                </div>
                <p className="text-gray-600 mt-1">
                  Automatically sync your appointments to Google Calendar. When
                  you create, update, or cancel appointments in GroomRoute, they
                  will be reflected in your calendar.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            disabled
            className="btn btn-sm bg-gray-200 text-gray-500 border-0 cursor-not-allowed"
          >
            Connect Google Calendar
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h3 className="font-medium text-blue-900 mb-2">Coming soon</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            - New appointments will automatically appear in your Google Calendar
          </li>
          <li>- Updated appointments will sync their changes to the calendar</li>
          <li>
            - Cancelled or deleted appointments will be removed from the
            calendar
          </li>
        </ul>
        <p className="text-sm text-blue-700 mt-3">
          We&apos;re finishing up the Google verification process. This feature
          will be available soon!
        </p>
      </div>
    </div>
  );
}
