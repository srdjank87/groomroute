import { redirect, notFound } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  Calendar,
  CreditCard,
  Shield,
  Scissors,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

async function getAccount(id: string) {
  const account = await prisma.account.findUnique({
    where: { id },
    include: {
      users: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          groomer: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "asc" },
      },
      groomers: {
        where: { isActive: true },
        select: {
          id: true,
          name: true,
          email: true,
          baseAddress: true,
          workingHoursStart: true,
          workingHoursEnd: true,
        },
        orderBy: { name: "asc" },
      },
      _count: {
        select: {
          customers: true,
          appointments: true,
          groomers: true,
        },
      },
    },
  });

  return account;
}

export default async function AdminAccountDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const account = await getAccount(id);

  if (!account) {
    notFound();
  }

  const adminUsers = account.users.filter((u) => u.role === "ADMIN");
  const groomerUsers = account.users.filter((u) => u.role === "GROOMER");

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/accounts"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">{account.name}</h1>
              <p className="text-sm text-gray-600">
                {account.users[0]?.email || "No primary email"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 text-sm rounded-full ${getStatusColor(
                  account.subscriptionStatus
                )}`}
              >
                {account.subscriptionStatus}
              </span>
              <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-700">
                {account.subscriptionPlan}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {account._count.customers}
                </p>
                <p className="text-sm text-gray-500">Customers</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {account._count.appointments}
                </p>
                <p className="text-sm text-gray-500">Appointments</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {adminUsers.length}
                </p>
                <p className="text-sm text-gray-500">Admin Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Scissors className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {groomerUsers.length}
                </p>
                <p className="text-sm text-gray-500">Groomer Users</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Subscription Info */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Subscription
              </h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Plan</span>
                <span className="font-medium text-gray-900">
                  {account.subscriptionPlan}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span
                  className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(
                    account.subscriptionStatus
                  )}`}
                >
                  {account.subscriptionStatus}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Billing Cycle</span>
                <span className="font-medium text-gray-900">
                  {account.billingCycle || "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Admin Seats</span>
                <span className="font-medium text-gray-900">
                  {adminUsers.length} / {account.adminSeats}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Groomer Seats</span>
                <span className="font-medium text-gray-900">
                  {groomerUsers.length} / {account.groomerSeats}
                </span>
              </div>
              {account.trialEndsAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Trial Ends</span>
                  <span className="font-medium text-gray-900">
                    {formatDate(account.trialEndsAt)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span className="font-medium text-gray-900">
                  {formatDate(account.createdAt)}
                </span>
              </div>
              {account.stripeCustomerId && (
                <div className="pt-3 border-t">
                  <a
                    href={`https://dashboard.stripe.com/customers/${account.stripeCustomerId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    View in Stripe Dashboard →
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Team Members ({account.users.length})
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {account.users.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No team members
                </div>
              ) : (
                account.users.map((user) => (
                  <div key={user.id} className="p-4 flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        user.role === "ADMIN" ? "bg-purple-100" : "bg-emerald-100"
                      }`}
                    >
                      {user.role === "ADMIN" ? (
                        <Shield className="w-4 h-4 text-purple-600" />
                      ) : (
                        <Scissors className="w-4 h-4 text-emerald-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {user.name || "Unnamed"}
                      </p>
                      <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          user.role === "ADMIN"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-emerald-100 text-emerald-700"
                        }`}
                      >
                        {user.role}
                      </span>
                      {user.groomer && (
                        <p className="text-xs text-gray-400 mt-1">
                          → {user.groomer.name}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Groomer Profiles */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden lg:col-span-2">
            <div className="p-4 border-b border-gray-200 flex items-center gap-2">
              <Scissors className="w-5 h-5 text-gray-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Groomer Profiles ({account.groomers.length})
              </h2>
            </div>
            {account.groomers.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No groomer profiles
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Email
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Base Address
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                        Hours
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {account.groomers.map((groomer) => (
                      <tr key={groomer.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-900">
                          {groomer.name}
                        </td>
                        <td className="px-4 py-3 text-gray-600">
                          {groomer.email || "-"}
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="truncate max-w-[200px]">
                              {groomer.baseAddress}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-600 text-sm">
                          {groomer.workingHoursStart && groomer.workingHoursEnd ? (
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-gray-400" />
                              {formatTime12Hour(groomer.workingHoursStart)} -{" "}
                              {formatTime12Hour(groomer.workingHoursEnd)}
                            </div>
                          ) : (
                            "-"
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
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
    year: "numeric",
  }).format(date);
}

function formatTime12Hour(time: string | null): string {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}
