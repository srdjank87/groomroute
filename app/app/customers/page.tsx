"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Plus, Search, Calendar, DollarSign, ArrowUpDown } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  createdAt: string;
  pets: {
    id: string;
    name: string;
    species?: string;
  }[];
  _count: {
    appointments: number;
  };
  totalRevenue: number;
  lastAppointmentDate: string | null;
}

type SortOption =
  | "newest"
  | "oldest"
  | "appointments-desc"
  | "appointments-asc"
  | "pets-desc"
  | "pets-asc"
  | "revenue-desc"
  | "revenue-asc"
  | "name-asc";

type FilterOption = "all" | "active" | "inactive" | "vip" | "new";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filterBy, setFilterBy] = useState<FilterOption>("all");

  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/customers?search=${searchQuery}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
      }
    } catch (error) {
      console.error("Failed to fetch customers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchCustomers]);

  // Calculate customer segments
  const customerSegments = useMemo(() => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Sort by revenue to find VIP customers (top 10 or top 10%)
    const sortedByRevenue = [...customers].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const vipCount = Math.max(10, Math.ceil(customers.length * 0.1));
    const vipCustomerIds = new Set(sortedByRevenue.slice(0, vipCount).map((c) => c.id));

    return {
      all: customers.length,
      active: customers.filter((c) => {
        if (!c.lastAppointmentDate) return false;
        return new Date(c.lastAppointmentDate) >= ninetyDaysAgo;
      }).length,
      inactive: customers.filter((c) => {
        if (!c.lastAppointmentDate) return true;
        return new Date(c.lastAppointmentDate) < ninetyDaysAgo;
      }).length,
      vip: vipCount,
      new: customers.filter((c) => {
        return new Date(c.createdAt) >= thirtyDaysAgo && c._count.appointments === 0;
      }).length,
    };
  }, [customers]);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    const now = new Date();
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get VIP customer IDs
    const sortedByRevenue = [...customers].sort((a, b) => b.totalRevenue - a.totalRevenue);
    const vipCount = Math.max(10, Math.ceil(customers.length * 0.1));
    const vipCustomerIds = new Set(sortedByRevenue.slice(0, vipCount).map((c) => c.id));

    let filtered = customers;

    switch (filterBy) {
      case "active":
        filtered = customers.filter((c) => {
          if (!c.lastAppointmentDate) return false;
          return new Date(c.lastAppointmentDate) >= ninetyDaysAgo;
        });
        break;
      case "inactive":
        filtered = customers.filter((c) => {
          if (!c.lastAppointmentDate) return true;
          return new Date(c.lastAppointmentDate) < ninetyDaysAgo;
        });
        break;
      case "vip":
        filtered = customers.filter((c) => vipCustomerIds.has(c.id));
        break;
      case "new":
        filtered = customers.filter((c) => {
          return new Date(c.createdAt) >= thirtyDaysAgo && c._count.appointments === 0;
        });
        break;
      default:
        filtered = customers;
    }

    return filtered;
  }, [customers, filterBy]);

  // Sort customers
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];

    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case "oldest":
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "appointments-desc":
        return sorted.sort((a, b) => b._count.appointments - a._count.appointments);
      case "appointments-asc":
        return sorted.sort((a, b) => a._count.appointments - b._count.appointments);
      case "pets-desc":
        return sorted.sort((a, b) => b.pets.length - a.pets.length);
      case "pets-asc":
        return sorted.sort((a, b) => a.pets.length - b.pets.length);
      case "revenue-desc":
        return sorted.sort((a, b) => b.totalRevenue - a.totalRevenue);
      case "revenue-asc":
        return sorted.sort((a, b) => a.totalRevenue - b.totalRevenue);
      case "name-asc":
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      default:
        return sorted;
    }
  }, [filteredCustomers, sortBy]);

  // Check if customer is VIP
  const isVipCustomer = useCallback(
    (customerId: string) => {
      const sortedByRevenue = [...customers].sort((a, b) => b.totalRevenue - a.totalRevenue);
      const vipCount = Math.max(10, Math.ceil(customers.length * 0.1));
      const vipCustomerIds = new Set(sortedByRevenue.slice(0, vipCount).map((c) => c.id));
      return vipCustomerIds.has(customerId);
    },
    [customers]
  );

  // Check if customer is active
  const isActiveCustomer = useCallback((lastAppointmentDate: string | null) => {
    if (!lastAppointmentDate) return false;
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    return new Date(lastAppointmentDate) >= ninetyDaysAgo;
  }, []);

  return (
    <div className="max-w-4xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link
          href="/app/customers/new"
          className="btn h-12 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0 gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Customer
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input input-bordered w-full h-12 pl-10"
            placeholder="Search by name, phone, or address..."
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilterBy("all")}
          className={`badge badge-lg h-10 px-4 cursor-pointer transition-colors ${
            filterBy === "all"
              ? "bg-[#A5744A] text-white border-[#A5744A]"
              : "bg-white text-gray-700 border-gray-300 hover:border-[#A5744A]"
          }`}
        >
          All ({customerSegments.all})
        </button>
        <button
          onClick={() => setFilterBy("active")}
          className={`badge badge-lg h-10 px-4 cursor-pointer transition-colors ${
            filterBy === "active"
              ? "bg-green-600 text-white border-green-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-green-600"
          }`}
        >
          Active ({customerSegments.active})
        </button>
        <button
          onClick={() => setFilterBy("inactive")}
          className={`badge badge-lg h-10 px-4 cursor-pointer transition-colors ${
            filterBy === "inactive"
              ? "bg-gray-600 text-white border-gray-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-gray-600"
          }`}
        >
          Inactive ({customerSegments.inactive})
        </button>
        <button
          onClick={() => setFilterBy("vip")}
          className={`badge badge-lg h-10 px-4 cursor-pointer transition-colors ${
            filterBy === "vip"
              ? "bg-purple-600 text-white border-purple-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-purple-600"
          }`}
        >
          VIP ({customerSegments.vip})
        </button>
        <button
          onClick={() => setFilterBy("new")}
          className={`badge badge-lg h-10 px-4 cursor-pointer transition-colors ${
            filterBy === "new"
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-300 hover:border-blue-600"
          }`}
        >
          New ({customerSegments.new})
        </button>
      </div>

      {/* Sort Control */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-5 w-5 text-gray-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="select select-bordered h-10 text-sm flex-1"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="appointments-desc">Most Appointments</option>
            <option value="appointments-asc">Fewest Appointments</option>
            <option value="pets-desc">Most Pets</option>
            <option value="pets-asc">Fewest Pets</option>
            <option value="revenue-desc">Highest Revenue</option>
            <option value="revenue-asc">Lowest Revenue</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {sortedCustomers.length} {sortedCustomers.length === 1 ? "customer" : "customers"}
        {filterBy !== "all" && (
          <button
            onClick={() => setFilterBy("all")}
            className="ml-2 text-[#A5744A] hover:underline"
          >
            Clear filter
          </button>
        )}
      </div>

      {/* Customers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : sortedCustomers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Customers Found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || filterBy !== "all"
              ? "Try a different search term or filter"
              : "Get started by adding your first customer"}
          </p>
          {!searchQuery && filterBy === "all" && (
            <Link
              href="/app/customers/new"
              className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
            >
              <Plus className="h-5 w-5" />
              Add Customer
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCustomers.map((customer) => {
            const isVip = isVipCustomer(customer.id);
            const isActive = isActiveCustomer(customer.lastAppointmentDate);

            return (
              <Link
                key={customer.id}
                href={`/app/customers/${customer.id}`}
                className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {customer.name}
                      </h3>
                      {isVip && (
                        <span className="badge badge-sm bg-purple-100 text-purple-700 border-purple-300">
                          VIP
                        </span>
                      )}
                      {isActive && (
                        <span className="badge badge-sm bg-green-100 text-green-700 border-green-300">
                          Active
                        </span>
                      )}
                    </div>
                    {customer.phone && (
                      <p className="text-sm text-gray-600">{customer.phone}</p>
                    )}
                    {customer.email && (
                      <p className="text-sm text-gray-600">{customer.email}</p>
                    )}
                    <p className="text-sm text-gray-500">{customer.address}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>
                      {customer.pets.length}{" "}
                      {customer.pets.length === 1 ? "pet" : "pets"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {customer._count.appointments}{" "}
                      {customer._count.appointments === 1 ? "appointment" : "appointments"}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {customer.totalRevenue.toFixed(0)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      window.location.href = `/app/appointments/new?customerId=${customer.id}`;
                    }}
                    className="btn btn-sm h-9 px-4 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
                  >
                    <span className="hidden sm:inline">Book Appointment</span>
                    <span className="sm:hidden">Book</span>
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
