import { AstroTime, MoonPhase, SearchMoonPhase } from '../components/astronomy';

/**
 * Calculates the day of the new moon cycle for a given date.
 * Day 1 is the day of the new moon.
 * @param date The date to calculate the moon cycle day for.
 * @returns The day number in the current new moon cycle (1-29 or 30).
 */
export function getMoonCycleDay(date: Date): number {
  const astroTime = new AstroTime(date);

  // Find the last new moon before or on the given date
  let lastNewMoonResult = SearchMoonPhase(0, astroTime, -30); // Search up to 30 days in the past
  if (!lastNewMoonResult) {
    // If no new moon found in the past 30 days, search forward from a very old date
    // This handles cases where the initial date is very early in the moon cycle
    lastNewMoonResult = SearchMoonPhase(0, new AstroTime(date.getTime() - 30 * 24 * 3600 * 1000), 60);
  }

  if (!lastNewMoonResult) {
    throw new Error("Could not determine the last new moon for the given date.");
  }

  const confirmedLastNewMoon: AstroTime = lastNewMoonResult;

  // Calculate the difference in days from the last new moon
  const diffDays = Math.floor((astroTime.ut as number) - (confirmedLastNewMoon.ut as number));

  // The cycle day is 1-indexed, so add 1 to the difference.
  // Use modulo MEAN_SYNODIC_MONTH (approx 29.53) to keep it within a cycle.
  // Since we need integer days, we'll use 29 or 30 as the cycle length.
  // For simplicity, let's assume a cycle length of 29.53 days, and round down for the day number.
  // The problem states "The pattern starts again every new moon", so we just need the day count from the last new moon.
  return (diffDays % Math.round(29.530588)) + 1;
}

/**
 * Determines the daily luck based on the day of the new moon cycle.
 * @param date The date to determine the luck for.
 * @returns 'lucky', 'unlucky', or 'neutral'.
 */
export function getDailyLuck(date: Date): 'lucky' | 'unlucky' | 'neutral' {
  const day = getMoonCycleDay(date);

  if (day === 1 || day === 2) {
    return 'lucky';
  } else if (day === 3 || day === 4) {
    return 'neutral';
  } else if (day === 5 || day === 15 || day === 25) {
    return 'unlucky';
  } else if (day === 7 || day === 14 || day === 17) {
    return 'lucky';
  } else {
    return 'neutral';
  }
}
