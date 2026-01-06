"use client";

import Link from "next/link";
import { MapPin, Shield, Bell, CreditCard, ChevronRight, Settings as SettingsIcon } from "lucide-react";

const settingsCategories = [
  {
    name: "Service Areas",
    description: "Define geographic areas and assign them to days of the week",
    href: "/app/settings/areas",
    icon: MapPin,
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    badge: "Area Days",
    badgeColor: "bg-emerald-100 text-emerald-700",
  },
  {
    name: "Workload Protection",
    description: "Set limits to protect your energy and prevent burnout",
    href: "/app/settings/profile",
    icon: Shield,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    badge: null,
    badgeColor: "",
  },
  {
    name: "Notifications",
    description: "Configure reminders and message templates",
    href: "/app/settings/notifications",
    icon: Bell,
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    disabled: true,
  },
  {
    name: "Billing",
    description: "Manage your subscription and payment methods",
    href: "/app/settings/billing",
    icon: CreditCard,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    disabled: true,
  },
];

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-gray-100 rounded-lg">
            <SettingsIcon className="h-6 w-6 text-gray-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        </div>
        <p className="text-gray-600">
          Customize your workflow to work the way you do best
        </p>
      </div>

      <div className="space-y-4">
        {settingsCategories.map((category) => (
          <div key={category.name}>
            {category.disabled ? (
              <div className="bg-white rounded-xl border border-gray-200 p-5 opacity-60 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${category.iconBg} rounded-lg`}>
                      <category.icon className={`h-6 w-6 ${category.iconColor}`} />
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
                className="block bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${category.iconBg} rounded-lg`}>
                      <category.icon className={`h-6 w-6 ${category.iconColor}`} />
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
