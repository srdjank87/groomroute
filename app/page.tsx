import Link from "next/link";
import { XCircle, CheckCircle2 } from "lucide-react";

const GroomRoute = () => (
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
                Groom<span className="text-primary">Route</span>
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm">
            <Link href="#features" className="link link-hover">
              Features
            </Link>
            <Link href="#how-it-works" className="link link-hover">
              How it works
            </Link>
            <Link href="#pricing" className="link link-hover">
              Pricing
            </Link>
            <Link href="#testimonials" className="link link-hover">
              Testimonials
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
      <section className="hero bg-base-200 py-16">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Turn chaotic grooming days into calm, optimized routes.
            </h1>
            <p className="text-lg mb-8">
              Save 45–90 minutes per day with one-click routing, automatic ETA updates, and fewer &ldquo;where are you?&rdquo; calls.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="btn btn-gradient btn-lg">
                Start Your Free 14-Day Trial
              </Link>
              <Link href="#how-it-works" className="btn btn-outline btn-lg border-2">
                Watch How It Works (2 min)
              </Link>
            </div>
            <p className="mt-4 text-sm opacity-70">No credit card • Works on phone • Setup in minutes</p>
            <p className="mt-3 text-sm font-medium">Already helping mobile groomers save 30–90 minutes every day.</p>
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-8 text-center">
            This is the part of mobile grooming no one warns you about
          </h2>

          <div className="max-w-4xl mx-auto mb-12">
            <p className="text-xl italic mb-4">I love grooming dogs.</p>
            <p className="text-xl mb-4">
              I don&apos;t love zig-zagging across town, apologizing for being late, or realizing I lost an entire hour to driving.
            </p>
            <p className="text-lg mb-6">
              If you&apos;re a mobile groomer, you know the real problems aren&apos;t grooming — they&apos;re everything <span className="italic font-semibold">between</span> appointments:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-base-200 rounded-xl p-6 border border-base-300">
              <p className="font-semibold text-lg mb-3">You book a &ldquo;full day&rdquo;… but it&apos;s spread all over town</p>
              <p className="opacity-80">One client&apos;s in the north suburbs. The next is downtown. The third is back where you started.</p>
            </div>

            <div className="bg-base-200 rounded-xl p-6 border border-base-300">
              <p className="font-semibold text-lg mb-3">One late stop throws off the rest of the schedule</p>
              <p className="opacity-80">Then you&apos;re playing phone tag all afternoon: &ldquo;I&apos;m running 20 minutes late… make that 30…&rdquo;</p>
            </div>

            <div className="bg-base-200 rounded-xl p-6 border border-base-300">
              <p className="font-semibold text-lg mb-3">Cancellations leave dead gaps you can&apos;t easily fill</p>
              <p className="opacity-80">Mrs. Johnson cancels at 10am for her 2pm slot. You just lost $85 and have a 2-hour hole in your day.</p>
            </div>

            <div className="bg-base-200 rounded-xl p-6 border border-base-300">
              <p className="font-semibold text-lg mb-3">And worst of all? Your customers think you&apos;re disorganized.</p>
              <p className="opacity-80">Even though you&apos;re an incredible groomer. Even though you care deeply. They see the late arrivals, the missed reminder texts — and they judge you for it.</p>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-lg mb-2">
              Most scheduling tools don&apos;t fix this — because they weren&apos;t built for mobile grooming.
            </p>
            <p className="text-2xl font-bold">
              <GroomRoute /> was.
            </p>
          </div>
        </div>
      </section>

      {/* WHAT IT DOES */}
      <section className="py-20 px-6 bg-base-200">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            What <GroomRoute /> actually does (in plain English)
          </h2>
          <p className="text-lg mb-4">
            <GroomRoute /> looks at where your customers live, how long each groom takes, and when you want to start your day — then builds the most efficient route automatically.
          </p>
          <p className="text-3xl font-bold text-primary mt-8">
            You click one button. Your day makes sense.
          </p>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="py-20 px-6 bg-base-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              What Your Day Looks Like <strong>Before vs After <GroomRoute /></strong>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* BEFORE */}
            <div className="rounded-xl p-8 bg-base-200 border-2 border-error">
              <p className="text-center text-2xl font-bold mb-6 text-error">BEFORE</p>

              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                  <span>Guessing drive order</span>
                </li>
                <li className="flex gap-3 items-start">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                  <span>Constant customer messages</span>
                </li>
                <li className="flex gap-3 items-start">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                  <span>Lost time + wasted fuel</span>
                </li>
                <li className="flex gap-3 items-start">
                  <XCircle className="w-5 h-5 text-error flex-shrink-0 mt-1" />
                  <span>Running behind & stressed</span>
                </li>
              </ul>
            </div>

            {/* AFTER */}
            <div className="rounded-xl p-8 bg-base-200 border-2 border-success">
              <p className="text-center text-2xl font-bold mb-6 text-success">AFTER</p>

              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>Best route in one click</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>Automatic ETA updates</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>Less driving, more earning</span>
                </li>
                <li className="flex gap-3 items-start">
                  <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-1" />
                  <span>Calm, predictable days</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 bg-base-100" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary badge-lg mb-4">FEATURES</div>
            <h2 className="text-5xl font-bold mb-4">
              6 features that fix what&apos;s breaking your day
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">🗺️</div>
                <h3 className="card-title text-xl mb-2">
                  Drive less. Groom more.
                </h3>
                <p className="text-sm mb-3">
                  One click reorders your entire day by location. No more zigzagging across town. Your route finally makes sense, saving 45-90 minutes of drive time every single day.
                </p>
                <div className="badge badge-secondary badge-sm">1-2 hours saved daily</div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="card-title text-xl mb-2">
                  Stop calling customers — GroomRoute updates them for you
                </h3>
                <p className="text-sm mb-3">
                  When a groom runs long, GroomRoute recalculates your day and texts customers automatically so you can keep working instead of explaining delays.
                </p>
                <div className="badge badge-accent badge-sm">Less stress. Fewer interruptions.</div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="card bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">📅</div>
                <h3 className="card-title text-xl mb-2">
                  Turn cancellations into revenue
                </h3>
                <p className="text-sm mb-3">
                  Last-minute cancellation? GroomRoute instantly finds nearby customers on your waitlist and offers them the slot. Most groomers recover $200-$400/month they&apos;d otherwise lose.
                </p>
                <div className="badge badge-success badge-sm">$200-400/month recovered</div>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="card-title text-xl mb-2">
                  Never go to the wrong house again
                </h3>
                <p className="text-sm mb-3">
                  GroomRoute validates addresses, stores gate codes and access notes, and flags aggressive dogs or special handling needs. No more dangerous surprises.
                </p>
                <div className="badge badge-error badge-sm gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-3">
                    <path fillRule="evenodd" d="M6.701 2.25c.577-1 2.02-1 2.598 0l5.196 9a1.5 1.5 0 0 1-1.299 2.25H2.804a1.5 1.5 0 0 1-1.3-2.25l5.197-9ZM8 4a.75.75 0 0 1 .75.75v3a.75.75 0 1 1-1.5 0v-3A.75.75 0 0 1 8 4Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
                  </svg>
                  Safety flags
                </div>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="card bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">⏱️</div>
                <h3 className="card-title text-xl mb-2">
                  Stop running late
                </h3>
                <p className="text-sm mb-3">
                  Smart ETAs calculate realistic arrival times with buffer for traffic and groom delays. Your schedule becomes predictable and customers stop asking &ldquo;where are you?&rdquo;
                </p>
                <div className="badge badge-accent badge-sm">80% fewer &ldquo;where are you?&rdquo; calls</div>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="card bg-gradient-to-br from-cyan-50 to-cyan-100 border-2 border-cyan-200 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="text-4xl mb-3">⭐</div>
                <h3 className="card-title text-xl mb-2">
                  Get more 5-star reviews without asking
                </h3>
                <p className="text-sm mb-3">
                  After every successful groom, GroomRoute automatically sends a polite review request. Most groomers see 12+ new reviews per month with zero extra effort.
                </p>
                <div className="badge badge-info badge-sm">8 → 80+ reviews in 6 months</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6 bg-base-200" id="how-it-works">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary badge-lg mb-4">HOW IT WORKS</div>
            <h2 className="text-5xl font-bold mb-4">
              Get started in 3 simple steps
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-primary text-primary-content rounded-full w-20 flex items-center justify-center">
                    <span className="text-4xl font-bold">1</span>
                  </div>
                </div>
                <h3 className="card-title text-xl">Add your customers</h3>
                <p>One-time setup: Import your customer list or add them manually. About 20 minutes total.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-secondary text-secondary-content rounded-full w-20 flex items-center justify-center">
                    <span className="text-4xl font-bold">2</span>
                  </div>
                </div>
                <h3 className="card-title text-xl">Schedule appointments</h3>
                <p>Takes 30 seconds per booking. Just select customer, date, and service type.</p>
              </div>
            </div>

            <div className="card bg-base-100 shadow-xl">
              <div className="card-body items-center text-center">
                <div className="avatar placeholder mb-4">
                  <div className="bg-accent text-accent-content rounded-full w-20 flex items-center justify-center">
                    <span className="text-4xl font-bold">3</span>
                  </div>
                </div>
                <h3 className="card-title text-xl">Hit &ldquo;Optimize My Day&rdquo;</h3>
                <p>One click. 5 seconds. Your route is optimized and your schedule makes sense.</p>
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
              <p className="text-sm opacity-80">Average time saved by users</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">$200–$400/month</div>
              <p className="text-sm opacity-80">Recovered from cancellations</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">80% reduction</div>
              <p className="text-sm opacity-80">In &ldquo;Where are you?&rdquo; calls</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-6 bg-base-100" id="testimonials">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="badge badge-primary badge-lg mb-4">TESTIMONIALS</div>
            <h2 className="text-5xl font-bold mb-4">
              Real groomers, real results
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &ldquo;Before GroomRoute I was constantly behind schedule and texting clients from the van. Now my routes make sense and I literally earn more without working longer.&rdquo;
                </p>
                <div className="divider my-2"></div>
                <div>
                  <div className="font-bold">Sarah, Mobile Groomer</div>
                  <div className="text-sm opacity-70">2 vans</div>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <p className="text-lg mb-4">
                  &ldquo;I used to lose entire afternoons to last-minute cancellations. Now GroomRoute fills those gaps automatically from my waitlist. I&apos;ve recovered hundreds of dollars I would have just lost.&rdquo;
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
                  &ldquo;I was terrible at asking for reviews. The automated requests turned 12 reviews into over 90 in six months — my bookings are up 40% because of it.&rdquo;
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
                  &ldquo;Before, customers thought I was disorganized because I was always running late. Now the automated messages keep everyone informed and I look like I have a whole team. I&apos;m still just one guy with a van.&rdquo;
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
              Transparent pricing for every size operation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Solo Groomer */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">SOLO GROOMER</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$39</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {[
                    "1 groomer/van",
                    "Unlimited customers",
                    "Route optimization",
                    "Automated messaging",
                    "Review requests",
                  ].map((item) => (
                    <li className="flex gap-2 items-center" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-success size-5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href="/auth/signup" className="btn btn-outline btn-block border-2">
                    Start Free Trial
                  </Link>
                </div>
                <div className="text-sm text-center opacity-70 mt-2">or $390/year (save $78)</div>
              </div>
            </div>

            {/* Growing Team - POPULAR */}
            <div className="card bg-primary text-primary-content shadow-2xl border-4 border-primary transform scale-105">
              <div className="card-body">
                <div className="badge badge-secondary mb-2">MOST POPULAR</div>
                <div className="badge badge-neutral mb-2 text-neutral-content">GROWING TEAM</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$99</span>
                  <span className="text-sm opacity-90">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {[
                    "2-5 groomers/vans",
                    "Everything in Solo",
                    "Team coordination",
                    "Multi-route optimization",
                    "Priority support",
                  ].map((item) => (
                    <li className="flex gap-2 items-center" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href="/auth/signup" className="btn btn-secondary btn-block text-secondary-content">
                    Start Free Trial
                  </Link>
                </div>
                <div className="text-sm text-center opacity-90 mt-2">or $990/year (save $198)</div>
              </div>
            </div>

            {/* Professional Fleet */}
            <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
              <div className="card-body">
                <div className="badge badge-neutral mb-2">PROFESSIONAL FLEET</div>
                <div className="mb-4">
                  <span className="text-4xl font-bold">$199</span>
                  <span className="text-sm opacity-70">/month</span>
                </div>

                <ul className="space-y-2 mb-6">
                  {[
                    "6+ groomers/vans",
                    "Everything in Growing Team",
                    "Advanced analytics",
                    "Custom integrations",
                    "Dedicated support",
                  ].map((item) => (
                    <li className="flex gap-2 items-center" key={item}>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="text-success size-5">
                        <path fillRule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clipRule="evenodd" />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="card-actions">
                  <Link href="/auth/signup" className="btn btn-outline btn-block border-2">
                    Start Free Trial
                  </Link>
                </div>
                <div className="text-sm text-center opacity-70 mt-2">or $1,990/year (save $398)</div>
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

      {/* FAQ */}
      <section className="py-24 px-6 bg-base-200">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-4">
            <div className="collapse collapse-plus bg-base-100">
              <input type="radio" name="faq-accordion" defaultChecked />
              <div className="collapse-title text-xl font-medium">
                Do I need to be tech-savvy?
              </div>
              <div className="collapse-content">
                <p>No. If you can schedule appointments, you can use GroomRoute.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Do I need to install an app?
              </div>
              <div className="collapse-content">
                <p>No. Works perfectly on your phone.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                Does this replace my current scheduler?
              </div>
              <div className="collapse-content">
                <p>You can use GroomRoute alongside your current tool or gradually replace it — totally up to you.</p>
              </div>
            </div>

            <div className="collapse collapse-plus bg-base-100">
              <input type="radio" name="faq-accordion" />
              <div className="collapse-title text-xl font-medium">
                How fast will I see results?
              </div>
              <div className="collapse-content">
                <p>Most groomers notice a calmer, more efficient day in their first week.</p>
              </div>
            </div>
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
                If GroomRoute doesn&apos;t noticeably reduce your drive time and stress within the first few weeks…
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
                Ready to run calmer, more profitable days?
              </h2>
              <p className="text-lg mb-6">
                You already work hard enough. Your schedule shouldn&apos;t fight you.
              </p>
              <div className="card-actions">
                <Link href="/auth/signup" className="btn btn-gradient btn-lg">
                  Start Your 14-Day Free Trial
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
          <div className="font-bold text-xl mb-2"><GroomRoute /></div>
          <p className="max-w-md">Built by people who understand mobile service businesses.</p>
          <p className="max-w-md">Not just a scheduling tool. A system for running calmer, more profitable days.</p>
          <p className="text-sm opacity-70 mt-4">© 2025 <GroomRoute />. All rights reserved.</p>
        </aside>
      </footer>
    </main>
  );
}
