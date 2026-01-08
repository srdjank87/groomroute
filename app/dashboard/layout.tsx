"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Sun,
  Users,
  Calendar,
  Route as RouteIcon,
  Settings,
  LogOut,
  Menu,
  Heart,
  Sparkles,
  BarChart3,
  UserPlus,
} from "lucide-react";
import { useState, useEffect } from "react";

const GroomRouteLogo = () => (
  <span>Groom<span style={{ color: '#A5744A' }}>Route</span></span>
);

// Navigation grouped by purpose
const mainNavigation = [
  { name: "Today", href: "/dashboard", icon: Sun },
  { name: "Routes", href: "/dashboard/routes", icon: RouteIcon },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const businessNavigation = [
  { name: "Appointments", href: "/dashboard/appointments", icon: Calendar },
  { name: "Customers", href: "/dashboard/customers", icon: Users },
];

const supportNavigation = [
  { name: "Calm Center", href: "/dashboard/calm", icon: Heart, special: true },
];

const settingsNavigation = [
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [hasAssistant, setHasAssistant] = useState(false);

  // Fetch assistant status for the day
  useEffect(() => {
    async function fetchAssistantStatus() {
      try {
        const response = await fetch("/api/routes/assistant");
        if (response.ok) {
          const data = await response.json();
          setHasAssistant(data.hasAssistant);
        }
      } catch (error) {
        console.error("Failed to fetch assistant status:", error);
      }
    }

    if (status === "authenticated") {
      fetchAssistantStatus();
    }

    // Listen for assistant status changes from the dashboard toggle
    function handleAssistantStatusChange(event: CustomEvent<{ hasAssistant: boolean }>) {
      setHasAssistant(event.detail.hasAssistant);
    }

    window.addEventListener("assistantStatusChanged", handleAssistantStatusChange as EventListener);
    return () => {
      window.removeEventListener("assistantStatusChanged", handleAssistantStatusChange as EventListener);
    };
  }, [status]);

  // Check if user has completed Stripe checkout
  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      const subscriptionStatus = session.user.subscriptionStatus;

      // If user has no subscription status or is in incomplete state, redirect to signup
      // Allow TRIAL, ACTIVE, PAST_DUE, and CANCELED (grace period)
      // Block access if: no status, INCOMPLETE, or EXPIRED
      if (!subscriptionStatus ||
          subscriptionStatus === "INCOMPLETE" ||
          subscriptionStatus === "EXPIRED") {
        setIsRedirecting(true);
        console.log("Subscription check failed:", subscriptionStatus);
        // Force redirect using window.location for immediate navigation
        window.location.href = "/auth/signup?error=subscription_required";
      }
    }
  }, [status, session]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  if (status === "unauthenticated") {
    router.push("/auth/signin");
    return null;
  }

  // Block rendering if subscription check fails
  if (session?.user &&
      (!session.user.subscriptionStatus ||
       session.user.subscriptionStatus === "INCOMPLETE" ||
       session.user.subscriptionStatus === "EXPIRED")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-100">
        <div className="text-center max-w-md px-6">
          <div className="mb-4">
            <span className="loading loading-spinner loading-lg text-[#A5744A]"></span>
          </div>
          <p className="text-gray-700 font-medium">
            {isRedirecting ? "Redirecting to complete your subscription..." : "Checking your subscription..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden ${sidebarOpen ? "block" : "hidden"}`}>
        <div className="fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setSidebarOpen(false)}
          ></div>
          <div className={`relative flex w-full max-w-xs flex-1 flex-col transition-colors ${
            hasAssistant ? "bg-blue-50" : "bg-white"
          }`}>
            <div className={`flex h-16 items-center gap-x-1 px-6 border-b ${
              hasAssistant ? "border-blue-200" : "border-gray-200"
            }`}>
              <Image
                src="/images/icon.svg"
                alt="GroomRoute"
                width={16}
                height={16}
                className="w-6 h-6"
              />
              <h1 className="text-xl font-bold"><GroomRouteLogo /></h1>
              {hasAssistant && (
                <div className="ml-auto flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-medium">
                  <UserPlus className="h-3 w-3" />
                  Team
                </div>
              )}
            </div>
            <nav className="flex flex-1 flex-col p-4">
              {/* Main Navigation - Your Day */}
              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Your Day</p>
                <ul role="list" className="space-y-1">
                  {mainNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                            isActive
                              ? "bg-[#A5744A] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Business Navigation */}
              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Business</p>
                <ul role="list" className="space-y-1">
                  {businessNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                            isActive
                              ? "bg-[#A5744A] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Support Navigation - Calm Center */}
              <div className="mb-4">
                <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Support</p>
                <ul role="list" className="space-y-1">
                  {supportNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                            isActive
                              ? "bg-pink-600 text-white"
                              : "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 hover:from-pink-100 hover:to-purple-100 border border-pink-200"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Settings at bottom */}
              <div className="mt-auto pt-4 border-t border-gray-200">
                <ul role="list" className="space-y-1">
                  {settingsNavigation.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <li key={item.name}>
                        <Link
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium ${
                            isActive
                              ? "bg-[#A5744A] text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className={`flex grow flex-col gap-y-5 overflow-y-auto border-r transition-colors ${
          hasAssistant ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
        }`}>
          <div className={`flex h-16 items-center gap-x-1.5 px-6 border-b ${
            hasAssistant ? "border-blue-200" : "border-gray-200"
          }`}>
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <h1 className="text-xl font-bold"><GroomRouteLogo /></h1>
          </div>
          {/* Assistant Mode Indicator Banner */}
          {hasAssistant && (
            <div className="mx-4 -mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-blue-100 border border-blue-200">
              <UserPlus className="h-4 w-4 text-blue-700" />
              <span className="text-sm font-medium text-blue-700">Team Day</span>
            </div>
          )}
          <nav className="flex flex-1 flex-col p-4">
            {/* Main Navigation - Your Day */}
            <div className="mb-4">
              <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Your Day</p>
              <ul role="list" className="space-y-1">
                {mainNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#A5744A] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Business Navigation */}
            <div className="mb-4">
              <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Business</p>
              <ul role="list" className="space-y-1">
                {businessNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#A5744A] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Support Navigation - Calm Center */}
            <div className="mb-4">
              <p className="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider">Support</p>
              <ul role="list" className="space-y-1">
                {supportNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-pink-600 text-white"
                            : "bg-gradient-to-r from-pink-50 to-purple-50 text-pink-700 hover:from-pink-100 hover:to-purple-100 border border-pink-200"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Settings at bottom */}
            <div className="mt-auto pt-4 border-t border-gray-200">
              <ul role="list" className="space-y-1">
                {settingsNavigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-x-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#A5744A] text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex h-16 items-center gap-x-4 bg-white border-b border-gray-200 px-4 shadow-sm sm:px-6 lg:px-8">
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-gray-700 z-20"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Mobile logo - centered */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-x-1">
            <Image
              src="/images/icon.svg"
              alt="GroomRoute"
              width={16}
              height={16}
              className="w-6 h-6"
            />
            <h1 className="text-lg font-bold"><GroomRouteLogo /></h1>
          </div>

          {/* Desktop - right aligned user info */}
          <div className="hidden lg:flex flex-1 gap-x-4 self-stretch lg:gap-x-6 justify-end items-center">
            <div className="flex items-center gap-x-4">
              <span className="text-sm text-gray-700">
                {session?.user?.name || session?.user?.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="btn btn-ghost btn-sm gap-2"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Mobile logout button */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="lg:hidden -m-2.5 p-2.5 text-gray-700 ml-auto z-20"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
