"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  DollarSign,
  TrendingUp,
  Users,
  Shield,
  CheckCircle,
  BarChart3,
  Calendar,
} from "lucide-react";

interface CalmImpact {
  weeklyTimeRecoveredMinutes: number;
  monthlyTimeRecoveredMinutes: number;
  weeklyOrganizedDays: number;
  monthlyOrganizedDays: number;
  weeklyClientsServed: number;
  monthlyClientsServed: number;
  weeklyAppointmentsSmooth: number;
  monthlyAppointmentsSmooth: number;
  calmImpactMessage: string;
}

interface RevenueStats {
  dailyRevenue: {
    date: string;
    dayName: string;
    revenue: number;
    lostRevenue: number;
    appointments: number;
    lostAppointments: number;
  }[];
  weeklyRevenue: number;
  weeklyLostRevenue: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
  monthlyLostRevenue: number;
  monthlyAppointments: number;
  avgRevenuePerAppointment: number;
  avgRevenuePerCustomer: number;
  uniqueCustomers: number;
  completionRate: number;
  calmImpact: CalmImpact;
}

interface DogsBySize {
  small: number;
  medium: number;
  large: number;
  giant: number;
}

interface WeeklyPerformance {
  headline: string;
  subtext: string;
  dogsGroomed: number;
  dogsBySize: DogsBySize;
  totalEnergyLoad: number;
  revenue: number;
  daysWorked: number;
  avgDogsPerDay: number;
  avgEnergyPerDay: number;
  avgDriveMinutesPerStop: number | null;
  avgRevenuePerDay: number;
}

interface IndustryInsights {
  dogsPerDay: { industry: string; user30Day: number; comparison: string };
  energyLoad: { industry: string; userAvg: number; comparison: string };
  driveTime: { target: string; userAvg: number | null; comparison: string };
  cancellationRate: { typical: string; user: number; comparison: string };
  largeDogs: { typical: string; userAvg: number; comparison: string };
}

interface PerformanceData {
  weekly: WeeklyPerformance;
  insights: IndustryInsights;
}

export default function AnalyticsPage() {
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null);
  const [performanceData, setPerformanceData] = useState<PerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const [revenueRes, perfRes] = await Promise.all([
          fetch("/api/dashboard/revenue"),
          fetch("/api/dashboard/performance"),
        ]);

        if (revenueRes.ok) {
          const revenueData = await revenueRes.json();
          setRevenueStats(revenueData);
        }

        if (perfRes.ok) {
          const perfData = await perfRes.json();
          setPerformanceData(perfData);
        }
      } catch (error) {
        console.error("Failed to fetch analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="loading loading-spinner loading-lg"></span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/dashboard" className="btn btn-ghost btn-sm gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
              <p className="text-gray-500 text-sm">Your business at a glance</p>
            </div>
          </div>
        </div>
      </div>

      {/* This Week - Calm Impact Summary */}
      {revenueStats?.calmImpact && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Days Organized */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyOrganizedDays}
                </p>
                <p className="text-xs text-gray-600">Days organized</p>
              </div>
            </div>

            {/* Appointments Ran Smoothly */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyAppointmentsSmooth}
                </p>
                <p className="text-xs text-gray-600">Ran smoothly</p>
              </div>
            </div>

            {/* Clients Served */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.weeklyClientsServed}
                </p>
                <p className="text-xs text-gray-600">Happy clients</p>
              </div>
            </div>
          </div>

          {/* Calm Impact Message */}
          {revenueStats.calmImpact.calmImpactMessage && (
            <p className="text-center text-gray-500 text-sm mt-4 pt-4 border-t border-gray-100">
              {revenueStats.calmImpact.calmImpactMessage}
            </p>
          )}
        </div>
      )}

      {/* This Month Summary */}
      {revenueStats?.calmImpact && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Month</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Days Organized */}
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.monthlyOrganizedDays}
                </p>
                <p className="text-xs text-gray-600">Days organized</p>
              </div>
            </div>

            {/* Appointments Ran Smoothly */}
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.monthlyAppointmentsSmooth}
                </p>
                <p className="text-xs text-gray-600">Ran smoothly</p>
              </div>
            </div>

            {/* Clients Served */}
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">
                  {revenueStats.calmImpact.monthlyClientsServed}
                </p>
                <p className="text-xs text-gray-600">Happy clients</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Your Earnings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Earnings</h2>
        </div>

        {/* Revenue Chart */}
        <div className="p-6">
          {!revenueStats ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="font-medium">No earnings data yet</p>
              <p className="text-sm mt-1">Complete your first appointment to see earnings</p>
            </div>
          ) : (
            <>
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700">Last 7 Days</h3>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-gradient-to-t from-green-500 to-green-400"></div>
                    <span className="text-gray-600">Earned</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded bg-red-300"></div>
                    <span className="text-gray-600">Lost</span>
                  </div>
                </div>
              </div>
              {/* Chart with Y-axis */}
              <div className="flex gap-2">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between h-[160px] text-xs text-gray-500 pr-2" style={{ minWidth: '40px' }}>
                  {(() => {
                    const maxTotal = Math.max(...revenueStats.dailyRevenue.map(d => d.revenue + d.lostRevenue), 1);
                    return (
                      <>
                        <span>${maxTotal.toFixed(0)}</span>
                        <span>${(maxTotal * 0.75).toFixed(0)}</span>
                        <span>${(maxTotal * 0.5).toFixed(0)}</span>
                        <span>${(maxTotal * 0.25).toFixed(0)}</span>
                        <span>$0</span>
                      </>
                    );
                  })()}
                </div>
                {/* Chart bars */}
                <div className="flex-1 flex items-end justify-between gap-2 h-48">
                  {revenueStats.dailyRevenue.map((day) => {
                    const totalRevenue = day.revenue + day.lostRevenue;
                    const maxTotal = Math.max(...revenueStats.dailyRevenue.map(d => d.revenue + d.lostRevenue));
                    const totalHeightPercent = maxTotal > 0 ? (totalRevenue / maxTotal) * 100 : 0;
                    const earnedHeightPercent = totalRevenue > 0 ? (day.revenue / totalRevenue) * 100 : 0;
                    const lostHeightPercent = totalRevenue > 0 ? (day.lostRevenue / totalRevenue) * 100 : 0;

                    return (
                      <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                        <div className="relative w-full flex flex-col justify-end" style={{ height: '160px' }}>
                          <div
                            className="w-full flex flex-col justify-end cursor-pointer group"
                            style={{ height: `${totalHeightPercent}%`, minHeight: totalRevenue > 0 ? '8px' : '0' }}
                          >
                            {/* Lost revenue (top - red) */}
                            {day.lostRevenue > 0 && (
                              <div
                                className="w-full bg-red-300 rounded-t-lg transition-all hover:bg-red-400"
                                style={{ height: `${lostHeightPercent}%`, minHeight: '4px' }}
                                title={`Lost: $${day.lostRevenue.toFixed(0)} (${day.lostAppointments} cancelled/no-show)`}
                              />
                            )}
                            {/* Earned revenue (bottom - green) */}
                            {day.revenue > 0 && (
                              <div
                                className={`w-full bg-gradient-to-t from-green-500 to-green-400 transition-all hover:opacity-80 ${day.lostRevenue === 0 ? 'rounded-t-lg' : ''}`}
                                style={{ height: `${earnedHeightPercent}%`, minHeight: '4px' }}
                                title={`Earned: $${day.revenue.toFixed(0)} (${day.appointments} completed)`}
                              />
                            )}
                            {/* Tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs px-2 py-1.5 rounded whitespace-nowrap z-10">
                              <div className="text-green-300">${day.revenue.toFixed(0)} earned</div>
                              {day.lostRevenue > 0 && <div className="text-red-300">${day.lostRevenue.toFixed(0)} lost</div>}
                            </div>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 font-medium">{day.dayName}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.weeklyRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Weekly Earnings</p>
                <p className="text-xs text-gray-500">{revenueStats.weeklyAppointments} jobs completed</p>
                {revenueStats.weeklyLostRevenue > 0 && (
                  <p className="text-xs text-red-500 mt-1">-${revenueStats.weeklyLostRevenue.toFixed(0)} lost</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.monthlyRevenue.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Monthly Earnings</p>
                <p className="text-xs text-gray-500">{revenueStats.monthlyAppointments} jobs completed</p>
                {revenueStats.monthlyLostRevenue > 0 && (
                  <p className="text-xs text-red-500 mt-1">-${revenueStats.monthlyLostRevenue.toFixed(0)} lost</p>
                )}
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${revenueStats.avgRevenuePerAppointment.toFixed(0)}</p>
                <p className="text-xs text-gray-600 mt-1">Avg per Job</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{revenueStats.completionRate.toFixed(0)}%</p>
                <p className="text-xs text-gray-600 mt-1">Completion Rate</p>
              </div>
            </div>
            </>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      {performanceData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Insights</h3>

          <div className="grid gap-3 text-sm">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Dogs per day (30-day avg)</span>
              <span className="font-semibold text-gray-900">
                {performanceData.insights.dogsPerDay.user30Day.toFixed(1)}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average energy load</span>
              <span className="font-semibold text-gray-900">
                {performanceData.insights.energyLoad.userAvg.toFixed(1)}
              </span>
            </div>

            {performanceData.insights.driveTime.userAvg !== null && (
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-600">Avg drive time between stops</span>
                <span className="font-semibold text-gray-900">
                  {performanceData.insights.driveTime.userAvg} min
                </span>
              </div>
            )}

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Completion rate</span>
              <span className="font-semibold text-gray-900">
                {(100 - performanceData.insights.cancellationRate.user).toFixed(0)}%
              </span>
            </div>

            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Large dogs (avg per day)</span>
              <span className="font-semibold text-gray-900">
                {performanceData.insights.largeDogs.userAvg.toFixed(1)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Weekly Summary */}
      {performanceData?.weekly && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">This Week Summary</h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-700">{performanceData.weekly.dogsGroomed}</p>
              <p className="text-xs text-gray-600 mt-1">Dogs Groomed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-700">{performanceData.weekly.daysWorked}</p>
              <p className="text-xs text-gray-600 mt-1">Days Worked</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-700">{performanceData.weekly.avgDogsPerDay.toFixed(1)}</p>
              <p className="text-xs text-gray-600 mt-1">Avg Dogs/Day</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-700">${performanceData.weekly.avgRevenuePerDay.toFixed(0)}</p>
              <p className="text-xs text-gray-600 mt-1">Avg Revenue/Day</p>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!revenueStats && !performanceData && !isLoading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No analytics yet</h3>
          <p className="text-gray-600 mb-4">
            Complete some appointments to start seeing your business analytics.
          </p>
          <Link href="/app/appointments/new" className="btn bg-[#A5744A] hover:bg-[#8B6239] text-white border-0">
            Schedule an Appointment
          </Link>
        </div>
      )}
    </div>
  );
}
