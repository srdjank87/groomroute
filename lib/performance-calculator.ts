/**
 * Performance Calculator
 *
 * Calculates performance metrics and generates supportive messaging
 * based on industry benchmarks. Uses energy-weighted workload calculations
 * and adjusts benchmarks based on assistant status.
 */

import {
  getDogEnergyCost,
  getDogSize,
  getDogsPerDayComparison,
  getEnergyLoadComparison,
  getRouteEfficiencyRating,
  INDUSTRY_BENCHMARKS,
  PERFORMANCE_HEADLINES,
  ROUTE_EFFICIENCY,
  SOFT_COMPARISONS,
  type DogSize,
  type HeadlineKey,
  type RouteEfficiencyRating,
} from "./benchmarks";

// Types for performance data
export interface DogsBySize {
  small: number;
  medium: number;
  large: number;
  giant: number;
}

export interface TodayPerformance {
  headline: string;
  subtext: string;
  softComparison: string;
  dogsGroomed: number;
  dogsScheduled: number;
  dogsBySize: DogsBySize;
  energyLoad: number;
  largeDogCount: number;
  revenue: number;
  avgDriveMinutes: number | null;
  estimatedFinish: string | null;
  hasAssistant: boolean;
  dayStatus: "not-started" | "in-progress" | "completed";
}

export interface WeeklyPerformance {
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

export interface IndustryInsights {
  dogsPerDay: {
    industry: string;
    user30Day: number;
    comparison: string;
  };
  energyLoad: {
    industry: string;
    userAvg: number;
    comparison: string;
  };
  driveTime: {
    target: string;
    userAvg: number | null;
    comparison: string;
  };
  cancellationRate: {
    typical: string;
    user: number;
    comparison: string;
  };
  largeDogs: {
    typical: string;
    userAvg: number;
    comparison: string;
  };
}

export interface RouteEfficiency {
  rating: string;
  ratingKey: RouteEfficiencyRating;
  avgMinutesBetweenStops: number;
  totalDriveMinutes: number;
  totalStops: number;
}

// Input types for calculations
export interface AppointmentData {
  id: string;
  status: string;
  price: number | null;
  startAt: Date;
  serviceMinutes: number;
  pet?: {
    weight: number | null;
  } | null;
}

export interface RouteData {
  totalDriveMinutes: number | null;
  totalDistanceMeters: number | null;
  hasAssistant: boolean;
}

/**
 * Calculate dogs by size from appointments
 */
export function calculateDogsBySize(appointments: AppointmentData[]): DogsBySize {
  const result: DogsBySize = { small: 0, medium: 0, large: 0, giant: 0 };

  for (const apt of appointments) {
    const size = getDogSize(apt.pet?.weight);
    result[size]++;
  }

  return result;
}

/**
 * Calculate total energy load from appointments
 */
export function calculateEnergyLoad(appointments: AppointmentData[]): number {
  let total = 0;
  for (const apt of appointments) {
    total += getDogEnergyCost(apt.pet?.weight);
  }
  return Math.round(total * 10) / 10; // Round to 1 decimal
}

/**
 * Count large and giant dogs
 */
export function countLargeDogs(appointments: AppointmentData[]): number {
  let count = 0;
  for (const apt of appointments) {
    const size = getDogSize(apt.pet?.weight);
    if (size === "large" || size === "giant") {
      count++;
    }
  }
  return count;
}

/**
 * Calculate total revenue from appointments
 */
export function calculateRevenue(
  appointments: AppointmentData[],
  statusFilter?: string[]
): number {
  return appointments
    .filter((apt) => !statusFilter || statusFilter.includes(apt.status))
    .reduce((sum, apt) => sum + (apt.price || 0), 0);
}

/**
 * Estimate finish time based on appointments
 */
export function estimateFinishTime(appointments: AppointmentData[]): string | null {
  if (appointments.length === 0) return null;

  // Find the last appointment
  const sorted = [...appointments].sort(
    (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
  );
  const lastApt = sorted[0];

  // Calculate end time (start + service duration)
  const endTime = new Date(lastApt.startAt);
  endTime.setMinutes(endTime.getMinutes() + lastApt.serviceMinutes);

  // Format as time string
  const hours = endTime.getUTCHours();
  const minutes = endTime.getUTCMinutes();
  const period = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Select appropriate headline based on performance context
 */
export function selectHeadline(
  dogsGroomed: number,
  dogsScheduled: number,
  energyLoad: number,
  largeDogCount: number,
  avgDriveMinutes: number | null,
  hasAssistant: boolean,
  dayStatus: "not-started" | "in-progress" | "completed"
): HeadlineKey {
  // Day hasn't started
  if (dayStatus === "not-started") {
    return "gettingStarted";
  }

  // All done
  if (dayStatus === "completed" || dogsGroomed === dogsScheduled) {
    // Check if finished early (would need time context)
    return "smoothFinish";
  }

  // With assistant - use team headlines
  if (hasAssistant && dogsGroomed >= 6) {
    return "teamDay";
  }
  if (hasAssistant && dogsGroomed >= 4) {
    return "teamFlow";
  }

  // Heavy lifting day (lots of large dogs)
  if (largeDogCount >= 2) {
    return "heavyLifting";
  }

  // All small dogs
  if (largeDogCount === 0 && dogsGroomed >= 4) {
    return "allSmall";
  }

  // Check pace comparison
  const comparison = getDogsPerDayComparison(dogsGroomed, hasAssistant);

  if (comparison === "light") {
    return "calmDay";
  }
  if (comparison === "heavy") {
    return "strongFlow";
  }

  // Long drives but managing
  if (avgDriveMinutes && avgDriveMinutes > INDUSTRY_BENCHMARKS.driveMinutes.good) {
    return "steadyProgress";
  }

  // Good mix of sizes
  if (largeDogCount >= 1 && largeDogCount <= 2) {
    return "goodMix";
  }

  // Default great day
  return "greatDay";
}

/**
 * Get soft comparison text for dogs per day
 */
export function getSoftComparisonText(
  dogsGroomed: number,
  hasAssistant: boolean
): string {
  const comparison = getDogsPerDayComparison(dogsGroomed, hasAssistant);
  const comparisons = hasAssistant
    ? SOFT_COMPARISONS.dogsPerDay.withAssistant
    : SOFT_COMPARISONS.dogsPerDay.solo;

  if (comparison === "light") return comparisons.lightDay;
  if (comparison === "aboveAvg") return comparisons.aboveAvg;
  return comparisons.inZone;
}

/**
 * Calculate today's performance metrics
 */
export function calculateTodayPerformance(
  allAppointments: AppointmentData[],
  completedAppointments: AppointmentData[],
  route: RouteData | null,
  hasAssistant: boolean
): TodayPerformance {
  const dogsScheduled = allAppointments.length;
  const dogsGroomed = completedAppointments.length;
  const dogsBySize = calculateDogsBySize(allAppointments);
  const energyLoad = calculateEnergyLoad(allAppointments);
  const largeDogCount = countLargeDogs(allAppointments);
  const revenue = calculateRevenue(completedAppointments);

  // Calculate average drive time if we have route data and multiple stops
  let avgDriveMinutes: number | null = null;
  if (route?.totalDriveMinutes && dogsScheduled > 1) {
    avgDriveMinutes = Math.round(route.totalDriveMinutes / (dogsScheduled - 1));
  }

  const estimatedFinish = estimateFinishTime(allAppointments);

  // Determine day status
  let dayStatus: "not-started" | "in-progress" | "completed" = "not-started";
  if (dogsGroomed > 0 && dogsGroomed < dogsScheduled) {
    dayStatus = "in-progress";
  } else if (dogsGroomed > 0 && dogsGroomed >= dogsScheduled) {
    dayStatus = "completed";
  } else if (dogsScheduled > 0) {
    // Check if first appointment has started
    const now = new Date();
    const firstApt = [...allAppointments].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    )[0];
    if (firstApt && new Date(firstApt.startAt) <= now) {
      dayStatus = "in-progress";
    }
  }

  // Select headline and get text
  const headlineKey = selectHeadline(
    dogsGroomed,
    dogsScheduled,
    energyLoad,
    largeDogCount,
    avgDriveMinutes,
    hasAssistant,
    dayStatus
  );
  const { headline, subtext } = PERFORMANCE_HEADLINES[headlineKey];
  const softComparison = getSoftComparisonText(
    dogsScheduled > 0 ? dogsScheduled : dogsGroomed,
    hasAssistant
  );

  return {
    headline,
    subtext,
    softComparison,
    dogsGroomed,
    dogsScheduled,
    dogsBySize,
    energyLoad,
    largeDogCount,
    revenue,
    avgDriveMinutes,
    estimatedFinish,
    hasAssistant,
    dayStatus,
  };
}

/**
 * Calculate weekly performance metrics
 */
export function calculateWeeklyPerformance(
  weeklyAppointments: AppointmentData[],
  weeklyRoutes: { totalDriveMinutes: number | null; routeDate: Date }[],
  daysWorked: number
): WeeklyPerformance {
  const dogsGroomed = weeklyAppointments.length;
  const dogsBySize = calculateDogsBySize(weeklyAppointments);
  const totalEnergyLoad = calculateEnergyLoad(weeklyAppointments);
  const revenue = calculateRevenue(weeklyAppointments);

  const avgDogsPerDay = daysWorked > 0 ? Math.round((dogsGroomed / daysWorked) * 10) / 10 : 0;
  const avgEnergyPerDay = daysWorked > 0 ? Math.round((totalEnergyLoad / daysWorked) * 10) / 10 : 0;
  const avgRevenuePerDay = daysWorked > 0 ? Math.round(revenue / daysWorked) : 0;

  // Calculate average drive time per stop across all routes
  let avgDriveMinutesPerStop: number | null = null;
  const totalDriveMinutes = weeklyRoutes.reduce(
    (sum, r) => sum + (r.totalDriveMinutes || 0),
    0
  );
  if (totalDriveMinutes > 0 && dogsGroomed > daysWorked) {
    // Total stops minus starting points (1 per day)
    const totalStops = dogsGroomed - daysWorked;
    if (totalStops > 0) {
      avgDriveMinutesPerStop = Math.round(totalDriveMinutes / totalStops);
    }
  }

  // Select weekly headline
  const energyComparison = getEnergyLoadComparison(avgEnergyPerDay, false);
  let headline: string;
  let subtext: string;

  if (avgDogsPerDay >= 5 && avgRevenuePerDay >= 500) {
    headline = "Strong Week!";
    subtext = "You maintained a calm, profitable rhythm.";
  } else if (avgDogsPerDay >= 4) {
    headline = "Steady Week";
    subtext = "Consistent and controlled.";
  } else if (avgDogsPerDay >= 2) {
    headline = "Balanced Week";
    subtext = "Good pace with time for yourself.";
  } else {
    headline = "Light Week";
    subtext = "Rest is productive too.";
  }

  return {
    headline,
    subtext,
    dogsGroomed,
    dogsBySize,
    totalEnergyLoad,
    revenue,
    daysWorked,
    avgDogsPerDay,
    avgEnergyPerDay,
    avgDriveMinutesPerStop,
    avgRevenuePerDay,
  };
}

/**
 * Generate industry insights comparisons
 */
export function generateIndustryInsights(
  avgDogsPerDay: number,
  avgEnergyPerDay: number,
  avgDriveMinutes: number | null,
  cancellationRate: number,
  avgLargeDogsPerDay: number,
  hasAssistant: boolean
): IndustryInsights {
  const benchmarks = hasAssistant
    ? INDUSTRY_BENCHMARKS.dogsPerDay.withAssistant
    : INDUSTRY_BENCHMARKS.dogsPerDay.solo;

  // Dogs per day comparison
  const dogsComparison = getDogsPerDayComparison(Math.round(avgDogsPerDay), hasAssistant);
  const dogsComparisonText =
    dogsComparison === "inZone"
      ? "Right in the strong zone"
      : dogsComparison === "aboveAvg"
        ? "Above typical pace"
        : dogsComparison === "light"
          ? "Lighter than typical"
          : "Heavy workload";

  // Drive time comparison
  let driveComparison = "No route data";
  if (avgDriveMinutes !== null) {
    if (avgDriveMinutes <= INDUSTRY_BENCHMARKS.driveMinutes.excellent) {
      driveComparison = "Excellent - minimal windshield time";
    } else if (avgDriveMinutes <= INDUSTRY_BENCHMARKS.driveMinutes.good) {
      driveComparison = "Good - on target";
    } else if (avgDriveMinutes <= INDUSTRY_BENCHMARKS.driveMinutes.acceptable) {
      driveComparison = "Acceptable - room to optimize";
    } else {
      driveComparison = "Long drives - consider tighter routing";
    }
  }

  // Cancellation rate comparison (industry average ~10-15%)
  let cancellationComparison = "No data";
  if (cancellationRate <= 5) {
    cancellationComparison = "Excellent - lower than typical";
  } else if (cancellationRate <= 12) {
    cancellationComparison = "Good - around industry average";
  } else {
    cancellationComparison = "Higher than typical";
  }

  // Large dogs comparison
  let largeDogsComparison = "Safe zone";
  if (avgLargeDogsPerDay <= INDUSTRY_BENCHMARKS.largeDogs.typical) {
    largeDogsComparison = "Safe zone - sustainable";
  } else {
    largeDogsComparison = "High - watch your energy";
  }

  return {
    dogsPerDay: {
      industry: hasAssistant
        ? `${benchmarks.typical.min}-${benchmarks.typical.max} with assistant`
        : `${benchmarks.typical.min}-${benchmarks.typical.max} solo`,
      user30Day: Math.round(avgDogsPerDay * 10) / 10,
      comparison: dogsComparisonText,
    },
    energyLoad: {
      industry: "4-7 energy units/day (solo)",
      userAvg: Math.round(avgEnergyPerDay * 10) / 10,
      comparison:
        avgEnergyPerDay <= 7 ? "Balanced workload" : "Heavy workload",
    },
    driveTime: {
      target: "<20 min between stops",
      userAvg: avgDriveMinutes,
      comparison: driveComparison,
    },
    cancellationRate: {
      typical: "10-15%",
      user: Math.round(cancellationRate * 10) / 10,
      comparison: cancellationComparison,
    },
    largeDogs: {
      typical: "2/day max recommended",
      userAvg: Math.round(avgLargeDogsPerDay * 10) / 10,
      comparison: largeDogsComparison,
    },
  };
}

/**
 * Calculate route efficiency metrics
 */
export function calculateRouteEfficiency(
  totalDriveMinutes: number,
  totalStops: number
): RouteEfficiency {
  const avgMinutesBetweenStops =
    totalStops > 1 ? Math.round(totalDriveMinutes / (totalStops - 1)) : 0;

  const ratingKey = getRouteEfficiencyRating(avgMinutesBetweenStops);
  const rating = ROUTE_EFFICIENCY[ratingKey].label;

  return {
    rating,
    ratingKey,
    avgMinutesBetweenStops,
    totalDriveMinutes,
    totalStops,
  };
}
