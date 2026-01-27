"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Shield, Clock, Heart, CheckCircle2, XCircle, X, ChevronRight, Zap, MessageSquare, Globe } from "lucide-react";
import { useState } from "react";
import { LandingPageAnalytics, trackCTAClick } from "@/components/LandingPageAnalytics";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main>
      <LandingPageAnalytics />
      {/* HEADER */}
      <header className="border-b border-base-300 bg-base-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-1">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={16}
              height={16}
              className="w-6 h-6"
            />
            <span className="font-bold text-lg">
              <GroomRouteLogo />
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#how-it-works" className="link link-hover">
              How It Works
            </Link>
            <Link href="#features" className="link link-hover">
              Features
            </Link>
            <Link href="#testimonials" className="link link-hover">
              Stories
            </Link>
            <Link href="#pricing" className="link link-hover">
              Pricing
            </Link>
            <Link href="/help" className="link link-hover">
              Help
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/auth/signin"
              className="btn btn-ghost btn-sm"
              onClick={() => trackCTAClick("sign_in", "header", "signin")}
            >
              Sign In
            </Link>
            <Link
              href="/auth/signup?plan=growth&billing=monthly"
              className="btn btn-gradient btn-sm hidden sm:inline-flex items-center"
              onClick={() => trackCTAClick("start_free_trial", "header")}
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      {/* HERO - Calm, Predictable Day */}
      <section className="hero bg-gradient-to-br from-amber-50 via-orange-50 to-white py-6 sm:py-8 lg:py-12">
        <div className="hero-content max-w-6xl w-full px-4">
          <div className="text-center w-full">
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight text-gray-900">
              Finally, a calm day.
            </h1>

            <p className="text-base sm:text-lg lg:text-2xl mb-4 sm:mb-6 leading-relaxed max-w-3xl mx-auto text-gray-700">
              GroomRoute takes over after your clients are booked&nbsp;-&nbsp;<br className="hidden lg:block" />
              organizing routes, protecting your energy, and keeping your day on track.
            </p>

            {/* Hero image - positioned below subheadline */}
            <div className="flex justify-center mb-4 sm:mb-6">
              <Image
                src="/images/hero.jpg"
                alt="GroomRoute app showing optimized route - finally a calm day for mobile groomers"
                width={1200}
                height={675}
                className="rounded-xl sm:rounded-2xl w-full max-w-xl sm:max-w-2xl lg:max-w-3xl shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white"
                priority
              />
            </div>

            {/* Value props */}
            <div className="flex flex-wrap max-w-3xl mx-auto mb-4 gap-2 sm:gap-4 lg:gap-6 justify-center text-xs sm:text-sm lg:text-base text-gray-600">
              <span className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                24/7 online booking
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                Less driving
              </span>
              <span className="flex items-center gap-1 sm:gap-1.5">
                <CheckCircle2 className="h-3 w-3 sm:h-4 sm:w-4 text-emerald-600 flex-shrink-0" />
                Energy protected
              </span>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-3 sm:mb-4">
              <Link
                href="/auth/signup?plan=growth&billing=monthly"
                className="btn btn-gradient btn-md sm:btn-lg text-base sm:text-lg px-6 sm:px-8"
                onClick={() => trackCTAClick("start_your_calm_day", "hero")}
              >
                Start Your Calm Day
                <ChevronRight className="h-5 w-5" />
              </Link>
              <Link
                href="#how-it-works"
                className="btn btn-outline btn-md sm:btn-lg text-base sm:text-lg px-6 sm:px-8 border-2 border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white"
                onClick={() => trackCTAClick("see_how_it_works", "hero", "how_it_works")}
              >
                See How It Works
              </Link>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">14-day free trial. No commitment. Cancel anytime.</p>
          </div>
        </div>
      </section>

      {/* EASY ONLINE BOOKING - NEW Feature Highlight */}
      <section className="py-10 lg:py-12 px-6 bg-gradient-to-r from-teal-50 to-emerald-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <Globe className="h-4 w-4" />
              New: Easy Online Booking
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
              A booking page that protects your day.
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Clients book online - within the limits you set for your route, workload, and energy.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">🔗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Your Booking Link</h3>
              <p className="text-sm text-gray-600">
                Get a personalized URL to share via text, email, or social media.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">📍</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Smart Area Days</h3>
              <p className="text-sm text-gray-600">
                Clients see recommended days based on where they live - protecting your route.
              </p>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-md">
              <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-xl">✨</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Zero Friction</h3>
              <p className="text-sm text-gray-600">
                Bookings appear on your calendar automatically. No importing, no double-entry.
              </p>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have a booking app? GroomRoute works alongside it too - sync from Google Calendar or add appointments manually.
          </p>
        </div>
      </section>

      {/* THE PROBLEM - Emotional */}
      <section className="py-12 lg:py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-gray-900">
            You love grooming dogs.<br />The schedule chaos? Not so much.
          </h2>

          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Zigzagging across town. That 5pm appointment you shouldn&apos;t have taken.
            The third large dog in a row when your back is already aching.
            Last-minute cancellations that wreck your income and your mood.
          </p>

          <div className="grid md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">30+ minutes between stops</p>
                  <p className="text-sm text-gray-600">A route that zigzags across town - hours lost and a day that never settles.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Body wrecked by 3pm</p>
                  <p className="text-sm text-gray-600">Too many heavy dogs stacked together - energy drained before the day is half over.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Last-minute cancellations</p>
                  <p className="text-sm text-gray-600">A booked slot you can&apos;t replace - income lost and a calmer day suddenly broken.</p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <XCircle className="h-6 w-6 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-gray-900">Running late, panic texting</p>
                  <p className="text-sm text-gray-600">One delay triggers five messages - focus gone while you&apos;re elbow-deep in a doodle.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-10 max-w-2xl mx-auto">
            <p className="text-lg text-gray-600 mb-4">
              Most grooming software promises &quot;more appointments&quot; and &quot;more revenue&quot;.
            </p>
            <p className="text-2xl lg:text-3xl font-bold text-gray-900">
              But what if you just want a calm, predictable day?
            </p>
          </div>
        </div>
      </section>

      {/* WHERE GROOMROUTE FITS - Workflow */}
      <section className="py-12 lg:py-16 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              From booking to calm day - all in one place
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {/* Step 1 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-teal-400 relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center font-bold text-white">
                1
              </div>
              <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900">Clients book online</h3>
              <p className="text-gray-600">
                Share your booking link. Clients see available times based on your area days and pick what works.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-[#A5744A] relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-[#A5744A] rounded-full flex items-center justify-center font-bold text-white">
                2
              </div>
              <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900">GroomRoute organizes</h3>
              <p className="text-gray-600">
                We cluster appointments by area, protect your workload, and plan the best route for your day.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-400 relative">
              <div className="absolute -top-4 left-6 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center font-bold text-white">
                3
              </div>
              <h3 className="text-xl font-bold mt-2 mb-3 text-gray-900">You finish calm and on time</h3>
              <p className="text-gray-600">
                Less driving. Fewer surprises. No mid-groom texting. Energy left at the end of the day.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS - The Calm System */}
      <section id="how-it-works" className="py-12 lg:py-16 px-6 bg-gradient-to-br from-emerald-50 to-teal-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              How GroomRoute brings calm to your day
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-3">
              Not &quot;more appointments&quot;. Not &quot;faster scheduling&quot;.</p>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A sustainable pace that protects your energy and your income.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1: Area Days */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-emerald-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Area Days</h3>
                </div>

                {/* The Result - Visual Anchor */}
                <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-4">
                  <p className="text-lg font-bold text-emerald-800">
                    Appointments 5-15 minutes apart instead of 30+
                  </p>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  Assign neighborhoods to specific days. Monday is North Side. Tuesday and Friday are Downtown.
                  Stop zigzagging across town.
                </p>

                {/* Screenshot as footnote */}
                <div className="bg-gray-100 rounded-lg p-1.5">
                  <Image
                    src="/images/area_days.jpg"
                    alt="Area Days feature"
                    width={300}
                    height={200}
                    quality={85}
                    className="rounded-md w-full opacity-90"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Workload Protection */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Workload Protection</h3>
                </div>

                {/* The Result - Visual Anchor */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-4">
                  <p className="text-lg font-bold text-amber-800">
                    Days that don&apos;t wreck your body or your sanity
                  </p>
                </div>

                <p className="text-gray-600 text-sm mb-4">
                  GroomRoute knows that 4 doodles isn&apos;t the same as 4 chihuahuas.
                  It auto-detects breed difficulty - type &quot;Goldendoodle&quot; and we&apos;ll suggest &quot;Demanding&quot;.
                  Set your daily limits and get warned <em>before</em> you overcommit.
                </p>

                {/* Screenshot as footnote */}
                <div className="bg-gray-100 rounded-lg p-1.5">
                  <Image
                    src="/images/workload_protection.jpg"
                    alt="Workload Protection feature"
                    width={300}
                    height={200}
                    quality={85}
                    className="rounded-md w-full opacity-90"
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Day-of Rescue */}
            <div className="bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Heart className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Day-of Rescue</h3>
                </div>

                {/* The Result - Visual Anchor */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-4">
                  <p className="text-lg font-bold text-blue-800">
                    Problems handled without stress spirals
                  </p>
                </div>

                {/* Concrete scenarios */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 font-bold">→</span>
                    <span className="text-gray-600"><strong>Client cancels at 10am?</strong> One tap finds a nearby fill-in from your waitlist.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 font-bold">→</span>
                    <span className="text-gray-600"><strong>Running 20 minutes late?</strong> One tap updates all remaining clients with new ETAs.</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <span className="text-blue-500 font-bold">→</span>
                    <span className="text-gray-600"><strong>Giant doodle took forever?</strong> One tap reshuffles your afternoon.</span>
                  </div>
                </div>

                {/* Screenshot as footnote */}
                <div className="bg-gray-100 rounded-lg p-1.5">
                  <Image
                    src="/images/day_rescue.jpg"
                    alt="Day-of Rescue feature"
                    width={300}
                    height={200}
                    quality={85}
                    className="rounded-md w-full opacity-90"
                  />
                </div>
              </div>
            </div>
          </div>

          <p className="text-center text-gray-600 mt-10 text-lg font-medium">
            Most booking tools stop once the appointment is placed.<br />
            <span className="text-[#A5744A]">GroomRoute is just getting started.</span>
          </p>
        </div>
      </section>

      {/* WHAT WE DON'T INCLUDE - Differentiation */}
      <section className="py-12 lg:py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-xl text-gray-600 mb-3">
              We didn&apos;t build another bloated salon system and slap &quot;mobile&quot; on it.</p>
              <p className="text-xl text-gray-600">
              GroomRoute is purpose-built for life in a grooming van.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* What we include */}
            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6" />
                Built for mobile groomers
              </h3>
              <ul className="space-y-4">
                {[
                  "Easy online booking page",
                  "Route clustering by neighborhood",
                  "Smart breed difficulty detection",
                  "Large dog limits & working hours",
                  "One-tap navigation to Google or Apple Maps",
                  "Quick client messaging",
                  "Pet details & behavior flags",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What we don't include */}
            <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8">
              <h3 className="text-xl font-bold mb-6 text-gray-500 flex items-center gap-2">
                <XCircle className="h-6 w-6" />
                What GroomRoute intentionally doesn&apos;t do
              </h3>
              <ul className="space-y-4">
                {[
                  "Lead capture & marketing automation",
                  "Intake forms & contracts",
                  "Payment processing & invoicing",
                  "Complicated reporting dashboards",
                  "Enterprise team management",
                  "Features that require a manual",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <XCircle className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-500">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 font-medium">Why?</p>
                <p className="text-sm text-gray-500 mt-1">
                  Because those don&apos;t fix your day. GroomRoute is built for the part of your business most software ignores: <em>from booking to getting home calm.</em>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - One-Tap Actions */}
      <section id="features" className="py-12 lg:py-16 px-6 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Built for post-booking chaos
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              One tap. Problem solved.
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-3">
              You work in noise, motion, and time pressure.</p>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every action in GroomRoute is designed for one-handed use.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature cards */}
            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow border-2 border-teal-200">
              <div className="card-body">
                <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <h3 className="card-title text-lg">Online Booking</h3>
                <p className="text-gray-600 text-sm">
                  Your own booking page. Clients enter their address, see your best days for their area, and book instantly. No more back-and-forth texts.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-[#A5744A]/10 rounded-lg flex items-center justify-center mb-4">
                  <MapPin className="h-6 w-6 text-[#A5744A]" />
                </div>
                <h3 className="card-title text-lg">Optimize My Route</h3>
                <p className="text-gray-600 text-sm">
                  One tap reorders your day for minimum driving. See your estimated finish time instantly.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="card-title text-lg">Start Driving</h3>
                <p className="text-gray-600 text-sm">
                  One tap opens Google/Apple Maps with your next stop. No copying addresses, no fumbling.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="card-title text-lg">Running Late</h3>
                <p className="text-gray-600 text-sm">
                  Tap &quot;Running 15 minutes late&quot; - every remaining client gets a professional message with their updated time. No panic texting while elbow-deep in a doodle.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                </div>
                <h3 className="card-title text-lg">Complete & Move On</h3>
                <p className="text-gray-600 text-sm">
                  Mark done, see what&apos;s next, start driving. Your dashboard updates in real-time.
                </p>
              </div>
            </div>

            <div className="card bg-white shadow-lg hover:shadow-xl transition-shadow">
              <div className="card-body">
                <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-amber-600" />
                </div>
                <h3 className="card-title text-lg">Skip with Reason</h3>
                <p className="text-gray-600 text-sm">
                  Client no-shows or cancels last minute? Tap, select reason, done. GroomRoute tracks patterns - you&apos;ll see a warning before booking a serial canceller again.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* BEFORE/AFTER - Transformation */}
      <section className="py-12 lg:py-16 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              The transformation
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Before */}
            <div className="rounded-2xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Before GroomRoute</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Scrambling to figure out your route each morning</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Saying yes to appointments you shouldn&apos;t take</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Stress texting when running late</span>
                </div>
                <div className="flex items-start gap-3">
                  <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Body aching by mid-afternoon</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-red-200 text-center">
                <p className="text-red-700 font-semibold">Result: Work that doesn&apos;t feel sustainable</p>
              </div>
            </div>

            {/* After */}
            <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">With GroomRoute</h3>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Know exactly where you&apos;re going before you leave home</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Warnings before you overload yourself</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">One tap handles client communication</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Energy left at the end of the day</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">Clients notice you&apos;re always on time, always professional</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-emerald-200 text-center">
                <p className="text-emerald-700 font-semibold">Result: Calm days, happy clients, sustainable career</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLIENTS NOTICE - Professional Reliability */}
      <section className="py-10 lg:py-12 px-6 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl lg:text-3xl font-bold mb-4 text-gray-900">
            Your clients will notice.
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            When you show up on time, every time. When you communicate proactively instead of scrambling.
            When you seem calm instead of frazzled.
          </p>
        </div>
      </section>

      {/* TESTIMONIALS - Emotional Outcomes */}
      <section id="testimonials" className="py-12 lg:py-16 px-6 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              &quot;I actually finish on time now.&quot;
            </h2>
            <p className="text-xl text-gray-600">
              Real groomers, real calm.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4 italic text-gray-700">
                  &quot;I was burning out hard. Back hurt, brain was mush by 3pm. GroomRoute&apos;s workload thing actually gets that a day with 4 doodles isn&apos;t the same as 4 chihuahuas. <span className="font-semibold text-gray-900">My body doesn&apos;t hate me anymore.</span>&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <Image src="/images/sarah.jpg" alt="Sarah M." width={48} height={48} className="rounded-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Sarah M.</div>
                    <div className="text-sm text-gray-500">San Diego, CA</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4 italic text-gray-700">
                  &quot;The area days feature changed everything. I used to drive 45 minutes between appointments. Now? <span className="font-semibold text-gray-900">I&apos;m home by 4:30 most days.</span> My husband thought I got fired.&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <Image src="/images/jessica.jpg" alt="Jessica P." width={48} height={48} className="rounded-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Jessica P.</div>
                    <div className="text-sm text-gray-500">Portland, OR</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4 italic text-gray-700">
                  &quot;The running late button saved my sanity. I used to stress SO HARD about texting everyone while I&apos;m elbow-deep in a giant poodle. <span className="font-semibold text-gray-900">Now it&apos;s just... handled.</span>&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <Image src="/images/mike.jpg" alt="Mike T." width={48} height={48} className="rounded-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Mike T.</div>
                    <div className="text-sm text-gray-500">Denver, CO</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="card bg-white shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4 italic text-gray-700">
                  &quot;Finally, software that doesn&apos;t feel like it was built by someone who&apos;s never groomed a day in their life. <span className="font-semibold text-gray-900">It knows I can&apos;t do 3 giant breeds back-to-back.</span>&quot;
                </p>
                <div className="flex items-center gap-3">
                  <div className="avatar">
                    <div className="w-12 rounded-full">
                      <Image src="/images/carlos.jpg" alt="Carlos R." width={48} height={48} className="rounded-full object-cover" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">Carlos R.</div>
                    <div className="text-sm text-gray-500">Miami, FL</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALM CENTER HIGHLIGHT - Unique Feature */}
      <section className="py-12 lg:py-16 px-6 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50" id="calm-center">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span className="text-lg">🧘</span>
              Only on Growth & Pro Plans
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Introducing the Calm Control Center
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Because grooming software should care about <em>you</em>, not just your schedule.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Left: Feature highlights */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-purple-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Workload Protection</h3>
                    <p className="text-gray-600 text-sm">Set daily limits on large dogs, total appointments, and working hours. We&apos;ll warn you before you overbook yourself.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-indigo-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">😤</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Stress Detection</h3>
                    <p className="text-gray-600 text-sm">AI monitors your schedule for red flags: tight travel times, heavy days, back-to-back difficult dogs. Get alerts before burnout hits.</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg border-l-4 border-blue-500">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🌬️</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 mb-1">Quick Rescues</h3>
                    <p className="text-gray-600 text-sm">Running late? Difficult customer? One tap to send delay notifications, reschedule, or get breathing exercises to reset.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Visual mockup / testimonial */}
            <div className="flex flex-col justify-center">
              <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-purple-200">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    Your day looks smooth
                  </div>
                </div>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Today&apos;s Appointments</span>
                    <span className="font-bold text-gray-900">5 dogs</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Large Dogs</span>
                    <span className="font-bold text-green-600">2 of 3 limit</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">Finish Time</span>
                    <span className="font-bold text-green-600">5:30 PM ✓</span>
                  </div>
                </div>
                <p className="text-center text-gray-500 text-sm italic">
                  &quot;It&apos;s like having a friend who actually gets what this job does to your body.&quot;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-12 lg:py-16 px-6 bg-white" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4 text-gray-900">
              Choose your calm
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Pays for itself in miles saved and stress avoided.
            </p>

            {/* Pricing Toggle */}
            <div className="justify-center items-center gap-4 p-4 border-2 border-base-300 rounded-lg bg-base-100 inline-flex mx-auto">
              <span className={`text-lg font-medium ${!isYearly ? 'text-[#A5744A]' : 'opacity-60'}`}>Monthly</span>
              <input
                type="checkbox"
                className="toggle toggle-primary border-2 border-base-300"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
              />
              <span className={`text-lg font-medium ${isYearly ? 'text-[#A5744A]' : 'opacity-60'}`}>
                Yearly <span className="badge badge-success badge-sm ml-1">Save 17%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="card bg-base-100 shadow-xl border-2 border-base-200 h-full">
              <div className="card-body">
                <div className="badge badge-ghost mb-2">STARTER</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '32' : '39'}</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>
                {isYearly && <div className="text-xs text-emerald-600 -mt-3 mb-4">Billed annually ($390/year)</div>}

                <p className="text-sm text-gray-600 mb-6">
                  For solo groomers getting organized
                </p>

                <ul className="space-y-3 mb-6 flex-grow">
                  {[
                    "Up to 50 clients",
                    "Online booking page",
                    "Route optimization",
                    "Area day scheduling",
                    "One-tap navigation",
                    "Email support",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                  {/* Calm Center not included indicator */}
                  <li className="flex gap-2 items-start opacity-50">
                    <X className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-500">Calm Control Center</span>
                  </li>
                </ul>

                <Link
                  href={`/auth/signup?plan=starter&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  className="btn btn-outline btn-block border-2"
                  onClick={() => trackCTAClick("start_free_trial", "pricing_starter")}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Growth - POPULAR */}
            <div className="card shadow-2xl border-4 border-[#A5744A] bg-gradient-to-br from-amber-50 to-orange-50 transform md:scale-105 h-full">
              <div className="card-body">
                <div className="badge badge-primary mb-2 bg-[#A5744A] border-[#A5744A]">MOST POPULAR</div>
                <div className="badge badge-ghost mb-2">GROWTH</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '66' : '79'}</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>
                {isYearly && <div className="text-xs text-emerald-600 -mt-3 mb-4">Billed annually ($790/year)</div>}

                <p className="text-sm text-gray-600 mb-6">
                  For groomers who want full protection
                </p>

                <ul className="space-y-3 mb-6 flex-grow">
                  {[
                    "Unlimited clients",
                    "Everything in Starter, plus:",
                    "Calm-first booking rules",
                    "Smart booking suggestions",
                    "Workload protection limits",
                    "Running late notifications",
                    "Pet behavior flags",
                    "Client cancellation history",
                    "Priority support",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                  {/* Calm Center highlighted */}
                  <li className="flex gap-2 items-start bg-emerald-50 -mx-2 px-2 py-1.5 rounded-lg border border-emerald-200">
                    <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm font-medium text-emerald-800">Calm Control Center</span>
                  </li>
                </ul>

                <Link
                  href={`/auth/signup?plan=growth&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  className="btn btn-block bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
                  onClick={() => trackCTAClick("start_free_trial", "pricing_growth")}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>

            {/* Pro */}
            <div className="card bg-base-100 shadow-xl border-2 border-base-200 h-full">
              <div className="card-body">
                <div className="badge badge-ghost mb-2">PRO</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '124' : '149'}</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>
                {isYearly && <div className="text-xs text-emerald-600 -mt-3 mb-4">Billed annually ($1,490/year)</div>}

                <p className="text-sm text-gray-600 mb-6">
                  For multi-van operations
                </p>

                <ul className="space-y-3 mb-6 flex-grow">
                  {[
                    "Everything in Growth, plus:",
                    "Unlimited groomers/vans",
                    "Team calendar view",
                    "Per-groomer analytics",
                    "Phone support",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                  {/* Calm Center included */}
                  <li className="flex gap-2 items-start">
                    <Shield className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm">Calm Control Center</span>
                  </li>
                  {/* Additional seats info */}
                  <li className="flex gap-2 items-start pt-2 border-t border-gray-100 mt-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-600">
                      Add team members: +${isYearly ? '25' : '29'}/groomer
                    </span>
                  </li>
                </ul>

                <Link
                  href={`/auth/signup?plan=pro&billing=${isYearly ? 'yearly' : 'monthly'}`}
                  className="btn btn-outline btn-block border-2"
                  onClick={() => trackCTAClick("start_free_trial", "pricing_pro")}
                >
                  Start Free Trial
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600">
              Every plan includes a <strong>14-day free trial</strong>. Cancel anytime.
            </p>
          </div>

          {/* Onboarding Reassurance */}
          <div className="mt-10 max-w-2xl mx-auto">
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
              <p className="text-emerald-800 font-medium mb-2">
                You don&apos;t need to move everything on day one.
              </p>
              <p className="text-emerald-700 text-sm">
                Most groomers start by adding just their regular clients or a single area day. Setup takes minutes, not hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* GUARANTEE */}
      <section className="py-12 lg:py-16 px-6 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white border-4 border-emerald-400 rounded-2xl shadow-2xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              The Calm Day Guarantee
            </h2>
            <p className="text-xl mb-4 text-gray-700">
              If GroomRoute doesn&apos;t make your days noticeably calmer within 30 days, we&apos;ll refund every penny.
            </p>
            <p className="text-gray-600">
              No questions asked. No hoops. We&apos;re that confident.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-12 lg:py-16 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl lg:text-3xl font-bold mb-8 text-center text-gray-900">
            Common questions
          </h2>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                How does the online booking work?
              </h3>
              <p className="text-gray-600">
                You get a personal booking link (like groomroute.com/book/your-name). Clients enter their address, and we show them your best available days based on when you&apos;re already in their area. They pick a time and the appointment appears on your calendar automatically.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                Do I need to switch my booking app?
              </h3>
              <p className="text-gray-600">
                No. You can use GroomRoute&apos;s built-in booking page, or keep your existing booking app and sync appointments from Google Calendar. Many groomers use both - the GroomRoute link for new clients and their existing system for regulars.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                How do I get my existing appointments into GroomRoute?
              </h3>
              <p className="text-gray-600">
                Sync from Google Calendar, import from a spreadsheet, or add appointments manually. Most groomers start with their regulars and add more over time.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                What if I already use MoeGo, Groomer.io, or another app?
              </h3>
              <p className="text-gray-600">
                You can switch to GroomRoute&apos;s built-in booking page, or keep your current system and just use GroomRoute for route optimization. Import your clients and you&apos;re set either way.
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-2">
                What do my clients see when I tap &quot;Running Late&quot; or &quot;On My Way&quot;?
              </h3>
              <p className="text-gray-600">
                They get a clean, professional text message with your updated ETA. No &quot;Sent via GroomRoute&quot; branding - it looks like you took the time to message them personally. Because you did, just faster.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-16 lg:py-24 px-6 bg-gradient-to-br from-[#A5744A]/10 to-amber-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900">
            Ready for calmer days?
          </h2>
          <p className="text-xl text-gray-600 mb-3 max-w-2xl mx-auto">
            Stop zigzagging. Stop overcommitting. Stop the stress spirals.</p>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Start your free trial and see what a calm day feels like.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Link
              href="/auth/signup?plan=growth&billing=monthly"
              className="btn btn-gradient btn-lg text-lg px-10"
              onClick={() => trackCTAClick("start_your_calm_day", "final_cta")}
            >
              Start Your Calm Day
              <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <p className="text-sm text-gray-500">
            14-day free trial. No commitment. Cancel anytime.
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Keep your booking app. Sync from Google Calendar. We handle the day.
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <aside>
          <div className="flex items-center gap-2 font-bold text-xl mb-2">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <GroomRouteLogo />
          </div>
          <p className="max-w-md">Route optimization and day management for mobile groomers.</p>
          <p className="max-w-md">Finally, a calm day.</p>
          <div className="flex gap-4 mt-4">
            <Link href="/help" className="link link-hover text-sm">Help Center</Link>
            <Link href="/privacy" className="link link-hover text-sm">Privacy Policy</Link>
            <Link href="/terms" className="link link-hover text-sm">Terms of Service</Link>
          </div>
          <p className="text-sm opacity-70 mt-4">&copy; 2025 GroomRoute. All rights reserved.</p>
        </aside>
      </footer>
    </main>
  );
}
