/**
 * Break Calculator
 *
 * Calculates smart break suggestions based on workload, schedule gaps,
 * and groomer wellness factors. Supports protecting groomer energy
 * and encouraging sustainable work practices.
 */

import {
  INDUSTRY_BENCHMARKS,
  BREAK_MESSAGES,
  getDogSize,
  getDogEnergyCost,
} from "./benchmarks";

export type BreakType = "lunch" | "short" | "hydration";

export interface BreakSuggestion {
  shouldSuggest: boolean;
  reason: string;
  message: string;
  subtext: string;
  breakType: BreakType;
  availableMinutes: number; // Time until next appointment
  suggestedDurationMinutes: number;
}

export interface BreakStats {
  breaksTakenToday: number;
  totalBreakMinutes: number;
  lastBreakTime: Date | null;
  scheduledBreaks: number;
}

export interface AppointmentForBreak {
  id: string;
  status: string;
  startAt: Date;
  serviceMinutes: number;
  pet?: {
    weight: number | null;
  } | null;
}

/**
 * Calculate break suggestion based on current state
 */
export function calculateBreakSuggestion(
  completedToday: number,
  lastBreakTime: Date | null,
  nextAppointmentTime: Date | null,
  energyLoadSoFar: number,
  lastDogWasLarge: boolean,
  currentTime: Date = new Date()
): BreakSuggestion {
  const breakBenchmarks = INDUSTRY_BENCHMARKS.breaks;

  // Default response - no suggestion
  const noSuggestion: BreakSuggestion = {
    shouldSuggest: false,
    reason: "none",
    message: "",
    subtext: "",
    breakType: "short",
    availableMinutes: 0,
    suggestedDurationMinutes: 0,
  };

  // If no next appointment, no suggestion needed
  if (!nextAppointmentTime) {
    return noSuggestion;
  }

  // Calculate available time until next appointment
  const availableMinutes = Math.floor(
    (nextAppointmentTime.getTime() - currentTime.getTime()) / 60000
  );

  // If less than 20 minutes available, don't suggest break
  if (availableMinutes < 20) {
    return noSuggestion;
  }

  // Check for long gap (90+ minutes) - suggest real lunch
  if (availableMinutes >= breakBenchmarks.gapMinutesForLunch) {
    return {
      shouldSuggest: true,
      reason: "longGap",
      message: BREAK_MESSAGES.longGap.message,
      subtext: BREAK_MESSAGES.longGap.subtext.replace(
        "{minutes}",
        availableMinutes.toString()
      ),
      breakType: "lunch",
      availableMinutes,
      suggestedDurationMinutes: breakBenchmarks.lunchDurationMinutes,
    };
  }

  // Check if just completed a large dog
  if (lastDogWasLarge && availableMinutes >= 20) {
    return {
      shouldSuggest: true,
      reason: "afterLargeDog",
      message: BREAK_MESSAGES.afterLargeDog.message,
      subtext: BREAK_MESSAGES.afterLargeDog.subtext,
      breakType: "short",
      availableMinutes,
      suggestedDurationMinutes: Math.min(
        breakBenchmarks.shortBreakMinutes,
        availableMinutes - 5
      ),
    };
  }

  // Check for high energy load
  if (energyLoadSoFar >= breakBenchmarks.afterEnergyLoad && availableMinutes >= 20) {
    return {
      shouldSuggest: true,
      reason: "heavyMorning",
      message: BREAK_MESSAGES.heavyMorning.message,
      subtext: BREAK_MESSAGES.heavyMorning.subtext,
      breakType: "short",
      availableMinutes,
      suggestedDurationMinutes: Math.min(
        breakBenchmarks.shortBreakMinutes,
        availableMinutes - 5
      ),
    };
  }

  // Check if completed threshold number of dogs
  if (
    completedToday >= breakBenchmarks.afterDogs &&
    completedToday % breakBenchmarks.afterDogs === 0 &&
    availableMinutes >= 20
  ) {
    return {
      shouldSuggest: true,
      reason: "afterDogs",
      message: BREAK_MESSAGES.afterDogs.message,
      subtext: BREAK_MESSAGES.afterDogs.subtext.replace(
        "{count}",
        completedToday.toString()
      ),
      breakType: "short",
      availableMinutes,
      suggestedDurationMinutes: Math.min(
        breakBenchmarks.shortBreakMinutes,
        availableMinutes - 5
      ),
    };
  }

  // Check for continuous work hours
  if (lastBreakTime) {
    const hoursSinceBreak =
      (currentTime.getTime() - lastBreakTime.getTime()) / (1000 * 60 * 60);

    if (hoursSinceBreak >= breakBenchmarks.afterHours && availableMinutes >= 20) {
      return {
        shouldSuggest: true,
        reason: "continuous",
        message: BREAK_MESSAGES.continuous.message,
        subtext: BREAK_MESSAGES.continuous.subtext.replace(
          "{hours}",
          Math.floor(hoursSinceBreak).toString()
        ),
        breakType: "hydration",
        availableMinutes,
        suggestedDurationMinutes: Math.min(10, availableMinutes - 5),
      };
    }
  }

  return noSuggestion;
}

/**
 * Find the next appointment from a list
 */
export function findNextAppointment(
  appointments: AppointmentForBreak[],
  currentTime: Date = new Date()
): AppointmentForBreak | null {
  const upcoming = appointments
    .filter(
      (apt) =>
        apt.status !== "COMPLETED" &&
        apt.status !== "CANCELLED" &&
        apt.status !== "NO_SHOW" &&
        new Date(apt.startAt) > currentTime
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

  return upcoming[0] || null;
}

/**
 * Find the last completed appointment
 */
export function findLastCompletedAppointment(
  appointments: AppointmentForBreak[]
): AppointmentForBreak | null {
  const completed = appointments
    .filter((apt) => apt.status === "COMPLETED")
    .sort(
      (a, b) => new Date(b.startAt).getTime() - new Date(a.startAt).getTime()
    );

  return completed[0] || null;
}

/**
 * Calculate energy load from completed appointments
 */
export function calculateCompletedEnergyLoad(
  appointments: AppointmentForBreak[]
): number {
  let total = 0;
  for (const apt of appointments) {
    if (apt.status === "COMPLETED") {
      total += getDogEnergyCost(apt.pet?.weight);
    }
  }
  return Math.round(total * 10) / 10;
}

/**
 * Check if the last completed dog was large or giant
 */
export function wasLastDogLarge(
  appointments: AppointmentForBreak[]
): boolean {
  const lastCompleted = findLastCompletedAppointment(appointments);
  if (!lastCompleted) return false;

  const size = getDogSize(lastCompleted.pet?.weight);
  return size === "large" || size === "giant";
}

/**
 * Count completed appointments for today
 */
export function countCompletedToday(
  appointments: AppointmentForBreak[]
): number {
  return appointments.filter((apt) => apt.status === "COMPLETED").length;
}

/**
 * Get full break suggestion from appointments list
 */
export function getBreakSuggestionFromAppointments(
  appointments: AppointmentForBreak[],
  lastBreakTime: Date | null,
  currentTime: Date = new Date()
): BreakSuggestion {
  const completedToday = countCompletedToday(appointments);
  const nextAppointment = findNextAppointment(appointments, currentTime);
  const energyLoadSoFar = calculateCompletedEnergyLoad(appointments);
  const lastDogWasLarge = wasLastDogLarge(appointments);

  return calculateBreakSuggestion(
    completedToday,
    lastBreakTime,
    nextAppointment ? new Date(nextAppointment.startAt) : null,
    energyLoadSoFar,
    lastDogWasLarge,
    currentTime
  );
}

/**
 * Generate wellness message for end of day
 */
export function getWellnessMessage(breaksTaken: number): string {
  if (breaksTaken >= 2) {
    return "You took breaks today - that's protecting your career longevity.";
  } else if (breaksTaken === 1) {
    return "One break today - try for two tomorrow to keep your energy up.";
  } else {
    return "No breaks today - tomorrow, try to fit one in? Rest isn't lazy, it's sustainable.";
  }
}

/**
 * Calculate break stats for today
 */
export function calculateBreakStats(
  breaks: {
    taken: boolean;
    takenAt: Date | null;
    durationMinutes: number | null;
    startTime: Date | null;
  }[]
): BreakStats {
  const takenBreaks = breaks.filter((b) => b.taken);
  const scheduledBreaks = breaks.filter((b) => b.startTime !== null).length;

  let lastBreakTime: Date | null = null;
  if (takenBreaks.length > 0) {
    const sorted = [...takenBreaks].sort((a, b) => {
      const timeA = a.takenAt?.getTime() || 0;
      const timeB = b.takenAt?.getTime() || 0;
      return timeB - timeA;
    });
    lastBreakTime = sorted[0].takenAt;
  }

  return {
    breaksTakenToday: takenBreaks.length,
    totalBreakMinutes: takenBreaks.reduce(
      (sum, b) => sum + (b.durationMinutes || 0),
      0
    ),
    lastBreakTime,
    scheduledBreaks,
  };
}

/**
 * Find optimal break slots in schedule
 */
export function findOptimalBreakSlots(
  appointments: AppointmentForBreak[],
  preferredBreakTime: number = 12 // Default noon
): { startTime: Date; duration: number; type: BreakType }[] {
  const slots: { startTime: Date; duration: number; type: BreakType }[] = [];

  // Sort by start time
  const sorted = [...appointments]
    .filter(
      (apt) =>
        apt.status !== "CANCELLED" && apt.status !== "NO_SHOW"
    )
    .sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );

  if (sorted.length < 2) return slots;

  // Find gaps between appointments
  for (let i = 0; i < sorted.length - 1; i++) {
    const currentEnd = new Date(sorted[i].startAt);
    currentEnd.setMinutes(currentEnd.getMinutes() + sorted[i].serviceMinutes);

    const nextStart = new Date(sorted[i + 1].startAt);
    const gapMinutes = Math.floor(
      (nextStart.getTime() - currentEnd.getTime()) / 60000
    );

    // If gap is 30+ minutes, suggest a break
    if (gapMinutes >= 30) {
      const breakStart = new Date(currentEnd);
      breakStart.setMinutes(breakStart.getMinutes() + 5); // 5 min buffer

      const breakType: BreakType =
        gapMinutes >= 60 ? "lunch" : gapMinutes >= 30 ? "short" : "hydration";

      const duration =
        breakType === "lunch"
          ? Math.min(30, gapMinutes - 15)
          : Math.min(15, gapMinutes - 10);

      slots.push({
        startTime: breakStart,
        duration,
        type: breakType,
      });
    }
  }

  return slots;
}
