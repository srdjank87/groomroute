"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Plus, Search, Calendar } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  pets: {
    id: string;
    name: string;
    species?: string;
  }[];
  _count: {
    appointments: number;
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

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
      <div className="bg-white rounded-lg shadow p-4 mb-6">
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

      {/* Customers List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : customers.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Plus className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Customers Found
          </h3>
          <p className="text-gray-600 mb-4">
            {searchQuery
              ? "Try a different search term"
              : "Get started by adding your first customer"}
          </p>
          {!searchQuery && (
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
          {customers.map((customer) => (
            <Link
              key={customer.id}
              href={`/app/customers/${customer.id}`}
              className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">
                    {customer.name}
                  </h3>
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
                </div>

                <button
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/app/appointments/new?customerId=${customer.id}`;
                  }}
                  className="btn btn-sm h-9 px-4 bg-[#A5744A] hover:bg-[#8B6239] text-white border-0"
                >
                  Book Appointment
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
