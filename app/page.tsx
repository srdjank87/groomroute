"use client";

import Link from "next/link";
import Image from "next/image";
import { MapPin, Zap, MessageSquare, XCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const GroomRoute = () => (
  <span>GroomRoute</span>
);

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

export default function Home() {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <main>
      {/* HEADER */}
      <header className="border-b border-base-300 bg-base-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
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
            <Link href="#features" className="link link-hover">
              Features
            </Link>
            <Link href="#before-after" className="link link-hover">
              Before/After
            </Link>
            <Link href="#testimonials" className="link link-hover">
              Testimonials
            </Link>
            <Link href="#pricing" className="link link-hover">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth/signin" className="btn btn-ghost btn-sm">
              Sign In
            </Link>

            <Link
              href="/auth/signup?plan=growth&billing=monthly"
              className="btn btn-gradient btn-sm hidden sm:inline-flex items-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/signup?plan=growth&billing=monthly"
              className="btn btn-gradient btn-sm sm:hidden inline-flex items-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO - Image above text on all screen sizes */}
      <section className="hero bg-base-200 py-4 lg:py-4">
        <div className="hero-content max-w-6xl w-full">
          <div className="text-center w-full">
            {/* Hero image - shown above headline on all screens */}
            <div className="flex justify-center mb-3 lg:mb-4">
              <Image
                src="/images/hero.jpg"
                alt="GroomRoute app showing optimized route with 54 minutes saved in mobile grooming van"
                width={1200}
                height={675}
                className="rounded-lg w-full max-w-2xl lg:max-w-3xl shadow-2xl"
                priority
              />
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold mb-3">
              Stop driving yourself to exhaustion.
            </h1>

            <p className="text-lg lg:text-xl mb-4 lg:mb-3 leading-relaxed max-w-3xl mx-auto">
              The first mobile grooming app that understands your workload isn&apos;t just about time - it&apos;s about protecting your body, sanity, and income.
            </p>

            {/* CTAs - Above bullets on mobile, below on desktop */}
            <div className="lg:hidden flex flex-col gap-3 mb-4">
              <Link href="/auth/signup?plan=growth&billing=monthly" className="btn btn-gradient btn-lg">
                Start Free Trial
              </Link>
              <Link href="/book-demo" className="btn btn-outline btn-lg border-2 border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white">
                Book a Demo
              </Link>
            </div>

            <div className="max-w-2xl mx-auto mb-4 lg:mb-4 space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#A5744A] flex-shrink-0 mt-0.5" />
                <p className="text-base lg:text-lg text-left">Save 45-90 min/day with smart routing that respects your energy</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#A5744A] flex-shrink-0 mt-0.5" />
                <p className="text-base lg:text-lg text-left">Auto-notify customers when life happens - no panic texting</p>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-5 w-5 text-[#A5744A] flex-shrink-0 mt-0.5" />
                <p className="text-base lg:text-lg text-left">Protect your body with workload intelligence (chihuahua days ≠ doodle days)</p>
              </div>
            </div>

            {/* CTAs - Below bullets on desktop */}
            <div className="hidden lg:flex flex-col sm:flex-row gap-3 justify-center mb-3">
              <Link href="/auth/signup?plan=growth&billing=monthly" className="btn btn-gradient btn-lg">
                Start Free Trial
              </Link>
              <Link href="/book-demo" className="btn btn-outline btn-lg border-2 border-[#A5744A] text-[#A5744A] hover:bg-[#A5744A] hover:text-white">
                Book a Demo
              </Link>
            </div>
            <p className="text-sm opacity-70 hidden lg:block">14-day free trial • Cancel anytime • Built by groomers who get it</p>
          </div>
        </div>
      </section>

      {/* IDENTITY PROOF - Built for Groomers */}
      <section className="py-12 px-6 bg-gradient-to-br from-amber-50 to-orange-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold mb-4">
              Finally: Software that doesn&apos;t treat you like a &quot;dog washer&quot;
            </h2>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              GroomRoute was built after 200+ hours of research with professional mobile groomers. We studied your daily struggles, learned what corporate shops get wrong, and built something that actually respects the skill and physical demands of your work.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">🐩</div>
              <h3 className="text-xl font-bold mb-3 text-center">Understands Doodles</h3>
              <p className="text-base text-gray-700 text-center">
                We know a 75-pound doodle isn&apos;t the same as a 75-pound lab. Workload intelligence that gets it.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">💪</div>
              <h3 className="text-xl font-bold mb-3 text-center">Protects Your Body</h3>
              <p className="text-base text-gray-700 text-center">
                Prevents back-to-back heavy dogs that wreck your back and energy. This is a career, not a burnout job.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">🤝</div>
              <h3 className="text-xl font-bold mb-3 text-center">Built With You</h3>
              <p className="text-base text-gray-700 text-center">
                Designed by studying real groomers&apos; daily struggles - not corporate templates or generic SaaS.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ONE-TAP PHILOSOPHY */}
      <section className="py-8 lg:py-12 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            Built for life in a grooming van - not an office.
          </h2>
          <p className="text-center text-lg opacity-70 mb-16 max-w-2xl mx-auto">
            You work in noise, motion, and time pressure. GroomRoute is the fast, calm control center you need.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-300">
                  <MapPin className="w-8 h-8 text-base-content" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap to plan your day</h3>
              <p className="text-base opacity-80">Optimize your entire route instantly.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-300">
                  <Zap className="w-8 h-8 text-base-content" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap when things go wrong</h3>
              <p className="text-base opacity-80">Running late? GroomRoute updates everyone automatically.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 rounded-full flex items-center justify-center bg-base-300">
                  <MessageSquare className="w-8 h-8 text-base-content" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap to stay in control</h3>
              <p className="text-base opacity-80">Start navigation, skip stops, rebuild schedules - instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section id="before-after" className="py-8 lg:py-12 px-3 lg:px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6 lg:gap-12">
            {/* BEFORE */}
            <div className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-4 lg:p-8">
              <h3 className="text-2xl font-bold mb-4 lg:mb-6 text-center">Before GroomRoute</h3>

              <div className="mb-4 lg:mb-6">
                <Image
                  src="/images/before.jpg"
                  alt="Before GroomRoute - Exhausted mobile groomer sitting in van surrounded by chaos"
                  width={400}
                  height={400}
                  className="rounded-xl w-full"
                />
              </div>

              <p className="text-base lg:text-lg font-semibold text-gray-800 text-center mb-3 lg:mb-4 italic">
                The day doesn&apos;t feel like it&apos;s yours anymore.
              </p>

              <div className="space-y-2 lg:space-y-3">
                <div className="bg-red-100/60 rounded-2xl p-3 lg:p-4 border border-red-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" />
                    <span>Too many big dogs back-to-back</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-3 lg:p-4 border border-red-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" />
                    <span>Too much driving, burning time and fuel</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-3 lg:p-4 border border-red-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" />
                    <span>No-shows hit your income and your confidence</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-3 lg:p-4 border border-red-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <XCircle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 flex-shrink-0" />
                    <span>By the end of the day, your body aches… and your brain is exhausted</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 lg:mt-6 text-center">
                <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">Result:</p>
                <p className="text-base lg:text-lg font-bold text-red-700">Work that doesn&apos;t feel sustainable anymore.</p>
              </div>
            </div>

            {/* AFTER */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 lg:p-8">
              <h3 className="text-2xl font-bold mb-4 lg:mb-6 text-center">With GroomRoute</h3>

              <div className="mb-4 lg:mb-6">
                <Image
                  src="/images/after.jpg"
                  alt="With GroomRoute - Confident mobile groomer standing in organized van with tablet"
                  width={400}
                  height={400}
                  className="rounded-xl w-full"
                />
              </div>

              <p className="text-base lg:text-lg font-semibold text-gray-800 text-center mb-3 lg:mb-4 italic">
                Your day finally makes sense again.
              </p>

              <div className="space-y-2 lg:space-y-3">
                <div className="bg-emerald-100/60 rounded-2xl p-3 lg:p-4 border border-emerald-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                    <span>Balanced schedules that protect your body</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-3 lg:p-4 border border-emerald-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                    <span>Routes that are tight, efficient, and stress-free</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-3 lg:p-4 border border-emerald-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                    <span>Automatic cancellation recovery when plans change</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-3 lg:p-4 border border-emerald-200">
                  <p className="text-sm lg:text-base text-gray-700 flex items-center gap-2 lg:gap-3">
                    <CheckCircle2 className="w-4 h-4 lg:w-5 lg:h-5 text-emerald-600 flex-shrink-0" />
                    <span>Customers always informed - without you juggling messages</span>
                  </p>
                </div>
              </div>

              <div className="mt-4 lg:mt-6 text-center">
                <p className="text-xs lg:text-sm font-semibold text-gray-600 mb-1">Result:</p>
                <p className="text-base lg:text-lg font-bold text-emerald-700">Calmer days. Stronger income.<br />Work that finally feels sustainable.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - ONE TAP LIFESAVERS */}
      <section className="py-8 lg:py-12 px-6 bg-base-100" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              The one-tap features that save your sanity
            </h2>
          </div>

          <div className="space-y-12">
            {/* Feature 1 - Image Left */}
            <div className="card bg-gradient-to-br from-orange-50 to-amber-100 border-2 border-[#A5744A]/30 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="lg:w-1/3">
                    <Image
                      src="/images/onetap-route.jpg"
                      alt="Professional groomer using GroomRoute app outside organized van with Golden Retriever"
                      width={400}
                      height={400}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">
                      One-Tap Optimized Routes - Turn Chaos Into a Calm, Profitable Day
                    </h3>
                    <p className="text-lg opacity-90">
                      GroomRoute doesn&apos;t just reorder stops - it builds real-world plans that match how groomers actually work. Save <strong>45-90 minutes a day</strong>, reduce mileage, and stop zig-zag driving all over town. Supports dedicated <strong>&quot;area days,&quot;</strong> so you can stay local, work efficiently, and finish your day with energy left.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 2 - Image Right */}
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row-reverse gap-6 items-center">
                  <div className="lg:w-1/3">
                    <Image
                      src="/images/onetap-runninglate.jpg"
                      alt="Groomer using phone inside mobile grooming van while working with Golden Retriever"
                      width={400}
                      height={400}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">
                      One Tap: &quot;Running Late&quot; - Clients Instantly Know. You Stay Stress-Free.
                    </h3>
                    <p className="text-lg opacity-90">
                      Running behind shouldn&apos;t mean panic texting and feeling unprofessional.<br />
                      With GroomRoute, your clients get an <strong>instant, kind, professional update</strong> - without you stopping to type. You stay focused on the dog in front of you, while your business continues to look polished and reliable.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 3 - Image Left */}
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="lg:w-1/3">
                    <Image
                      src="/images/onetap-startdriving.jpg"
                      alt="Groomer viewing today's route on GroomRoute app in driver's seat with Golden Retriever"
                      width={400}
                      height={400}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">
                      One Tap: &quot;Start Driving&quot; - Navigation Loads. You Go. Done.
                    </h3>
                    <p className="text-lg opacity-90">
                      No copying addresses. No juggling screenshots. No confusion.<br />
                      Tap once and your <strong>entire route instantly loads</strong> into Google Maps or Apple Maps so you can just drive - confidently and efficiently.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* NEW Feature - Workload Intelligence - Image Right */}
            <div className="card bg-gradient-to-br from-amber-50 to-yellow-100 border-2 border-amber-300 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row-reverse gap-6 items-center">
                  <div className="lg:w-1/3">
                    <Image
                      src="/images/onetap-dogsize.jpg"
                      alt="Groomer working with large doodle on grooming table with pile of brushed fur"
                      width={400}
                      height={400}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">
                      Understands Dog Size, Workload & Your Physical Capacity
                    </h3>
                    <p className="text-lg opacity-90 mb-4">
                      Big dogs take more time. Doodles are their own universe. Some days you have help - some days you don&apos;t. GroomRoute actually understands that and helps you plan <strong>sustainable days</strong> that protect your body, your brain, and your love for grooming.
                    </p>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Set comfort limits (max big dogs/day)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Auto-flag exhausting &quot;danger days&quot;</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Adjust workload instantly if an assistant is helping</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature 5 - Image Left (alternating pattern) */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-xl">
              <div className="card-body">
                <div className="flex flex-col lg:flex-row gap-6 items-center">
                  <div className="lg:w-1/3">
                    <Image
                      src="/images/onetap-cancellations.jpg"
                      alt="Mobile grooming van interior with whiteboard showing cancellation rebooked"
                      width={400}
                      height={400}
                      className="rounded-lg w-full"
                    />
                  </div>
                  <div className="lg:w-2/3">
                    <h3 className="text-2xl font-bold mb-3">
                      Cancellations Happen. GroomRoute Turns Them Into Income.
                    </h3>
                    <p className="text-lg opacity-90">
                      Last-minute cancellations used to mean stress and lost money. GroomRoute automatically fills gaps with waitlist clients nearby, helping you recover <strong>$200-$400/month</strong> you&apos;d normally lose - without lifting a finger.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <section className="py-8 lg:py-12 px-6 bg-base-200">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">45-90 mins/day</div>
              <p className="text-sm opacity-80">Time saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$200-$400/month</div>
              <p className="text-sm opacity-80">Revenue recovered</p>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">80% reduction</div>
              <p className="text-sm opacity-80">In stress calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* CALM CONTROL - CRISIS MANAGEMENT */}
      <section className="py-8 lg:py-12 px-6 bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-6">
              Meet Calm Control - Your Safety Net for When Grooming Life Gets Messy
            </h2>

            {/* Calm Control Image */}
            <div className="flex justify-center mb-8">
              <Image
                src="/images/calmcontrol.jpg"
                alt="Wide view of organized mobile grooming van interior with professional groomer and small dog"
                width={1200}
                height={675}
                className="rounded-xl w-full max-w-4xl shadow-2xl"
              />
            </div>

            <p className="text-xl max-w-4xl mx-auto leading-relaxed opacity-90">
              When your day collapses, a client cancels, traffic wrecks your schedule, or you suddenly realize you booked a nightmare lineup… GroomRoute doesn&apos;t just react - <strong>it thinks with you</strong>.
            </p>
            <p className="text-lg max-w-4xl mx-auto leading-relaxed opacity-90 mt-4">
              Calm Control helps you stabilize your day with smart rescue plans, clear decisions, and confidence - so you stay calm, professional, and in control.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Rescue My Day */}
            <div className="card bg-white border-2 border-blue-200 shadow-xl">
              <div className="card-body">
                <div className="text-5xl mb-4 text-center">🛟</div>
                <h3 className="card-title text-2xl mb-3 justify-center">
                  Rescue My Day
                </h3>
                <p className="text-base opacity-90 text-center">
                  Behind schedule? Traffic disaster? Two giant doodles back-to-back?
                </p>
                <p className="text-base font-medium mt-2 text-center">
                  GroomRoute gives you 2-3 smart rescue plans with new routes, messaging handled, and your sanity intact.
                </p>
              </div>
            </div>

            {/* Body & Burnout Protection */}
            <div className="card bg-white border-2 border-blue-200 shadow-xl">
              <div className="card-body">
                <div className="text-5xl mb-4 text-center">💪</div>
                <h3 className="card-title text-2xl mb-3 justify-center">
                  Body & Burnout Protection
                </h3>
                <p className="text-base opacity-90 text-center">
                  Grooming is physically demanding. GroomRoute watches your workload patterns, warns when you&apos;ve built a &quot;danger day,&quot; and helps protect you from burnout.
                </p>
              </div>
            </div>

            {/* Offline Safety Snapshot */}
            <div className="card bg-white border-2 border-blue-200 shadow-xl">
              <div className="card-body">
                <div className="text-5xl mb-4 text-center">🚧</div>
                <h3 className="card-title text-2xl mb-3 justify-center">
                  Offline Safety Snapshot
                </h3>
                <p className="text-base opacity-90 text-center">
                  Lose signal? Phone meltdown? GroomRoute stores your day offline so you can keep working without panic.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - EMOTIONAL */}
      <section id="testimonials" className="py-8 lg:py-12 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Calmer days. Real results.
            </h2>
          </div>

          {/* Video Testimonials Placeholder */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="aspect-video bg-base-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">▶</div>
                <p className="text-sm opacity-70">Video Testimonial 1</p>
              </div>
            </div>
            <div className="aspect-video bg-base-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">▶</div>
                <p className="text-sm opacity-70">Video Testimonial 2</p>
              </div>
            </div>
            <div className="aspect-video bg-base-300 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-2">▶</div>
                <p className="text-sm opacity-70">Video Testimonial 3</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &quot;I don&apos;t stress about being behind anymore.&quot;
                </p>
                <div className="divider my-2"></div>
                <div>
                  <div className="font-bold">Sarah</div>
                  <div className="text-sm opacity-70">Mobile Groomer, 2 vans</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &quot;I finish the day feeling in control.&quot;
                </p>
                <div className="divider my-2"></div>
                <div>
                  <div className="font-bold">Mike T.</div>
                  <div className="text-sm opacity-70">Denver, CO</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &quot;This is the first software built like we actually work.&quot;
                </p>
                <div className="divider my-2"></div>
                <div>
                  <div className="font-bold">Jessica P.</div>
                  <div className="text-sm opacity-70">Portland, OR</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &quot;My whole day changed. Less chaos, more money.&quot;
                </p>
                <div className="divider my-2"></div>
                <div>
                  <div className="font-bold">Carlos R.</div>
                  <div className="text-sm opacity-70">Miami, FL</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="py-8 lg:py-12 px-6 bg-base-200" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-5xl font-bold mb-4">
              Choose your calm
            </h2>

            {/* ROI Value Prop */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6 max-w-3xl mx-auto mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Your ROI in 30 seconds
              </h3>
              <div className="text-left space-y-2 text-gray-700">
                <p className="flex justify-between">
                  <span>⏱️ Time saved per day:</span>
                  <strong>60 minutes</strong>
                </p>
                <p className="flex justify-between">
                  <span>📅 Working days per month:</span>
                  <strong>20 days</strong>
                </p>
                <p className="flex justify-between">
                  <span>💰 Your hourly rate:</span>
                  <strong>$75/hour</strong>
                </p>
                <div className="border-t-2 border-green-300 my-3"></div>
                <p className="flex justify-between text-lg">
                  <span>Monthly value from time saved:</span>
                  <strong className="text-green-600">$1,500</strong>
                </p>
                <p className="flex justify-between text-lg">
                  <span>GroomRoute Growth plan:</span>
                  <strong>$179/month</strong>
                </p>
                <div className="border-t-2 border-green-300 my-3"></div>
                <p className="flex justify-between text-2xl font-bold">
                  <span>Your net gain:</span>
                  <strong className="text-green-700">$1,321/month</strong>
                </p>
                <p className="text-center text-sm text-gray-600 mt-3">
                  That&apos;s an <strong>8.4x return</strong> on your investment - and we haven&apos;t even counted gap-fill revenue recovery yet.
                </p>
              </div>
            </div>

            {/* Pricing Toggle */}
            <div className="justify-center items-center gap-4 mt-8 p-4 border-2 border-base-300 rounded-lg bg-base-100 inline-flex mx-auto">
              <span className={`text-lg font-medium ${!isYearly ? 'text-primary' : 'opacity-60'}`}>Monthly</span>
              <input
                type="checkbox"
                className="toggle toggle-primary border-2 border-base-300"
                checked={isYearly}
                onChange={() => setIsYearly(!isYearly)}
              />
              <span className={`text-lg font-medium ${isYearly ? 'text-primary' : 'opacity-60'}`}>
                Yearly <span className="badge badge-success badge-sm ml-1">Save up to 20%</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">STARTER</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '890' : '89'}</span>
                  <span className="text-sm opacity-70">/{isYearly ? 'year' : 'month'}</span>
                </div>
                {isYearly && <div className="text-xs opacity-70 -mt-3 mb-2">$74/month billed annually (save ~17%)</div>}

                <p className="text-sm mb-4 italic opacity-80">
                  Solo groomer getting started
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "One-tap route optimization",
                    "One-tap navigation",
                    "Up to 50 customers",
                    "100 appointments/month",
                    "SMS messaging (shared number)",
                    "Calm Inbox",
                    "Basic analytics",
                    "Email support",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-success size-5 flex-shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href={`/auth/signup?plan=starter&billing=${isYearly ? 'yearly' : 'monthly'}`} className="btn btn-outline btn-block border-2">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>

            {/* Growth - POPULAR */}
            <div className="card shadow-2xl border-4 transform scale-105" style={{ backgroundColor: '#3b82f6', color: 'white', borderColor: '#3b82f6' }}>
              <div className="card-body">
                <div className="badge badge-secondary mb-2">MOST POPULAR</div>
                <div className="badge badge-neutral mb-2 text-neutral-content">GROWTH</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '1,790' : '179'}</span>
                  <span className="text-sm opacity-90">/{isYearly ? 'year' : 'month'}</span>
                </div>
                {isYearly && <div className="text-xs opacity-90 -mt-3 mb-2">$149/month billed annually (save ~17%)</div>}

                <p className="text-sm mb-4 italic opacity-90">
                  Professional groomer scaling up
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "Everything in Starter, PLUS:",
                    "Unlimited customers & appointments",
                    "Dedicated business SMS number",
                    "Running Late automation",
                    "Workload intelligence",
                    "Cancellation gap fill ($200-$400/mo)",
                    "Calm Control Center",
                    "Message templates",
                    "End-of-day analytics",
                    "Priority support",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-5 flex-shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href={`/auth/signup?plan=growth&billing=${isYearly ? 'yearly' : 'monthly'}`} className="btn btn-secondary btn-block text-secondary-content">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>

            {/* Pro */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">PRO</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">${isYearly ? '3,290' : '329'}</span>
                  <span className="text-sm opacity-70">/{isYearly ? 'year' : 'month'}</span>
                </div>
                {isYearly && <div className="text-xs opacity-70 -mt-3 mb-2">$274/month billed annually (save ~17%)</div>}

                <p className="text-sm mb-4 italic opacity-80">
                  Multi-van operation
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "Everything in Growth, PLUS:",
                    "Multi-groomer/multi-van support",
                    "Team calendar view",
                    "Per-groomer analytics",
                    "Equipment & van issue logging",
                    "Phone support",
                    "Dedicated account manager",
                  ].map((item) => (
                    <li className="flex gap-2 items-start" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-success size-5 flex-shrink-0 mt-0.5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href={`/auth/signup?plan=pro&billing=${isYearly ? 'yearly' : 'monthly'}`} className="btn btn-outline btn-block border-2">
                    Start Free Trial
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="alert alert-info mt-12 max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>Every plan includes a 14-day free trial. Cancel anytime before it ends.</span>
          </div>
        </div>
      </section>

      {/* MONEY-BACK GUARANTEE */}
      <section className="py-8 lg:py-12 px-6 bg-gradient-to-br from-emerald-50 to-green-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white border-4 border-green-500 rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-xl mb-4 text-gray-700">
              If GroomRoute doesn&apos;t save you at least <strong>30 minutes in your first week</strong>, email us and we&apos;ll refund 100%.
            </p>
            <p className="text-base text-gray-600">
              No questions asked. No hoops to jump through. We&apos;re that confident you&apos;ll love the calm control it brings to your day.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="py-8 lg:py-12 px-6 bg-base-100">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">
            Common Questions
          </h2>

          <div className="space-y-4">
            {/* FAQ 1 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Do I need a credit card to start my trial?
              </div>
              <div className="collapse-content">
                <p>Yes - this helps keep trials focused on real grooming businesses. You won&apos;t be charged during your trial and can cancel anytime before it ends.</p>
              </div>
            </div>

            {/* FAQ 2 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Will I be charged immediately?
              </div>
              <div className="collapse-content">
                <p>No. Your entire 14-day trial is completely free. You&apos;ll only be charged after your trial ends if you choose to continue.</p>
              </div>
            </div>

            {/* FAQ 3 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I cancel anytime?
              </div>
              <div className="collapse-content">
                <p>Yes - instantly, without awkwardness. No contracts, no commitments. If GroomRoute isn&apos;t making your days calmer and more profitable, you shouldn&apos;t pay for it.</p>
              </div>
            </div>

            {/* FAQ 4 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                What happens after my trial ends?
              </div>
              <div className="collapse-content">
                <p>After 14 days, you&apos;ll be charged for the plan you selected during signup. You can cancel before then or change your plan at any time from your account settings.</p>
              </div>
            </div>

            {/* FAQ 5 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Does GroomRoute work offline?
              </div>
              <div className="collapse-content">
                <p>Yes! GroomRoute stores your day offline so you can access your schedule, client details, and route even when you lose signal or have connectivity issues.</p>
              </div>
            </div>

            {/* FAQ 6 */}
            <div className="collapse collapse-plus bg-base-200">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Can I switch plans later?
              </div>
              <div className="collapse-content">
                <p>Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we&apos;ll prorate the billing accordingly.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OUR PROMISE */}
      <section className="py-8 lg:py-12 px-6 bg-base-100">
        <div className="max-w-3xl mx-auto">
          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-3xl mb-4 justify-center">
                Our Promise
              </h2>
              <p className="text-lg mb-4 leading-relaxed">
                We don&apos;t just promise efficiency - we promise calmer days, smarter decisions, stronger income, and a work life that feels sustainable again.
              </p>
              <p className="text-xl font-bold mb-2 text-base-content">
                If GroomRoute doesn&apos;t deliver on that promise…
              </p>
              <p className="text-2xl font-bold mb-4 text-base-content">
                you shouldn&apos;t pay for it.
              </p>
              <p className="text-sm opacity-80">
                No contracts. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA WITH IMAGE */}
      <section className="py-8 lg:py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-center">
            <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl max-w-5xl w-full overflow-hidden">
              {/* Hero Image - inside card, above content */}
              <figure>
                <Image
                  src="/images/final-cta.jpg"
                  alt="Happy mobile groomer with Golden Retriever outside grooming van - your future with GroomRoute"
                  width={1200}
                  height={675}
                  className="w-full"
                />
              </figure>

              <div className="card-body items-center text-center">
                <h2 className="card-title text-4xl mb-4">
                  Ready for calmer, more profitable days?
                </h2>
                <p className="text-lg mb-6">
                  One tap. Less stress. Better routes. Protected revenue. Stronger business.
                </p>
                <div className="card-actions">
                  <Link href="/auth/signup?plan=growth&billing=monthly" className="btn btn-gradient btn-lg">
                    Start Free Trial
                  </Link>
                </div>
                <p className="text-sm opacity-70 mt-4">14-day free trial. Cancel anytime. No commitment stress. Card required.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer footer-center p-10 bg-base-300 text-base-content">
        <aside>
          <div className="font-bold text-xl mb-2"><GroomRouteLogo /></div>
          <p className="max-w-md">The fastest, simplest control center for mobile groomers.</p>
          <p className="max-w-md">One tap. Your routes are optimized, customers informed, and your day stays calm.</p>
          <p className="text-sm opacity-70 mt-4">© 2025 GroomRoute. All rights reserved.</p>
        </aside>
      </footer>
    </main>
  );
}
