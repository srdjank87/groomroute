"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { Users, Calendar, Route, Plus } from "lucide-react";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}!
        </h1>
        <p className="text-gray-600 mt-1">
          Here&apos;s what&apos;s happening with your grooming business today.
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg">
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Today&apos;s Appointments
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Customers
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg">
              <Route className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                This Week&apos;s Routes
              </p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-lg shadow mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/app/customers"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="font-medium text-gray-900">Add Customer</span>
            </Link>
            <Link
              href="/app/appointments"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-5 w-5 text-primary" />
              <span className="font-medium text-gray-900">
                Schedule Appointment
              </span>
            </Link>
            <Link
              href="/app/routes"
              className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Route className="h-5 w-5 text-primary" />
              <span className="font-medium text-gray-900">View Routes</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Getting started */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg shadow text-white p-6">
        <h2 className="text-xl font-bold mb-2">Getting Started</h2>
        <p className="mb-4 opacity-90">
          Start by adding your first customer and scheduling an appointment.
          Then, use our route optimizer to save time and fuel costs.
        </p>
        <Link
          href="/app/customers"
          className="btn btn-white bg-white text-primary hover:bg-gray-100"
        >
          Add Your First Customer
        </Link>
      </div>
    </div>
  );
}
