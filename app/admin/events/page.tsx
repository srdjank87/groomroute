import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import Link from "next/link";
import { ArrowLeft, Activity, ExternalLink } from "lucide-react";

export default async function AdminEventsPage() {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
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
                View analytics events in PostHog
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl p-8 border border-gray-200 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100 mb-4">
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Events are tracked in PostHog
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            All product analytics events, funnels, and session replays are available
            in your PostHog dashboard. Click below to view detailed analytics.
          </p>
          <a
            href="https://us.posthog.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Open PostHog Dashboard
            <ExternalLink className="w-4 h-4" />
          </a>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Events Being Tracked
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
              <div className="p-3 bg-gray-50 rounded-lg">account_created</div>
              <div className="p-3 bg-gray-50 rounded-lg">first_action_completed</div>
              <div className="p-3 bg-gray-50 rounded-lg">route_optimized</div>
              <div className="p-3 bg-gray-50 rounded-lg">day_viewed</div>
              <div className="p-3 bg-gray-50 rounded-lg">appointment_created</div>
              <div className="p-3 bg-gray-50 rounded-lg">customer_created</div>
              <div className="p-3 bg-gray-50 rounded-lg">trial_converted</div>
              <div className="p-3 bg-gray-50 rounded-lg">trial_expired</div>
              <div className="p-3 bg-gray-50 rounded-lg">$pageview (auto)</div>
            </div>
          </div>

          <div className="mt-6 text-sm text-gray-500">
            <p>
              Note: Make sure <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_POSTHOG_KEY</code> is configured
              in your environment variables for events to be captured.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
