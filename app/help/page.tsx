import Link from "next/link";
import Image from "next/image";
import { ChevronRight, MapPin, Calendar, Users, Route, Clock, MessageSquare, Shield, Settings, HelpCircle, Mail, Globe, Heart, CalendarSync, UserPlus } from "lucide-react";

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
            <a href="#booking" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Globe className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Online Booking</span>
            </a>
            <a href="#calm" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Heart className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Calm Center</span>
            </a>
            <a href="#workload" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <Shield className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Workload</span>
            </a>
            <a href="#calendar" className="p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors text-center">
              <CalendarSync className="h-6 w-6 text-[#A5744A] mx-auto mb-2" />
              <span className="text-sm font-medium text-gray-900">Google Calendar</span>
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
                What is workload protection?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                GroomRoute tracks the physical intensity of each pet you groom. A day of 4 doodles is very different from 4 chihuahuas. Each pet gets an intensity level (Light, Moderate, Demanding, or Intensive), and your daily total is tracked against your personal limit. You&apos;ll see warnings when your day is getting too heavy. Set your daily limit in Settings &rarr; Profile.
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

      {/* Online Booking */}
      <section id="booking" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Globe className="h-6 w-6 text-[#A5744A]" />
            Online Booking
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I set up my booking page?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Go to Settings &rarr; Online Booking and toggle it on. You&apos;ll get a unique booking link (e.g., groomroute.com/book/your-name) that you can share with clients. They can enter their address, pick a date, and book an appointment without any back-and-forth texting.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How does the booking flow work for clients?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Clients go through 4 steps: (1) Enter their address - GroomRoute checks if they&apos;re in your service area and suggests the best days, (2) Tell us about their pet - breed and size help estimate appointment duration, (3) Pick a date and time - only shows slots that are actually available, (4) Enter their contact info. The appointment then appears on your dashboard automatically.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Can I customize my booking URL?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Yes! In Settings &rarr; Online Booking, you can edit your booking slug to something memorable. This is what appears in your booking URL after /book/.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Calm Center */}
      <section id="calm" className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Heart className="h-6 w-6 text-[#A5744A]" />
            Calm Center
          </h2>

          <div className="space-y-4">
            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What is the Calm Center?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                The Calm Center is your one-tap toolkit for handling the chaos of a grooming day. Running behind? No-show? Need to lighten your load? Instead of panic-texting clients individually, the Calm Center gives you quick actions that handle everything in one tap.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How does &quot;Running Late&quot; work?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Tap &quot;Running Behind&quot; in the Calm Center, select how late you are, and GroomRoute generates professional messages for all your remaining clients with their updated estimated arrival times. No need to text each person individually.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What other quick actions are available?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                <strong>Lighten Day</strong> - Move non-essential appointments to a lighter day<br />
                <strong>Protect Evening</strong> - Shift late appointments to keep your evening free<br />
                <strong>No Show</strong> - Handle a no-show and mark the client&apos;s record<br />
                <strong>Take a Breather</strong> - Schedule a quick break between appointments<br />
                <strong>Upset Customer</strong> - Get a pre-written empathetic response<br />
                <strong>Reply Help</strong> - AI-assisted message drafting for tricky situations
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Workload Protection */}
      <section id="workload" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Shield className="h-6 w-6 text-[#A5744A]" />
            Workload Protection
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What are groom intensity levels?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Every pet gets an intensity level based on breed, size, and coat type:<br /><br />
                <strong>Light</strong> (1 point) - Small dogs, short coats (e.g., Chihuahua, French Bulldog)<br />
                <strong>Moderate</strong> (2 points) - Standard grooms (e.g., Shih Tzu, Cocker Spaniel)<br />
                <strong>Demanding</strong> (3 points) - Double coats, large breeds (e.g., Goldendoodle, Husky)<br />
                <strong>Intensive</strong> (4 points) - Giant breeds, matted coats, reactive dogs<br /><br />
                GroomRoute suggests an intensity level based on the breed, but you can always override it.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How does the daily intensity limit work?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                You set a daily intensity limit in Settings &rarr; Profile (default is 12 points). As you book appointments, GroomRoute adds up the intensity points. You&apos;ll see warnings when your day is getting heavy, and your dashboard shows your current workload level (light, moderate, busy, heavy, or overloaded).
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Google Calendar */}
      <section id="calendar" className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <CalendarSync className="h-6 w-6 text-[#A5744A]" />
            Google Calendar
          </h2>

          <div className="space-y-4">
            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I connect Google Calendar?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Go to Settings &rarr; Integrations and click &quot;Request Access&quot; for Google Calendar. Once approved, you&apos;ll be able to connect your Google account and choose which calendar to sync with. Appointments you create in GroomRoute will appear in your Google Calendar, and vice versa.
              </p>
            </details>

            <details className="bg-gray-50 rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                Can I import existing appointments from Google Calendar?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Yes! After connecting, you can import events from Google Calendar in bulk. GroomRoute will show you a preview of the events before importing so you can choose which ones to bring in. This is a great way to get started if your schedule is already in Google Calendar.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Team Management */}
      <section id="team" className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-[#A5744A]" />
            Team Management
          </h2>

          <div className="space-y-4">
            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                How do I add team members?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                Team management is available on the Pro plan. Go to Settings &rarr; Team and click &quot;Invite Member&quot;. Enter their email and select a role (Admin or Groomer). They&apos;ll receive an email invitation to create their account and join your team.
              </p>
            </details>

            <details className="bg-white rounded-xl border p-4 group">
              <summary className="font-medium text-gray-900 cursor-pointer flex items-center justify-between">
                What&apos;s the difference between Admin and Groomer roles?
                <ChevronRight className="h-5 w-5 text-gray-400 group-open:rotate-90 transition-transform" />
              </summary>
              <p className="text-gray-600 mt-3 text-sm">
                <strong>Admin</strong> - Full access to everything: billing, settings, all groomers&apos; schedules, analytics, and team management.<br />
                <strong>Groomer</strong> - Can view and manage their own schedule, route, and clients. Cannot access billing, team settings, or other groomers&apos; data.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Account & Billing */}
      <section className="py-12 px-4 bg-white">
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
                Go to Settings &rarr; Billing and click &quot;Cancel subscription&quot; at the bottom of the page. We&apos;ll ask a few quick questions to understand what wasn&apos;t working - your feedback helps us improve. Your access continues until the end of your current billing period.
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
            href="mailto:hello@groomroute.com"
            className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
          >
            <Mail className="h-5 w-5" />
            Email Support
          </a>
          <p className="text-sm text-gray-500 mt-4">
            hello@groomroute.com
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
