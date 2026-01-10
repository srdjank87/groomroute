/**
 * Unified Workload Assessment System
 *
 * Provides consistent day intensity evaluation across the app.
 * Takes into account appointment count, total grooming minutes,
 * large dogs, and whether working with an assistant.
 */

export type WorkloadLevel =
  | "day-off"      // No appointments
  | "light"        // Easy day, plenty of breathing room
  | "moderate"     // Normal workload, manageable
  | "busy"         // Above average, requires focus
  | "heavy"        // Challenging day, limited flexibility
  | "overloaded";  // Too much - consider relief options

export interface WorkloadInput {
  appointmentCount: number;
  totalMinutes: number;         // Total grooming time in minutes
  largeDogCount: number;        // Dogs over 50 lbs
  hasAssistant: boolean;        // Working with bather/assistant
  completedCount?: number;      // Already completed (for remaining calculation)
}

export interface WorkloadAssessment {
  level: WorkloadLevel;
  label: string;              // Display label (e.g., "Busy Day")
  message: string;            // Calm, supportive message
  color: string;              // Tailwind color class (e.g., "bg-amber-500")
  textColor: string;          // Text color class
  emoji: string;              // Status emoji
  showCalmLink: boolean;      // Whether to show link to Calm Center
  stressPoints: string[];     // Specific concerns for the day
  workloadScore: number;      // Numeric score 0-100 for comparison
}

// Thresholds for solo groomer (baseline)
const SOLO_THRESHOLDS = {
  light: { maxAppointments: 3, maxMinutes: 180 },      // Up to 3 appointments or 3 hours
  moderate: { maxAppointments: 5, maxMinutes: 300 },   // Up to 5 appointments or 5 hours
  busy: { maxAppointments: 7, maxMinutes: 420 },       // Up to 7 appointments or 7 hours
  heavy: { maxAppointments: 9, maxMinutes: 540 },      // Up to 9 appointments or 9 hours
  // Above heavy = overloaded
};

// Assistant multiplier - with help, capacity increases by ~40%
const ASSISTANT_MULTIPLIER = 1.4;

// Large dog penalty - each large dog adds "weight" to the day
const LARGE_DOG_WEIGHT = 0.3; // Each large dog counts as 0.3 extra appointments in terms of fatigue

/**
 * Calculate effective appointment count considering large dogs
 */
function getEffectiveAppointmentCount(appointmentCount: number, largeDogCount: number): number {
  return appointmentCount + (largeDogCount * LARGE_DOG_WEIGHT);
}

/**
 * Get thresholds adjusted for assistant
 */
function getAdjustedThresholds(hasAssistant: boolean) {
  const multiplier = hasAssistant ? ASSISTANT_MULTIPLIER : 1;
  return {
    light: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.light.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.light.maxMinutes * multiplier),
    },
    moderate: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.moderate.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.moderate.maxMinutes * multiplier),
    },
    busy: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.busy.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.busy.maxMinutes * multiplier),
    },
    heavy: {
      maxAppointments: Math.floor(SOLO_THRESHOLDS.heavy.maxAppointments * multiplier),
      maxMinutes: Math.floor(SOLO_THRESHOLDS.heavy.maxMinutes * multiplier),
    },
  };
}

/**
 * Calculate a numeric workload score (0-100)
 * Used for comparison and progress tracking
 */
function calculateWorkloadScore(input: WorkloadInput): number {
  const thresholds = getAdjustedThresholds(input.hasAssistant);
  const effectiveCount = getEffectiveAppointmentCount(input.appointmentCount, input.largeDogCount);

  // Score based on effective appointment count relative to heavy threshold
  const appointmentScore = (effectiveCount / thresholds.heavy.maxAppointments) * 100;

  // Score based on minutes relative to heavy threshold
  const minuteScore = (input.totalMinutes / thresholds.heavy.maxMinutes) * 100;

  // Take the higher of the two (limiting factor)
  return Math.min(100, Math.max(appointmentScore, minuteScore));
}

/**
 * Determine workload level based on inputs
 */
function determineWorkloadLevel(input: WorkloadInput): WorkloadLevel {
  if (input.appointmentCount === 0) {
    return "day-off";
  }

  const thresholds = getAdjustedThresholds(input.hasAssistant);
  const effectiveCount = getEffectiveAppointmentCount(input.appointmentCount, input.largeDogCount);

  // Check appointment count and total minutes against thresholds
  // Use whichever metric pushes the level higher (the limiting factor)

  if (effectiveCount <= thresholds.light.maxAppointments && input.totalMinutes <= thresholds.light.maxMinutes) {
    return "light";
  }

  if (effectiveCount <= thresholds.moderate.maxAppointments && input.totalMinutes <= thresholds.moderate.maxMinutes) {
    return "moderate";
  }

  if (effectiveCount <= thresholds.busy.maxAppointments && input.totalMinutes <= thresholds.busy.maxMinutes) {
    return "busy";
  }

  if (effectiveCount <= thresholds.heavy.maxAppointments && input.totalMinutes <= thresholds.heavy.maxMinutes) {
    return "heavy";
  }

  return "overloaded";
}

/**
 * Get stress points for the day
 */
function getStressPoints(input: WorkloadInput, level: WorkloadLevel): string[] {
  const points: string[] = [];
  const thresholds = getAdjustedThresholds(input.hasAssistant);

  // Large dog concerns
  if (input.largeDogCount >= 3) {
    points.push(`${input.largeDogCount} large dogs today - pace yourself`);
  } else if (input.largeDogCount >= 2) {
    points.push(`${input.largeDogCount} large dogs scheduled`);
  }

  // Long day concerns
  if (input.totalMinutes > thresholds.busy.maxMinutes) {
    const hours = Math.round(input.totalMinutes / 60);
    points.push(`${hours}+ hours of grooming time`);
  }

  // Back-to-back concerns (implicit from high count)
  if (input.appointmentCount > thresholds.moderate.maxAppointments) {
    points.push("Busy schedule with limited breaks");
  }

  // Overload warning
  if (level === "overloaded") {
    points.push("Consider rescheduling or adding buffer time");
  }

  return points;
}

/**
 * Get display properties for each workload level
 */
function getLevelDisplay(level: WorkloadLevel, hasAssistant: boolean): {
  label: string;
  message: string;
  color: string;
  textColor: string;
  emoji: string;
  showCalmLink: boolean;
} {
  switch (level) {
    case "day-off":
      return {
        label: "Day Off",
        message: "Enjoy your rest day",
        color: "bg-gray-400",
        textColor: "text-gray-600",
        emoji: "🌴",
        showCalmLink: false,
      };

    case "light":
      return {
        label: "Light Day",
        message: hasAssistant
          ? "Easy day with your assistant - smooth sailing ahead"
          : "A light, manageable day ahead",
        color: "bg-emerald-500",
        textColor: "text-emerald-600",
        emoji: "🌿",
        showCalmLink: false,
      };

    case "moderate":
      return {
        label: "Moderate Day",
        message: hasAssistant
          ? "Normal workload - you and your assistant have this handled"
          : "A balanced day with good pacing",
        color: "bg-blue-500",
        textColor: "text-blue-600",
        emoji: "👍",
        showCalmLink: false,
      };

    case "busy":
      return {
        label: "Busy Day",
        message: hasAssistant
          ? "Full schedule today, but with your assistant you've got this"
          : "Active day ahead - stay focused and pace yourself",
        color: "bg-amber-500",
        textColor: "text-amber-600",
        emoji: "⚡",
        showCalmLink: true,
      };

    case "heavy":
      return {
        label: "Heavy Day",
        message: hasAssistant
          ? "Demanding schedule - you'll both need to stay on pace"
          : "Challenging day - prioritize breaks and self-care",
        color: "bg-orange-500",
        textColor: "text-orange-600",
        emoji: "🔥",
        showCalmLink: true,
      };

    case "overloaded":
      return {
        label: "Overloaded",
        message: hasAssistant
          ? "Even with help, this schedule is intense - consider adjustments"
          : "This schedule is too heavy - let's find ways to lighten it",
        color: "bg-red-500",
        textColor: "text-red-600",
        emoji: "🚨",
        showCalmLink: true,
      };
  }
}

/**
 * Main function: Assess workload and return full assessment
 */
export function assessWorkload(input: WorkloadInput): WorkloadAssessment {
  // If we have completed appointments, calculate remaining workload
  const remainingCount = input.completedCount !== undefined
    ? input.appointmentCount - input.completedCount
    : input.appointmentCount;

  // Estimate remaining minutes (proportional)
  const remainingMinutes = input.completedCount !== undefined && input.appointmentCount > 0
    ? Math.round(input.totalMinutes * (remainingCount / input.appointmentCount))
    : input.totalMinutes;

  // Create adjusted input for remaining work
  const remainingInput: WorkloadInput = {
    ...input,
    appointmentCount: remainingCount,
    totalMinutes: remainingMinutes,
    // Large dogs should be proportionally adjusted too (rough estimate)
    largeDogCount: input.completedCount !== undefined && input.appointmentCount > 0
      ? Math.round(input.largeDogCount * (remainingCount / input.appointmentCount))
      : input.largeDogCount,
  };

  const level = determineWorkloadLevel(remainingInput);
  const display = getLevelDisplay(level, input.hasAssistant);
  const stressPoints = getStressPoints(remainingInput, level);
  const workloadScore = calculateWorkloadScore(remainingInput);

  return {
    level,
    label: display.label,
    message: display.message,
    color: display.color,
    textColor: display.textColor,
    emoji: display.emoji,
    showCalmLink: display.showCalmLink,
    stressPoints,
    workloadScore,
  };
}

/**
 * Convenience function: Assess from appointment list
 */
export function assessWorkloadFromAppointments(
  appointments: Array<{ serviceMinutes: number; pet?: { weight?: number | null } | null }>,
  hasAssistant: boolean,
  completedCount?: number
): WorkloadAssessment {
  const LARGE_DOG_THRESHOLD = 50; // lbs

  const totalMinutes = appointments.reduce((sum, apt) => sum + apt.serviceMinutes, 0);
  const largeDogCount = appointments.filter(
    apt => apt.pet?.weight && apt.pet.weight > LARGE_DOG_THRESHOLD
  ).length;

  return assessWorkload({
    appointmentCount: appointments.length,
    totalMinutes,
    largeDogCount,
    hasAssistant,
    completedCount,
  });
}
