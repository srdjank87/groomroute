import Link from "next/link";
import Image from "next/image";
import { MapPin, Zap, MessageSquare, XCircle, CheckCircle2 } from "lucide-react";

const GroomRoute = () => (
  <span>GroomRoute</span>
);

const GroomRouteLogo = () => (
  <span>Groom<span className="text-primary">Route</span></span>
);

export default function Home() {
  return (
    <main>
      {/* HEADER */}
      <header className="border-b border-base-300 bg-base-100">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="font-bold text-lg">
                <GroomRouteLogo />
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="link link-hover">
              Features
            </Link>
            <Link href="#pricing" className="link link-hover">
              Pricing
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link href="/auth/login" className="btn btn-ghost btn-sm">
              Sign In
            </Link>

            <Link
              href="/auth/signup"
              className="btn btn-gradient btn-sm hidden sm:inline-flex items-center"
            >
              Start Free Trial
            </Link>
            <Link
              href="/auth/signup"
              className="btn btn-gradient btn-sm sm:hidden inline-flex items-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero bg-base-200 py-20">
        <div className="hero-content max-w-6xl w-full">
          <div className="text-center w-full">
            <div className="flex justify-center mb-10">
              <Image
                src="/images/hero-groomroute.png"
                alt="GroomRoute - Mobile grooming route optimization"
                width={1000}
                height={1000}
                className="rounded-lg w-full max-w-4xl"
                priority
              />
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              Run your grooming day with one tap.
            </h1>
            <p className="text-sm font-semibold text-primary mb-8">Save up to 90 minutes per day without changing your routine</p>
            <p className="text-xl mb-8 leading-relaxed max-w-2xl mx-auto">
              Optimize your route, keep customers informed, and stay calm — even when things change.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-4">
              <Link href="/auth/signup" className="btn btn-gradient btn-lg">
                Start Free Trial
              </Link>
            </div>
            <p className="text-sm opacity-70">No credit card • Setup in minutes • Works on your phone</p>
          </div>
        </div>
      </section>

      {/* ONE-TAP PHILOSOPHY */}
      <section className="py-24 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center">
            Built for life in a grooming van — not an office.
          </h2>
          <p className="text-center text-lg opacity-70 mb-16 max-w-2xl mx-auto">
            You work in noise, motion, and time pressure. GroomRoute is the fast, calm control center you need.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap to plan your day</h3>
              <p className="text-base opacity-80">Optimize your entire route instantly.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap when things go wrong</h3>
              <p className="text-base opacity-80">Running late? GroomRoute updates everyone automatically.</p>
            </div>

            <div className="text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">One tap to stay in control</h3>
              <p className="text-base opacity-80">Start navigation, skip stops, rebuild schedules — instantly.</p>
            </div>
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12">
            {/* BEFORE */}
            <div className="rounded-3xl border-2 border-red-200 bg-gradient-to-br from-red-50 to-pink-50 p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">Before GroomRoute</h3>

              <div className="mb-6">
                <Image
                  src="/images/groom-before.jpg"
                  alt="Before GroomRoute - Stressed mobile groomer"
                  width={400}
                  height={300}
                  className="rounded-xl w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="bg-red-100/60 rounded-2xl p-4 border border-red-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Constantly behind schedule</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-4 border border-red-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Guessing arrival times</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-4 border border-red-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Customers asking &ldquo;Where are you?&rdquo;</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-4 border border-red-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Routes that don&rsquo;t make sense</span>
                  </p>
                </div>

                <div className="bg-red-100/60 rounded-2xl p-4 border border-red-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <XCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span>Cancellations hurt your income</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-gray-600">Result: ending the day exhausted</p>
              </div>
            </div>

            {/* AFTER */}
            <div className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
              <h3 className="text-2xl font-bold mb-6 text-center">With GroomRoute</h3>

              <div className="mb-6">
                <Image
                  src="/images/groom-after.jpg"
                  alt="With GroomRoute - Happy mobile groomer"
                  width={400}
                  height={300}
                  className="rounded-xl w-full"
                />
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-100/60 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Calm, predictable days</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Clear ETAs for every stop</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Customers always in the loop</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>Smart routes that just work</span>
                  </p>
                </div>

                <div className="bg-emerald-100/60 rounded-2xl p-4 border border-emerald-200">
                  <p className="text-base text-gray-700 text-center flex items-center justify-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    <span>More filled appointments, more income</span>
                  </p>
                </div>
              </div>

              <div className="mt-6 flex items-center gap-2 justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-gray-600">Result: ending the day proud and in control</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES - ONE TAP LIFESAVERS */}
      <section className="py-24 px-6 bg-base-100" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              The one-tap features that save your sanity
            </h2>
          </div>

          <div className="space-y-12">
            {/* Feature 1 */}
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-3">
                  One tap: &ldquo;Optimize Route&rdquo; → Your day makes sense.
                </h3>
                <p className="text-lg opacity-90">
                  No manual planning. No guessing. GroomRoute reorders your stops by location — saving you 45-90 minutes every single day.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-3">
                  One tap: &ldquo;Running Late&rdquo; → Everyone instantly knows.
                </h3>
                <p className="text-lg opacity-90">
                  No typing. No juggling messages. GroomRoute recalculates and informs customers for you — so you can keep working.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-3">
                  One tap: &ldquo;Start Driving&rdquo; → Navigation opens instantly.
                </h3>
                <p className="text-lg opacity-90">
                  No copying addresses. No app switching. Your entire route loads in Google Maps or Apple Maps — ready to go.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-xl">
              <div className="card-body">
                <h3 className="text-2xl font-bold mb-3">
                  One tap: Fill cancellation gaps automatically.
                </h3>
                <p className="text-lg opacity-90">
                  Last-minute cancellation? GroomRoute finds nearby customers on your waitlist and offers them the slot. Recover $200-400/month you&apos;d otherwise lose.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROOF BAR */}
      <section className="py-12 px-6 bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">45–90 mins/day</div>
              <p className="text-sm opacity-80">Time saved</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$200–$400/month</div>
              <p className="text-sm opacity-80">Revenue recovered</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">80% reduction</div>
              <p className="text-sm opacity-80">In stress calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS - EMOTIONAL */}
      <section className="py-24 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold mb-4">
              Calmer days. Real results.
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &ldquo;I don&apos;t stress about being behind anymore.&rdquo;
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
                  &ldquo;I finish the day feeling in control.&rdquo;
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
                  &ldquo;This is the first software built like we actually work.&rdquo;
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
                  &ldquo;My whole day changed. Less chaos, more money.&rdquo;
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
      <section className="py-24 px-6 bg-base-200" id="pricing">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary badge-lg mb-4">PRICING</div>
            <h2 className="text-5xl font-bold mb-4">
              Choose your calm
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">STARTER</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>

                <p className="text-sm mb-4 italic opacity-80">
                  Make your day make sense
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "One-click route optimization",
                    "Accurate ETAs for every stop",
                    "Address validation",
                    "Basic SMS confirmations",
                    "Safety flags",
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
                  <Link href="/auth/signup" className="btn btn-outline btn-block border-2">
                    Start my calm day
                  </Link>
                </div>
                <div className="text-sm text-center opacity-70 mt-2">or $950/year</div>
              </div>
            </div>

            {/* Growth - POPULAR */}
            <div className="card bg-primary text-primary-content shadow-2xl border-4 border-primary transform scale-105">
              <div className="card-body">
                <div className="badge badge-secondary mb-2">MOST POPULAR</div>
                <div className="badge badge-neutral mb-2 text-neutral-content">GROWTH</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$179</span>
                  <span className="text-sm opacity-90">/month</span>
                </div>

                <p className="text-sm mb-4 italic opacity-90">
                  Automation + calm days
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "Everything in Starter",
                    "One-tap \"Running Late\" updates",
                    "Automatic ETA recalculation",
                    "Communication automation",
                    "Calm control center",
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
                  <Link href="/auth/signup" className="btn btn-secondary btn-block text-secondary-content">
                    Make my day easier
                  </Link>
                </div>
                <div className="text-sm text-center opacity-90 mt-2">or $1,700/year</div>
              </div>
            </div>

            {/* Pro */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">PRO</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$279</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>

                <p className="text-sm mb-4 italic opacity-80">
                  Maximize utilization without stress
                </p>

                <ul className="space-y-2 mb-6">
                  {[
                    "Everything in Growth",
                    "Gap-fill automation",
                    "Waitlist management",
                    "Rebooking automation",
                    "Multi-groomer support",
                    "Advanced analytics",
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
                  <Link href="/auth/signup" className="btn btn-outline btn-block border-2">
                    Show me my better route
                  </Link>
                </div>
                <div className="text-sm text-center opacity-70 mt-2">or $2,650/year</div>
              </div>
            </div>
          </div>

          <div className="alert alert-info mt-12 max-w-2xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span>All plans include a 14-day free trial. No credit card required.</span>
          </div>
        </div>
      </section>

      {/* OUR PROMISE */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-3xl mx-auto">
          <div className="card bg-gradient-to-br from-success/10 to-success/5 border-2 border-success/20 shadow-xl">
            <div className="card-body text-center">
              <h2 className="card-title text-3xl mb-4 justify-center">
                Our Promise
              </h2>
              <p className="text-lg mb-2">
                If GroomRoute doesn&apos;t make your days calmer and more profitable within the first few weeks…
              </p>
              <p className="text-2xl font-bold text-primary mb-4">
                you shouldn&apos;t pay for it.
              </p>
              <p className="text-sm opacity-80">
                No contracts. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-2xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-4xl mb-4">
                Ready for calmer, more profitable days?
              </h2>
              <p className="text-lg mb-6">
                One tap. Your whole day changes.
              </p>
              <div className="card-actions">
                <Link href="/auth/signup" className="btn btn-gradient btn-lg">
                  Start Free Trial
                </Link>
              </div>
              <p className="text-sm opacity-70 mt-4">No credit card required. Cancel anytime.</p>
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
