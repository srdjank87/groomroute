/**
 * Industry Benchmarks for Mobile Pet Groomers
 *
 * Based on market research from r/doggrooming and mobile groomer surveys.
 * These benchmarks inform performance insights with supportive, non-judgmental messaging.
 */

// Dog size categories and their energy cost multipliers
export const DOG_SIZE_ENERGY = {
  small: { maxWeight: 20, energyCost: 1, label: "Small" },
  medium: { maxWeight: 50, energyCost: 1.5, label: "Medium" },
  large: { maxWeight: 80, energyCost: 2, label: "Large" },
  giant: { maxWeight: Infinity, energyCost: 3, label: "Giant" },
} as const;

/**
 * Assistant Mode Adjustments
 *
 * When working with a bather/assistant:
 * - Service times are reduced (bather handles bathing/drying while groomer preps)
 * - More appointments can be scheduled
 * - Energy load per dog is effectively lower (shared physical work)
 */
export const ASSISTANT_MODE = {
  // Service time reduction factor (0.75 = 25% faster with assistant)
  serviceTimeMultiplier: 0.75,

  // Energy cost reduction when assistant helps with heavy lifting
  energyCostMultiplier: 0.8,

  // Extra capacity (in dogs per day) when working with assistant
  extraDailyCapacity: 3,

  // Standard service buffer time in minutes (travel + setup)
  bufferMinutes: {
    solo: 15,
    withAssistant: 12, // Slightly faster transitions with help
  },
} as const;

/**
 * Get adjusted service duration based on assistant status
 */
export function getAdjustedServiceMinutes(
  baseMinutes: number,
  hasAssistant: boolean
): number {
  if (hasAssistant) {
    return Math.round(baseMinutes * ASSISTANT_MODE.serviceTimeMultiplier);
  }
  return baseMinutes;
}

/**
 * Get adjusted energy cost based on assistant status
 */
export function getAdjustedEnergyCost(
  baseCost: number,
  hasAssistant: boolean
): number {
  if (hasAssistant) {
    return Math.round(baseCost * ASSISTANT_MODE.energyCostMultiplier * 10) / 10;
  }
  return baseCost;
}

/**
 * Get buffer time between appointments based on assistant status
 */
export function getBufferMinutes(hasAssistant: boolean): number {
  return hasAssistant
    ? ASSISTANT_MODE.bufferMinutes.withAssistant
    : ASSISTANT_MODE.bufferMinutes.solo;
}

/**
 * Calculate additional booking capacity when working with assistant
 */
export function getAdditionalCapacity(
  currentAppointments: number,
  hasAssistant: boolean
): { canAddMore: boolean; additionalSlots: number; message: string } {
  if (!hasAssistant) {
    return {
      canAddMore: false,
      additionalSlots: 0,
      message: "",
    };
  }

  const assistantMax = INDUSTRY_BENCHMARKS.dogsPerDay.withAssistant.typical.max;
  const currentCapacity = assistantMax;
  const additionalSlots = Math.max(0, currentCapacity - currentAppointments);

  if (additionalSlots > 0) {
    return {
      canAddMore: true,
      additionalSlots,
      message: `With your assistant, you have capacity for ${additionalSlots} more appointment${additionalSlots > 1 ? "s" : ""} today`,
    };
  }

  return {
    canAddMore: false,
    additionalSlots: 0,
    message: "At capacity for team day",
  };
}

export type DogSize = keyof typeof DOG_SIZE_ENERGY;

// Get dog size category from weight
export function getDogSize(weightLbs: number | null | undefined): DogSize {
  if (!weightLbs) return "medium"; // Default to medium if unknown
  if (weightLbs <= DOG_SIZE_ENERGY.small.maxWeight) return "small";
  if (weightLbs <= DOG_SIZE_ENERGY.medium.maxWeight) return "medium";
  if (weightLbs <= DOG_SIZE_ENERGY.large.maxWeight) return "large";
  return "giant";
}

// Get energy cost for a dog based on weight
export function getDogEnergyCost(weightLbs: number | null | undefined): number {
  const size = getDogSize(weightLbs);
  return DOG_SIZE_ENERGY[size].energyCost;
}

// Industry benchmarks from market research
export const INDUSTRY_BENCHMARKS = {
  // Dogs per day (raw count)
  dogsPerDay: {
    solo: {
      light: 3,
      typical: { min: 4, max: 6 },
      busy: 7,
      max: 8,
    },
    withAssistant: {
      light: 5,
      typical: { min: 6, max: 9 },
      busy: 10,
      max: 12,
    },
  },

  // Energy load per day (weighted by dog size)
  energyPerDay: {
    solo: {
      light: 3,
      typical: { min: 4, max: 7 },
      heavy: 8,
      max: 10,
    },
    withAssistant: {
      light: 5,
      typical: { min: 6, max: 10 },
      heavy: 12,
      max: 15,
    },
  },

  // Large dogs per day (solo)
  largeDogs: {
    typical: 2, // Most groomers limit to 2 large/giant dogs
    max: 3, // Pushing it
  },

  // Drive time between appointments (minutes)
  driveMinutes: {
    excellent: 15,
    good: 20,
    acceptable: 30,
    poor: 45,
  },

  // Revenue per day ($)
  revenuePerDay: {
    typical: { min: 400, max: 600 },
    strong: 650,
    exceptional: 800,
  },

  // Finish time (hour in 24h format)
  finishTime: {
    early: 16, // 4 PM
    typical: 17, // 5 PM
    late: 18, // 6 PM
    overtime: 19, // 7 PM+
  },

  // Break recommendations
  breaks: {
    afterDogs: 3, // Suggest break after 3 dogs
    afterLargeDog: true, // Suggest break after large/giant dog
    afterHours: 4, // Suggest break after 4+ continuous hours
    afterEnergyLoad: 5, // Suggest break when energy load exceeds 5
    gapMinutesForLunch: 90, // 90+ min gap = suggest real lunch
    lunchDurationMinutes: 30,
    shortBreakMinutes: 15,
  },
} as const;

// Supportive Achievement Headlines
export type HeadlineKey =
  | "greatDay"
  | "calmDay"
  | "strongFlow"
  | "excellentRhythm"
  | "steadyProgress"
  | "smoothFinish"
  | "gettingStarted"
  | "heavyLifting"
  | "goodMix"
  | "allSmall"
  | "teamDay"
  | "teamFlow";

export const PERFORMANCE_HEADLINES: Record<
  HeadlineKey,
  { headline: string; subtext: string }
> = {
  // Standard headlines
  greatDay: {
    headline: "Great Day!",
    subtext:
      "You worked a healthy pace and stayed in control of your schedule.",
  },
  calmDay: {
    headline: "Calm Day",
    subtext: "Light schedule - time for yourself.",
  },
  strongFlow: {
    headline: "Strong Flow!",
    subtext: "Busy day handled well.",
  },
  excellentRhythm: {
    headline: "Excellent Rhythm",
    subtext: "Done early - you earned it.",
  },
  steadyProgress: {
    headline: "Steady Progress",
    subtext: "Longer routes today, but you managed well.",
  },
  smoothFinish: {
    headline: "Smooth Finish",
    subtext: "Every appointment completed successfully.",
  },
  gettingStarted: {
    headline: "Day Ahead",
    subtext: "Your schedule is ready and waiting.",
  },

  // Size-aware headlines
  heavyLifting: {
    headline: "Heavy Lifting Today",
    subtext: "Big dogs take extra energy - well done.",
  },
  goodMix: {
    headline: "Good Mix",
    subtext: "Nice balance of sizes today.",
  },
  allSmall: {
    headline: "Light & Quick",
    subtext: "Small dogs all day - efficient schedule.",
  },

  // With assistant headlines
  teamDay: {
    headline: "Strong Team Day!",
    subtext: "You and your bather handled it well.",
  },
  teamFlow: {
    headline: "Great Team Flow",
    subtext: "Your assistant made the difference today.",
  },
};

// Soft comparison text (no shame, just context)
export const SOFT_COMPARISONS = {
  dogsPerDay: {
    solo: {
      inZone:
        "Most solo groomers handle 4-6 dogs/day. You're right in the strong zone.",
      aboveAvg: "You're working above the typical pace today.",
      lightDay: "A lighter day - nothing wrong with that.",
    },
    withAssistant: {
      inZone: "With a bather, 6-9 dogs/day is typical. You're right on track.",
      aboveAvg: "Great teamwork - above typical pace.",
      lightDay: "Lighter team day - still productive.",
    },
  },
  energyLoad: {
    balanced: "Good mix of sizes - energy well distributed.",
    heavy: "Heavy lifting today - big dogs take extra energy.",
    light: "Lighter energy load - mostly smaller dogs.",
  },
  largeDogs: {
    typical: "Most groomers limit large dogs to 2/day. You're in the safe zone.",
    high: "Multiple large dogs - that's a lot of lifting. Take care of yourself.",
  },
  driveTime: {
    excellent: "Your routing is tight - minimal windshield time.",
    good: "Drive times are right where they should be.",
    longer: "Longer drives today, but you're managing well.",
  },
  weekly: {
    strong: "Strong week! You maintained a calm, profitable rhythm.",
    steady: "Steady week - consistent and controlled.",
    light: "Lighter week - rest is productive too.",
  },
} as const;

// Route efficiency ratings based on avg minutes between stops
export const ROUTE_EFFICIENCY = {
  excellent: { maxMinutes: 18, label: "Excellent" },
  good: { maxMinutes: 25, label: "Good" },
  okay: { maxMinutes: 35, label: "Okay" },
  needsWork: { maxMinutes: Infinity, label: "Needs work" },
} as const;

export type RouteEfficiencyRating = keyof typeof ROUTE_EFFICIENCY;

export function getRouteEfficiencyRating(
  avgMinutesBetweenStops: number
): RouteEfficiencyRating {
  if (avgMinutesBetweenStops <= ROUTE_EFFICIENCY.excellent.maxMinutes)
    return "excellent";
  if (avgMinutesBetweenStops <= ROUTE_EFFICIENCY.good.maxMinutes) return "good";
  if (avgMinutesBetweenStops <= ROUTE_EFFICIENCY.okay.maxMinutes) return "okay";
  return "needsWork";
}

// Break suggestion messages
export const BREAK_MESSAGES = {
  afterDogs: {
    message: "Good stopping point - stretch your legs?",
    subtext: "You've completed {count} dogs.",
  },
  afterLargeDog: {
    message: "Big dog done - take 5?",
    subtext: "Large dogs take extra energy.",
  },
  longGap: {
    message: "You've got time - real lunch today?",
    subtext: "Next appointment in {minutes} minutes.",
  },
  continuous: {
    message: "You've been going strong - hydration check?",
    subtext: "Over {hours} hours without a break.",
  },
  heavyMorning: {
    message: "Heavy morning - rest before the next one?",
    subtext: "Energy load is high.",
  },
} as const;

// Wellness messages for end of day
export const WELLNESS_MESSAGES = {
  tookBreaks: "You took breaks today - that's protecting your career longevity.",
  noBreaks: "No breaks today - tomorrow, try to fit one in?",
  reminder: "Remember: rest isn't lazy, it's sustainable.",
} as const;

// Get benchmark comparison for dogs per day
export function getDogsPerDayComparison(
  count: number,
  hasAssistant: boolean
): "light" | "inZone" | "aboveAvg" | "heavy" {
  const benchmarks = hasAssistant
    ? INDUSTRY_BENCHMARKS.dogsPerDay.withAssistant
    : INDUSTRY_BENCHMARKS.dogsPerDay.solo;

  if (count < benchmarks.light) return "light";
  if (count >= benchmarks.typical.min && count <= benchmarks.typical.max)
    return "inZone";
  if (count > benchmarks.typical.max && count <= benchmarks.busy)
    return "aboveAvg";
  return "heavy";
}

// Get benchmark comparison for energy load
export function getEnergyLoadComparison(
  energyLoad: number,
  hasAssistant: boolean
): "light" | "balanced" | "heavy" {
  const benchmarks = hasAssistant
    ? INDUSTRY_BENCHMARKS.energyPerDay.withAssistant
    : INDUSTRY_BENCHMARKS.energyPerDay.solo;

  if (energyLoad < benchmarks.light) return "light";
  if (energyLoad >= benchmarks.typical.min && energyLoad <= benchmarks.typical.max)
    return "balanced";
  return "heavy";
}
