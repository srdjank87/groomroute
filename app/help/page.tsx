import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Calendar, Users, Route, Clock, MessageSquare, Shield, Settings, HelpCircle, Mail } from "lucide-react";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function HelpPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <span className="font-bold text-lg">
              <GroomRouteLogo />
            </span>
          </Link>
          <Link href="/dashboard" className="btn btn-sm btn-ghost">
            Go to Dashboard
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <HelpCircle className="h-12 w-12 text-[#A5744A] mx-auto mb-4" />
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Help Center
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Everything you need to know to get the most out of GroomRoute.
          </p>
        </div>
      </section>

      {/* Quick Links */}
      <section className="py-8 px-4 border-b border-gray-200 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <a href="#getting-started" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Route className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Getting Started</span>
            </a>
            <a href="#routes" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <MapPin className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Routes</span>
            </a>
            <a href="#appointments" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Calendar className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Appointments</span>
            </a>
            <a href="#contact" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Mail className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Contact Us</span>
            </a>
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Route className="h-6 w-6 text-[#A5744A]" />
            Getting Started
          </h2>

          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">1. Add Your Customers</h3>
              <p className="text-gray-600 mb-3">
                Start by adding your existing clients. You can add them one at a time or import them in bulk from a CSV file.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Go to <strong>Clients</strong> in the sidebar</li>
                <li>Click <strong>Add Client</strong> and choose manual entry or CSV import</li>
                <li>Add their address, phone number, and pets</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">2. Set Up Your Service Areas</h3>
              <p className="text-gray-600 mb-3">
                Areas help you group appointments by location so you&apos;re not driving all over town. For example, &quot;North Austin&quot; on Mondays and &quot;South Austin&quot; on Tuesdays.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Go to <strong>Settings</strong> &rarr; <strong>Areas</strong></li>
                <li>Click <strong>Add Area</strong> and name it (e.g., &quot;Downtown&quot;, &quot;Westside&quot;)</li>
                <li>Optionally assign specific days to each area</li>
                <li>When adding or editing clients, assign them to an area based on their location</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">3. Schedule Appointments</h3>
              <p className="text-gray-600 mb-3">
                Once you have clients, schedule their appointments for the day.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Go to <strong>Appointments</strong> in the sidebar</li>
                <li>Click <strong>New Appointment</strong></li>
                <li>Select the client, pet, service type, and time</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">4. Optimize Your Route</h3>
              <p className="text-gray-600 mb-3">
                Let GroomRoute figure out the best order for your appointments to minimize driving time.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Go to <strong>Routes</strong> in the sidebar</li>
                <li>Click <strong>Optimize Route</strong></li>
                <li>Your appointments will be reordered for the shortest total drive time</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl border p-6">
              <h3 className="font-semibold text-gray-900 mb-3">5. Start Your Day</h3>
              <p className="text-gray-600 mb-3">
                When you&apos;re ready to hit the road, start your workday to begin navigation.
              </p>
              <ul className="text-sm text-gray-600 space-y-1 ml-4 list-disc">
                <li>Click <strong>Start Workday</strong> on the Routes page</li>
                <li>Tap on any appointment to navigate with one tap</li>
                <li>Mark appointments as complete as you finish them</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Routes FAQ */}
      <section id="routes" className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-[#A5744A]" />
            Routes & Navigation
          </h2>

          <div className="space-y-4">
            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How does route optimization work?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                GroomRoute uses smart algorithms to calculate the most efficient order for your appointments based on driving distance and time. It considers your starting location (your base address) and finds the route that minimizes total travel time between stops.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What are Area Days?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Area Days help you group appointments by geographic area. For example, you might do North Austin on Mondays and South Austin on Tuesdays. This keeps your driving tight and predictable. You can set up Service Areas in Settings and assign customers to areas.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Can I manually reorder my route?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Yes! After optimizing, you can drag and drop appointments to change the order. This is useful when you know something the algorithm doesn&apos;t, like a client who needs to be first because of their schedule.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Which navigation app does it use?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                You can choose between Google Maps and Apple Maps. Go to Settings &rarr; Profile to set your preference. When you tap &quot;Navigate&quot; on an appointment, it will open your preferred maps app with the destination pre-filled.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Appointments FAQ */}
      <section id="appointments" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Calendar className="h-6 w-6 text-[#A5744A]" />
            Appointments
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I cancel or reschedule an appointment?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Tap on the appointment to open the details. From there, you can change the status to &quot;Cancelled&quot; or edit the date and time. If you use the Calm Control Center, you can also use &quot;Skip Stop&quot; to remove an appointment from today&apos;s route and optionally notify the client.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What do the appointment statuses mean?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                <strong>Confirmed</strong> - Ready to go<br />
                <strong>In Progress</strong> - You&apos;re currently at this appointment<br />
                <strong>Completed</strong> - Done!<br />
                <strong>Cancelled</strong> - Appointment was cancelled<br />
                <strong>No Show</strong> - Client wasn&apos;t available
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What is the large dog limit?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                If you set a large dog limit in your profile (Settings &rarr; Profile), GroomRoute will warn you when booking appointments that would exceed your limit for the day. Large dogs (over 50 lbs) can be physically demanding, so this helps protect your energy.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Can I send &quot;On My Way&quot; messages?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Yes! On the Routes page, each appointment has an &quot;On My Way&quot; button. Tap it to quickly send an SMS or message letting the client know you&apos;re headed their way. You can customize the message template in Settings.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Clients FAQ */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Users className="h-6 w-6 text-[#A5744A]" />
            Clients & Pets
          </h2>

          <div className="space-y-4">
            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I import my existing clients?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Go to Clients &rarr; Add Client &rarr; Import from CSV. Download our template to see the expected format, or upload your own CSV with columns for client name, phone, email, address, and pet details. We&apos;ll automatically detect duplicates.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What are behavior flags?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Behavior flags are notes you can add to a pet&apos;s profile to remember special handling needs. Examples: &quot;Bite risk&quot;, &quot;Needs muzzle&quot;, &quot;Anxious&quot;, &quot;Senior&quot;. These show up when booking appointments so you don&apos;t forget.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What is the high-risk client warning?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                GroomRoute tracks cancellations and no-shows per client. If a client has 3+ cancellations or no-shows, you&apos;ll see a warning when booking them. This helps you decide if you want to require a deposit or confirm by phone before scheduling.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Account & Billing */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="h-6 w-6 text-[#A5744A]" />
            Account & Billing
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I upgrade my plan?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Go to Settings &rarr; Billing. You&apos;ll see your current plan and options to upgrade. Upgrades take effect immediately, and you&apos;ll be charged a prorated amount for the remainder of your billing cycle.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I cancel my subscription?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Go to Settings &rarr; Billing and click &quot;Manage Subscription&quot;. This will open the Stripe customer portal where you can cancel. Your access continues until the end of your current billing period.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What happens when my trial ends?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                If you added a payment method, you&apos;ll be charged automatically when your trial ends. If not, you&apos;ll be prompted to add one. Your data is never deleted - you can always come back and pick up where you left off.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-12 px-4 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-4xl mx-auto text-center">
          <Mail className="h-12 w-12 text-[#A5744A] mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            We&apos;re here to help! Reach out and we&apos;ll get back to you as quickly as possible.
          </p>
          <a
            href="mailto:support@groomroute.com"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            <Mail className="h-5 w-5" />
            Email Support
          </a>
          <p className="text-sm text-gray-500 mt-4">
            support@groomroute.com
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 bg-gray-100 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-lg mb-4">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={20}
              height={20}
              className="w-5 h-5"
            />
            <GroomRouteLogo />
          </Link>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <Link href="/privacy" className="hover:text-gray-900">Privacy</Link>
            <Link href="/terms" className="hover:text-gray-900">Terms</Link>
            <Link href="/dashboard" className="hover:text-gray-900">Dashboard</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
