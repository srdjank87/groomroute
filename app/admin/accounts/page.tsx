import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Search, Filter, ChevronRight } from "lucide-react";

async function getAccounts(searchParams: { status?: string; search?: string }) {
  const where: Record<string, unknown> = {};

  if (searchParams.status && searchParams.status !== "all") {
    where.subscriptionStatus = searchParams.status;
  }

  if (searchParams.search) {
    where.OR = [
      { name: { contains: searchParams.search, mode: "insensitive" } },
      {
        users: {
          some: {
            email: { contains: searchParams.search, mode: "insensitive" },
          },
        },
      },
    ];
  }

  const accounts = await prisma.account.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      users: {
        select: { email: true, name: true, role: true },
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

  return accounts;
}

export default async function AdminAccountsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; search?: string }>;
}) {
  const isAuthenticated = await isAdminAuthenticated();
  if (!isAuthenticated) {
    redirect("/admin/login");
  }

  const params = await searchParams;
  const accounts = await getAccounts(params);

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
              <h1 className="text-2xl font-bold text-gray-900">All Accounts</h1>
              <p className="text-sm text-gray-600">
                {accounts.length} accounts found
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl p-4 border border-gray-200 mb-6">
          <form className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="search"
                defaultValue={params.search}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                name="status"
                defaultValue={params.status || "all"}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="TRIAL">Trial</option>
                <option value="ACTIVE">Active</option>
                <option value="PAST_DUE">Past Due</option>
                <option value="CANCELED">Canceled</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Filter
            </button>
          </form>
        </div>

        {/* Accounts Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Account
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Plan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Trial Ends
                  </th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {accounts.map((account) => (
                  <tr key={account.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {account.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {account.users[0]?.email || "No email"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {account.subscriptionPlan}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs space-y-1">
                        {account.users.filter(u => u.role === "ADMIN").length > 0 && (
                          <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                            {account.users.filter(u => u.role === "ADMIN").length} Admin
                          </span>
                        )}
                        {account.users.filter(u => u.role === "GROOMER").length > 0 && (
                          <span className="inline-block ml-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700">
                            {account.users.filter(u => u.role === "GROOMER").length} Groomer
                          </span>
                        )}
                        {account.users.length === 0 && (
                          <span className="text-gray-400">No users</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(
                          account.subscriptionStatus
                        )}`}
                      >
                        {account.subscriptionStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">
                        <span>{account._count.customers} customers</span>
                        <span className="mx-1">·</span>
                        <span>{account._count.appointments} appts</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(account.createdAt)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {account.trialEndsAt
                        ? formatDate(account.trialEndsAt)
                        : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/accounts/${account.id}`}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {accounts.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No accounts found matching your criteria.
            </div>
          )}
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
