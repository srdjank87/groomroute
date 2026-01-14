import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Users,
  TrendingUp,
  Calendar,
  CreditCard,
  Activity,
  LogOut,
  ChevronRight,
  Mail,
} from "lucide-react";

async function getMetrics() {
  const now = new Date();
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total accounts by status
  const accountsByStatus = await prisma.account.groupBy({
    by: ["subscriptionStatus"],
    _count: true,
  });

  // Signups this week
  const signupsThisWeek = await prisma.account.count({
    where: {
      createdAt: { gte: startOfWeek },
    },
  });

  // Signups this month
  const signupsThisMonth = await prisma.account.count({
    where: {
      createdAt: { gte: startOfMonth },
    },
  });

  // Total accounts
  const totalAccounts = await prisma.account.count();

  // Active trials
  const activeTrials = await prisma.account.count({
    where: {
      subscriptionStatus: "TRIAL",
      trialEndsAt: { gt: now },
    },
  });

  // Paid accounts
  const paidAccounts = await prisma.account.count({
    where: {
      subscriptionStatus: "ACTIVE",
    },
  });

  // Recent signups (last 5)
  const recentSignups = await prisma.account.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        take: 1,
        select: { email: true },
      },
    },
  });

  // Calculate conversion rate
  const expiredTrials = await prisma.account.count({
    where: {
      subscriptionStatus: { in: ["EXPIRED", "CANCELED"] },
    },
  });
  const totalFinishedTrials = paidAccounts + expiredTrials;
  const conversionRate = totalFinishedTrials > 0
    ? ((paidAccounts / totalFinishedTrials) * 100).toFixed(1)
    : "N/A";

  return {
    totalAccounts,
    activeTrials,
    paidAccounts,
    signupsThisWeek,
    signupsThisMonth,
    conversionRate,
    accountsByStatus,
    recentSignups,
  };
}

export default async function AdminDashboard() {
  // Check authentication
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const metrics = await getMetrics();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                GroomRoute Admin
              </h1>
              <p className="text-sm text-gray-600">Analytics & Account Management</p>
            </div>
            <form action="/api/admin/login" method="DELETE">
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Accounts"
            value={metrics.totalAccounts}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            title="Active Trials"
            value={metrics.activeTrials}
            icon={<Calendar className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            title="Paid Accounts"
            value={metrics.paidAccounts}
            icon={<CreditCard className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            title="Conversion Rate"
            value={`${metrics.conversionRate}%`}
            icon={<TrendingUp className="w-6 h-6" />}
            color="purple"
          />
        </div>

        {/* Signups Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Signups This Week
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.signupsThisWeek}
            </p>
          </div>
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Signups This Month
            </h3>
            <p className="text-3xl font-bold text-gray-900">
              {metrics.signupsThisMonth}
            </p>
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Accounts by Status
            </h3>
            <div className="space-y-3">
              {metrics.accountsByStatus.map((item) => (
                <div
                  key={item.subscriptionStatus}
                  className="flex items-center justify-between"
                >
                  <span className="text-gray-600">
                    {formatStatus(item.subscriptionStatus)}
                  </span>
                  <span className="font-semibold text-gray-900">
                    {item._count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent Signups
              </h3>
              <Link
                href="/admin/accounts"
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="space-y-3">
              {metrics.recentSignups.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500">
                      {account.users[0]?.email || "No email"}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                        account.subscriptionStatus
                      )}`}
                    >
                      {account.subscriptionStatus}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDate(account.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/admin/accounts"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Users className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">All Accounts</span>
            </Link>
            <Link
              href="/admin/emails"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Mail className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Email Templates</span>
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <Activity className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">Event Log</span>
            </Link>
            <a
              href="https://us.posthog.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="w-5 h-5 text-gray-600" />
              <span className="font-medium text-gray-900">PostHog Dashboard</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    yellow: "bg-yellow-50 text-yellow-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>{icon}</div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function formatStatus(status: string): string {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function getStatusColor(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "bg-green-100 text-green-700";
    case "TRIAL":
      return "bg-blue-100 text-blue-700";
    case "PAST_DUE":
      return "bg-yellow-100 text-yellow-700";
    case "CANCELED":
    case "EXPIRED":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
