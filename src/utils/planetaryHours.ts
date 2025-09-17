interface SunEvent {
  date?: Date;
}

export function calculatePlanetaryHours(validSunrise: SunEvent, validSunset: SunEvent) {
  if (!validSunrise.date || !validSunset.date) {
    return null;
  }

  // Calculate the length of day and night in milliseconds
  const dayLengthMs = validSunset.date.getTime() - validSunrise.date.getTime();
  const nightLengthMs = (validSunrise.date.getTime() + 24 * 60 * 60 * 1000) - validSunset.date.getTime(); // Sunrise of next day

  // Calculate the duration of each day hour and night hour
  const dayHourDurationMs = dayLengthMs / 12;

  return {
    dayLengthMs,
    nightLengthMs,
    dayHourDurationMs,
  };
}
