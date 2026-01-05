/**
 * Daily Quotes for Mobile Pet Groomers
 *
 * A mix of motivational, funny, and dog-related quotes
 * to brighten the groomer's day. Rotates daily based on date.
 */

export const DAILY_QUOTES = [
  // Dog & Grooming Specific
  "A well-groomed dog is a happy dog. And you made that happen today.",
  "Behind every beautiful dog is a groomer who didn't give up on the matted fur.",
  "You're not just grooming dogs - you're creating confidence, one pup at a time.",
  "The dog may not remember the haircut, but the owner will remember you.",
  "Every dog deserves to feel like a show dog. That's what you do.",
  "Dematting builds character. Yours, not the dog's.",
  "You've wrestled more wiggly butts than a professional rodeo clown.",
  "Some heroes wear capes. You wear an apron covered in fur.",
  "The secret ingredient is always patience. And treats. Lots of treats.",
  "Another day, another dog who didn't want their nails trimmed.",

  // Motivational
  "You're doing better than you think you are.",
  "Progress, not perfection.",
  "Small steps still move you forward.",
  "Your pace is the right pace.",
  "Rest is productive. You've earned it.",
  "Consistency beats intensity. Keep showing up.",
  "The hard days make the good days better.",
  "You're building something sustainable, not just surviving.",
  "Trust your process. It's working.",
  "One client at a time. One day at a time.",

  // Business Wisdom
  "Your boundaries protect your energy. Honor them.",
  "Saying no to one thing means saying yes to yourself.",
  "You can't pour from an empty cup. Take care of you first.",
  "Quality over quantity. Every time.",
  "Your reputation is built one happy client at a time.",
  "Slow seasons are for rest. Busy seasons are for earning. Both are valid.",
  "The best business advice: take your breaks.",
  "Underpromise, overdeliver. You're already doing this.",
  "Your skills are valuable. Price accordingly.",
  "The clients who respect your time are the ones worth keeping.",

  // Funny & Light
  "If you can handle a nervous Chihuahua, you can handle anything life throws at you.",
  "Plot twist: the 'calm' dog was not, in fact, calm.",
  "Remember: the dog forgives you for the sanitary trim. Eventually.",
  "You've seen things. Impacted anal glands things.",
  "That awkward moment when the dog looks better than you after a long day.",
  "Somewhere out there, a Doodle owner thinks brushing is optional.",
  "Today's forecast: 100% chance of fur in your coffee.",
  "You didn't choose the groom life. The groom life chose you.",
  "May your clippers stay sharp and your dogs stay still.",
  "Another day of making dogs cute and owners cry happy tears.",

  // Self-Care Reminders
  "Your back thanks you for taking breaks.",
  "Drink water. Yes, even when you're busy.",
  "Stretch those grooming muscles. Your future self will thank you.",
  "A rested groomer is a better groomer.",
  "You deserve the same care you give those pups.",
  "Longevity in this career means protecting your body today.",
  "Take the lunch break. The dogs will still be there.",
  "Your mental health matters as much as any appointment.",
  "It's okay to have an off day. Tomorrow is a fresh start.",
  "You're allowed to be proud of yourself today.",
];

/**
 * Get the daily quote based on the current date
 * Uses a deterministic rotation so all users see the same quote each day
 */
export function getDailyQuote(): string {
  const today = new Date();
  // Create a seed based on year and day of year for consistent daily rotation
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Use day of year to pick quote (wraps around)
  const quoteIndex = dayOfYear % DAILY_QUOTES.length;
  return DAILY_QUOTES[quoteIndex];
}

/**
 * Get a random quote (for testing or special occasions)
 */
export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * DAILY_QUOTES.length);
  return DAILY_QUOTES[randomIndex];
}
