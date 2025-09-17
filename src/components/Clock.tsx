"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ClockCommonProps = {
  // Optional BCP 47 language tag, e.g. "en-US"; defaults to browser/OS.
  locale?: string;
  // Optional IANA time zone, e.g. "America/Chicago"; defaults to system.
  timeZone?: string;
};

export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState<Date>(() => new Date());
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    // Align immediate tick after mount to ensure client time.
    setNow(new Date());
    timerRef.current = window.setInterval(() => setNow(new Date()), intervalMs);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [intervalMs]);

  return now;
}

interface PlanetData {
  sunrise: string | null;
  sunset: string | null;
  isRetrograde: boolean | null;
}

const PLANETS = ["Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"];

export function ClockDate({ locale, timeZone }: ClockCommonProps) {
  const now = useNow(1000);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone,
      }),
    [locale, timeZone],
  );

  const text = formatter.format(now);

  return (
    <time dateTime={now.toISOString()} suppressHydrationWarning aria-live="polite">
      {text}
    </time>
  );
}

export function ClockTime({ locale, timeZone }: ClockCommonProps) {
  const now = useNow(1000);

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }),
    [locale, timeZone],
  );

  const text = formatter.format(now);

  return (
    <time dateTime={now.toISOString()} suppressHydrationWarning aria-live="polite">
      {text}
    </time>
  );
}

export default function Clock({ locale, timeZone }: ClockCommonProps) {
  const now = useNow(1000);
  const [planetData, setPlanetData] = useState<Record<string, PlanetData>>({});

  // Default observer location (e.g., Chicago) - can be made dynamic later
  const observer = useMemo(() => ({
    latitude: 41.8781,
    longitude: -87.6298,
    height: 180, // meters above sea level
  }), []);

  useEffect(() => {
    const fetchPlanetData = async () => {
      const currentData: Record<string, PlanetData> = {};
      const dateString = now.toISOString();

      for (const planet of PLANETS) {
        // Fetch sunrise
        const sunriseRes = await fetch(
          `/api/sunrise-sunset?latitude=${observer.latitude}&longitude=${observer.longitude}&height=${observer.height}&body=${planet}&date=${dateString}&direction=1`,
        );
        const sunriseData = await sunriseRes.json();

        // Fetch sunset
        const sunsetRes = await fetch(
          `/api/sunrise-sunset?latitude=${observer.latitude}&longitude=${observer.longitude}&height=${observer.height}&body=${planet}&date=${dateString}&direction=-1`,
        );
        const sunsetData = await sunsetRes.json();

        // Fetch retrograde status
        const retrogradeRes = await fetch(
          `/api/planet-retrograde?body=${planet}&date=${dateString}`,
        );
        const retrogradeData = await retrogradeRes.json();

        currentData[planet] = {
          sunrise: sunriseData.time,
          sunset: sunsetData.time,
          isRetrograde: retrogradeData.isRetrograde,
        };
      }
      setPlanetData(currentData);
    };

    fetchPlanetData();
  }, [now, observer]);

  const dateFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        timeZone,
      }),
    [locale, timeZone],
  );
  const timeFmt = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone,
      }),
    [locale, timeZone],
  );

  return (
    <span suppressHydrationWarning>
      <time dateTime={now.toISOString()} suppressHydrationWarning aria-live="polite">
        {dateFmt.format(now)} {timeFmt.format(now)}
      </time>
      <table className="planetary-table">
        <thead>
          <tr>
            <th colSpan={3}>
              {now.getHours() >= 1 && now.getHours() <= 12 ? (
                <span>&#9728; Hours 1-12</span>
              ) : (
                <span>&#9789; Hours 13-24</span>
              )}
            </th>
          </tr>
        </thead>
        <tbody>
          {PLANETS.map((planet) => (
            <tr key={planet}>
              <td className="planetary-cell">{planet}</td>
              <td>
                {planetData[planet]?.isRetrograde === true ? (
                  <span className="retrograde">Retrograde</span>
                ) : (
                  "Direct"
                )}
              </td>
              <td>
                Sunrise: {planetData[planet]?.sunrise ? new Date(planetData[planet].sunrise!).toLocaleTimeString(locale, { timeZone }) : "N/A"}
                <br />
                Sunset: {planetData[planet]?.sunset ? new Date(planetData[planet].sunset!).toLocaleTimeString(locale, { timeZone }) : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </span>
  );
}
