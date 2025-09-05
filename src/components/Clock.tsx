"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ClockCommonProps = {
  // Optional BCP 47 language tag, e.g. "en-US"; defaults to browser/OS.
  locale?: string;
  // Optional IANA time zone, e.g. "America/Chicago"; defaults to system.
  timeZone?: string;
};

function useNow(intervalMs = 1000) {
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
  // Combined clock if needed elsewhere.
  const now = useNow(1000);
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
      <time dateTime={now.toISOString()} aria-live="polite">
        {dateFmt.format(now)} {timeFmt.format(now)}
      </time>
    </span>
  );
}

