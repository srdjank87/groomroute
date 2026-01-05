"use client";

import Link from "next/link";
import { MapPin, User, Bell, CreditCard, ChevronRight } from "lucide-react";

const settingsCategories = [
  {
    name: "Service Areas",
    description: "Define geographic areas and assign them to days of the week",
    href: "/app/settings/areas",
    icon: MapPin,
    badge: "Area Days",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Profile",
    description: "Manage your workload preferences and limits",
    href: "/app/settings/profile",
    icon: User,
    badge: "New",
    badgeColor: "bg-blue-100 text-blue-700",
  },
  {
    name: "Notifications",
    description: "Configure reminders and message templates",
    href: "/app/settings/notifications",
    icon: Bell,
    disabled: true,
  },
  {
    name: "Billing",
    description: "Manage your subscription and payment methods",
    href: "/app/settings/billing",
    icon: CreditCard,
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="space-y-4">
        {settingsCategories.map((category) => (
          <div key={category.name}>
            {category.disabled ? (
              <div className="bg-white rounded-xl border p-5 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <category.icon className="h-6 w-6 text-gray-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {category.name}
                        </h2>
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full">
                          Coming Soon
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href={category.href}
                className="block bg-white rounded-xl border p-5 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-[#A5744A]/10 rounded-lg">
                      <category.icon className="h-6 w-6 text-[#A5744A]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="font-semibold text-gray-900">
                          {category.name}
                        </h2>
                        {category.badge && (
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full ${category.badgeColor}`}
                          >
                            {category.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {category.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
