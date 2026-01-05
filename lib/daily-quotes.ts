/**
 * Hourly Quotes for Mobile Pet Groomers
 *
 * A mix of motivational, funny, and dog-related quotes
 * to brighten the groomer's day. Rotates hourly based on time.
 */

export const DAILY_QUOTES = [
  // Dog & Grooming Specific
  '"A well-groomed dog is a happy dog. And you made that happen today."',
  '"Behind every beautiful dog is a groomer who didn\'t give up on the matted fur."',
  '"You\'re not just grooming dogs - you\'re creating confidence, one pup at a time."',
  '"The dog may not remember the haircut, but the owner will remember you."',
  '"Every dog deserves to feel like a show dog. That\'s what you do."',
  '"Dematting builds character. Yours, not the dog\'s."',
  '"You\'ve wrestled more wiggly butts than a professional rodeo clown."',
  '"Some heroes wear capes. You wear an apron covered in fur."',
  '"The secret ingredient is always patience. And treats. Lots of treats."',
  '"Another day, another dog who didn\'t want their nails trimmed."',

  // Motivational
  '"You\'re doing better than you think you are."',
  '"Progress, not perfection."',
  '"Small steps still move you forward."',
  '"Your pace is the right pace."',
  '"Rest is productive. You\'ve earned it."',
  '"Consistency beats intensity. Keep showing up."',
  '"The hard days make the good days better."',
  '"You\'re building something sustainable, not just surviving."',
  '"Trust your process. It\'s working."',
  '"One client at a time. One day at a time."',

  // Business Wisdom
  '"Your boundaries protect your energy. Honor them."',
  '"Saying no to one thing means saying yes to yourself."',
  '"You can\'t pour from an empty cup. Take care of you first."',
  '"Quality over quantity. Every time."',
  '"Your reputation is built one happy client at a time."',
  '"Slow seasons are for rest. Busy seasons are for earning. Both are valid."',
  '"The best business advice: take your breaks."',
  '"Underpromise, overdeliver. You\'re already doing this."',
  '"Your skills are valuable. Price accordingly."',
  '"The clients who respect your time are the ones worth keeping."',

  // Funny & Light
  '"If you can handle a nervous Chihuahua, you can handle anything life throws at you."',
  '"Plot twist: the \'calm\' dog was not, in fact, calm."',
  '"Remember: the dog forgives you for the sanitary trim. Eventually."',
  '"You\'ve seen things. Impacted anal glands things."',
  '"That awkward moment when the dog looks better than you after a long day."',
  '"Somewhere out there, a Doodle owner thinks brushing is optional."',
  '"Today\'s forecast: 100% chance of fur in your coffee."',
  '"You didn\'t choose the groom life. The groom life chose you."',
  '"May your clippers stay sharp and your dogs stay still."',
  '"Another day of making dogs cute and owners cry happy tears."',

  // Self-Care Reminders
  '"Your back thanks you for taking breaks."',
  '"Drink water. Yes, even when you\'re busy."',
  '"Stretch those grooming muscles. Your future self will thank you."',
  '"A rested groomer is a better groomer."',
  '"You deserve the same care you give those pups."',
  '"Longevity in this career means protecting your body today."',
  '"Take the lunch break. The dogs will still be there."',
  '"Your mental health matters as much as any appointment."',
  '"It\'s okay to have an off day. Tomorrow is a fresh start."',
  '"You\'re allowed to be proud of yourself today."',

  // Additional Quotes - Wisdom & Inspiration
  '"The best time to plant a tree was 20 years ago. The second best time is now."',
  '"Success is not final, failure is not fatal: it is the courage to continue that counts."',
  '"Be the groomer you needed when you first started."',
  '"Every expert was once a beginner."',
  '"The only way to do great work is to love what you do."',
  '"Your energy is your currency. Spend it wisely."',
  '"Done is better than perfect."',
  '"You are exactly where you need to be."',
  '"The dogs you help today become the referrals of tomorrow."',
  '"Comparison is the thief of joy. Run your own race."',

  // Additional Quotes - Grooming Life
  '"That pre-bath shake? Consider it a baptism of fur."',
  '"You speak fluent bark, growl, and side-eye."',
  '"A good groomer knows: there\'s no such thing as a quick nail trim."',
  '"When they say \'he\'s never bitten anyone\' - prepare accordingly."',
  '"You\'ve mastered the art of the one-handed dog hold."',
  '"The \'before and after\' photos are your gallery of triumph."',
  '"Your scissors have seen more drama than a soap opera."',
  '"A Goldendoodle walks in... you know what\'s coming."',
  '"You\'re basically a dog whisperer with better tools."',
  '"They came in fluffy. They left fabulous."',

  // Additional Quotes - Encouragement
  '"You turned chaos into calm today."',
  '"Every dog you groom is a small victory."',
  '"Your patience is your superpower."',
  '"The trust a dog gives you is sacred. You\'ve earned it."',
  '"You made someone\'s best friend look their best."',
  '"That nervous dog who finally relaxed? That\'s because of you."',
  '"You handled the hard ones. That takes real skill."',
  '"Your gentle hands make all the difference."',
  '"Behind every great haircut is an even greater groomer."',
  '"You gave someone the gift of a happy, fresh pup today."',

  // Additional Quotes - Humor
  '"Fur is just glitter for dog people."',
  '"You\'ve negotiated with more difficult clients than most diplomats."',
  '"That one fur strand in your eye? A badge of honor."',
  '"Professional dog hugger is an underrated job title."',
  '"You have more lint rollers than most people have socks."',
  '"The vacuum cleaner is your second-best friend."',
  '"You can identify a dog breed by fur texture alone."',
  '"That \'quick bath\' was two hours ago."',
  '"Your car interior is 60% dog hair by volume."',
  '"You\'ve dried more dogs than a commercial laundromat."',

  // Additional Quotes - Business & Growth
  '"Every no-show is an unexpected break. Use it well."',
  '"Your rates reflect your worth. Don\'t discount yourself."',
  '"The best marketing is a dog that looks amazing."',
  '"Build your schedule around your life, not the other way around."',
  '"You\'re not just a groomer - you\'re a small business owner."',
  '"Cash flow is queen. Take care of your finances."',
  '"Your regulars are your foundation. Treasure them."',
  '"It\'s okay to fire clients who drain your energy."',
  '"Invest in yourself as much as you invest in your tools."',
  '"You\'re creating a career that works for you."',

  // Additional Quotes - Wellness & Balance
  '"Your hands need rest as much as they need work."',
  '"A five-minute break can save an hour of burnout."',
  '"Listen to your body. It knows when to pause."',
  '"Grooming is a marathon, not a sprint."',
  '"Protect your ears - the dryers can wait."',
  '"Standing all day is hard. Sit when you can."',
  '"Your future self thanks you for every stretch."',
  '"Balance isn\'t about doing everything. It\'s about doing what matters."',
  '"A calm mind makes for steady hands."',
  '"You can\'t give your best if you\'re running on empty."',
];

/**
 * Get the hourly quote based on the current date and hour
 * Uses a deterministic rotation so all users see the same quote each hour
 */
export function getDailyQuote(): string {
  const now = new Date();
  // Create a seed based on year, day of year, and hour for consistent hourly rotation
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hour = now.getHours();

  // Combine day and hour for unique hourly index
  const hourlyIndex = (dayOfYear * 24 + hour) % DAILY_QUOTES.length;
  return DAILY_QUOTES[hourlyIndex];
}

/**
 * Get a random quote (for testing or special occasions)
 */
export function getRandomQuote(): string {
  const randomIndex = Math.floor(Math.random() * DAILY_QUOTES.length);
  return DAILY_QUOTES[randomIndex];
}
